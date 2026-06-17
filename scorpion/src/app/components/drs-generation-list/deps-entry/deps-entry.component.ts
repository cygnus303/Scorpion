import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-deps-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './deps-entry.component.html',
  styleUrl: './deps-entry.component.scss'
})
export class DepsEntryComponent {
  public modalRef!: BsModalRef;
  public drsNo: string = '';
  public depsNo: string = '';
  public dateStr: string = '';
  public vendorName: string = '';
  public totalDeliveredDockets: number = 0;
  
  @Output() dataEmitter = new EventEmitter<void>();
  @ViewChild('TemplateDeps', { static: true }) TemplateDeps!: TemplateRef<any>;

  public depsForm!: FormGroup;
  public isLoading: boolean = false;
  public damageTypes: any[] = [];
  public activeBoxDropdownIndex: number | null = null;
  public severityLists: any[][] = [];

  public depsTypeList = [
    { value: 'D', label: '🔴 Damage' },
    { value: 'S', label: '🟠 Shortage' }
  ];

  constructor(
    private modalService: BsModalService,
    private prsdrsApiService: PRSDRSApiService,
    private thcMasterService: THCMasterService
  ) {}

  get docketsArray(): FormArray {
    return this.depsForm?.get('dockets') as FormArray;
  }

  createDocketFormGroup(item: any): FormGroup {
    const boxIds = [];
    const pkgsCount = item.pkgsno || 0;
    
    for (let k = 1; k <= pkgsCount; k++) {
      boxIds.push(`${item.dockno}_${k.toString().padStart(3, '0')}`);
    }

    if (item.depstype === 'D') {
      this.fetchDamageTypes();
    }

    return new FormGroup({
      dockno: new FormControl(item.dockno),
      dockdt: new FormControl(item.dockdt),
      orgncd: new FormControl(item.orgncd),
      destcd: new FormControl(item.destcd),
      pkgsno: new FormControl(item.pkgsno),
      invval: new FormControl(item.invval),
      depstype: new FormControl(item.depstype || null),
      damageType: new FormControl(item.damageType || null),
      severity: new FormControl(item.severity || null),
      affectedPkgs: new FormControl(item.affectedPkgs || 0),
      affectedInvVal: new FormControl(item.affectedInvVal || 0.00),
      remarks: new FormControl(item.remarks || ''),
      fileAttached: new FormControl(!!item.fileAttached),  
      fileName: new FormControl(item.fileName || ''),
      fileUrl: new FormControl(item.fileUrl || null),
      boxIds: new FormControl(boxIds),
      selectedBoxIds: new FormControl(item.selectedBoxIds || []),
      raw: new FormControl(item)
    });
  }

  showPopup(data: any, isEditMode: boolean = false) {
    this.drsNo = data.drsNo || '';
    this.depsNo = data.depsNo || '';
    this.vendorName = data.vendorName || '';
    this.totalDeliveredDockets = data.deliveredCount || data.totalDockets || 0;
    this.dateStr = data.drsDate

    this.isLoading = true;
    this.depsForm = new FormGroup({
      dockets: new FormArray([])
    });

    this.modalRef = this.modalService.show(this.TemplateDeps, {class: 'modal-xxl modal-dialog-centered deps-entry-modal-wrapper',backdrop: 'static'});

    if (this.drsNo) {
      this.fetchDamageTypes(() => {
        this.prsdrsApiService.GetDetForDepsDeclarationByTCNo(this.drsNo).subscribe({
          next: (response: any) => {
            this.isLoading = false;
            if (response && response.success && response.data) {
              const formArray = this.docketsArray;
              formArray.clear();
              this.severityLists = [];
              response.data.forEach((item: any, i: number) => {
                formArray.push(this.createDocketFormGroup(item));
                if (item.damageType) {
                  this.fetchSeverityDataForRow(i, item.damageType);
                } else {
                  this.severityLists[i] = [];
                }
              });
            }
          },
          error: (err: any) => {
            this.isLoading = false;
            console.error('Error fetching DEPS details:', err);
          }
        });
      });
    } else {
      this.isLoading = false;
    }
  }

  fetchDamageTypes(callback?: () => void) {
    if (this.damageTypes.length > 0) {
      if (callback) callback();
      return;
    }
    this.thcMasterService.getGeneralMasterDetail('DEPSTYP').subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.damageTypes = res.data;
        }
        if (callback) callback();
      },
      error: (err: any) => {
        console.error('Error fetching damage types:', err);
        if (callback) callback();
      }
    });
  }

  onDepsTypeChange(index: number) {
    const row = this.docketsArray.at(index) as FormGroup;
    const depstype = row.get('depstype')?.value;

    if (depstype === 'D') {
      this.fetchDamageTypes();
    } else {
      row.get('damageType')?.setValue(null);
      row.get('severity')?.setValue(null);
    }
  }

  onDamageTypeChange(index: number) {
    const row = this.docketsArray.at(index) as FormGroup;
    const damageType = row.get('damageType')?.value;

    row.get('severity')?.setValue(null);
    if (!damageType) {
      this.severityLists[index] = [];
    } else {
      this.fetchSeverityDataForRow(index, damageType);
    }
  }

  fetchSeverityDataForRow(index: number, damageTypeDesc: string) {
    if (!damageTypeDesc) {
      this.severityLists[index] = [];
      return;
    }

    if (damageTypeDesc) {
      this.prsdrsApiService.GetDESPSData(damageTypeDesc).subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            this.severityLists[index] = res.data;
          } else {
            this.severityLists[index] = [];
          }
        },
        error: (err: any) => {
          console.error(`Error fetching severity for codeId ${damageTypeDesc}:`, err);
          this.severityLists[index] = [];
        }
      });
    } else {
      this.severityLists[index] = [];
    }
  }

  toggleBoxDropdown(index: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeBoxDropdownIndex === index) {
      this.activeBoxDropdownIndex = null;
    } else {
      this.activeBoxDropdownIndex = index;
    }
  }

  toggleBoxSelection(rowIndex: number, boxId: string) {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const selectedCtrl = row.get('selectedBoxIds');
    if (selectedCtrl) {
      const currentSelected = selectedCtrl.value || [];
      let newSelected;
      if (currentSelected.includes(boxId)) {
        newSelected = currentSelected.filter((id: string) => id !== boxId);
      } else {
        newSelected = [...currentSelected, boxId];
      }
      selectedCtrl.setValue(newSelected);
      selectedCtrl.markAsDirty();

      const affectedPkgsCount = newSelected.length;
      row.get('affectedPkgs')?.setValue(affectedPkgsCount);

      const invval = row.get('invval')?.value || 0;
      let rawVal = 0.00;
      if (affectedPkgsCount > 0) {
        rawVal = invval / affectedPkgsCount;
        rawVal = Number(rawVal.toFixed(2));
      }
      row.get('affectedInvVal')?.setValue(rawVal);
    }
  }

  isBoxSelected(rowIndex: number, boxId: string): boolean {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const selectedCtrl = row.get('selectedBoxIds');
    return selectedCtrl ? selectedCtrl.value.includes(boxId) : false;
  }

  getSelectedBoxesLabel(rowIndex: number): string {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const selectedCtrl = row.get('selectedBoxIds');
    const selectedCount = selectedCtrl ? selectedCtrl.value.length : 0;
    if (selectedCount === 0) {
      return '— Select Box ID —';
    } else if (selectedCount === 1) {
      return '1 box selected';
    } else {
      return `${selectedCount} boxes selected`;
    }
  }

  onFileSelected(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const row = this.docketsArray.at(index) as FormGroup;
      row.get('fileName')?.setValue(file.name);
      row.get('fileAttached')?.setValue(true);
      
      const objectUrl = URL.createObjectURL(file);
      row.get('fileUrl')?.setValue(objectUrl);
    }
    input.value = '';
  }

  removeFile(index: number) {
    const row = this.docketsArray.at(index) as FormGroup;
    const currentUrl = row.get('fileUrl')?.value;
    if (currentUrl && currentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
    }
    row.get('fileName')?.setValue('');
    row.get('fileAttached')?.setValue(false);
    row.get('fileUrl')?.setValue(null);
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  saveDepsForm() {
    if (this.depsForm.invalid) {
      this.depsForm.markAllAsTouched();
      return;
    }
    console.log('Submitted DEPS Form Value:', this.depsForm.value);
    this.closePopup();
    this.dataEmitter.emit();
  }

  closeBoxDropdowns() {
    this.activeBoxDropdownIndex = null;
  }
}
