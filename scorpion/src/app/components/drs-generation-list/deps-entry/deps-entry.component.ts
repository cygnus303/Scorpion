import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DocketService } from 'app/shared/services/docket.service';
import { environment } from 'environments/environment';

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
  env = environment;

  @Output() dataEmitter = new EventEmitter<void>();
  @ViewChild('TemplateDeps', { static: true }) TemplateDeps!: TemplateRef<any>;

  public isEditMode: boolean = false;
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
    private thcMasterService: THCMasterService,
    private sweetAlertService: SweetAlertService,
    private docketService: DocketService
  ) { }

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

    const totalPkgsVal = +(item.bkG_PKGSNO || item.totalPkgs || item.pkgsno || 1);
    const initialAffectedPkgs = +(item.selectedBoxIds ? item.selectedBoxIds.length : (item.affectedPkgs || 0));
    let initialAffectedInvVal = Number(item.affectedInvVal || 0.00);
    if (!item.affectedInvVal && totalPkgsVal > 0 && initialAffectedPkgs > 0) {
      initialAffectedInvVal = Number((( (item.invval || 0) / totalPkgsVal ) * initialAffectedPkgs).toFixed(2));
    }

    return new FormGroup({
      dockno: new FormControl(item.dockno),
      docketsf: new FormControl(item.docksf || item.docketsf),
      dockdt: new FormControl(item.dockdt),
      orgncd: new FormControl(item.orgncd),
      destcd: new FormControl(item.destcd),
      pkgsno: new FormControl(item.pkgsno),
      bkG_PKGSNO: new FormControl(totalPkgsVal),
      invval: new FormControl(item.invval),
      depstype: new FormControl(item.depstype || null),
      damageType: new FormControl(item.damageType || null),
      severity: new FormControl(item.severity || null),
      affectedPkgs: new FormControl(initialAffectedPkgs),
      affectedInvVal: new FormControl(initialAffectedInvVal),
      remarks: new FormControl(item.remarks || ''),
      fileAttached: new FormControl(!!item.fileAttached),
      fileName: new FormControl(item.fileName || ''),
      fileUrl: new FormControl(item.fileUrl || null),
      fileBase64: new FormControl(''),
      boxIds: new FormControl(boxIds),
      selectedBoxIds: new FormControl(item.selectedBoxIds || []),
      depsNo: new FormControl(item.depsNo || ''),
      depsDate: new FormControl(item.depsDate || '')
    });
  }

  showPopup(data: any, isEditMode: boolean = false) {
    this.isEditMode = isEditMode;
    this.drsNo = data.drsNo || '';
    this.depsNo = data.depsNo || '';
    this.vendorName = data.vendorName || '';
    this.totalDeliveredDockets = data.deliveredCount || data.totalDockets || 0;
    this.dateStr = data.drsDate

    this.isLoading = true;
    this.depsForm = new FormGroup({
      dockets: new FormArray([])
    });

    this.modalRef = this.modalService.show(this.TemplateDeps, { class: 'modal-xxl modal-dialog-centered deps-entry-modal-wrapper', backdrop: 'static' });

    this.loadDepsData();
  }

  loadDepsData() {
    if (this.drsNo) {
      this.fetchDamageTypes(() => {
        if (this.isEditMode) {
          // EDIT MODE: Call only getHCCDynamicData to fetch existing exceptions
          this.thcMasterService.getHCCDynamicData({
            FilterJson: {
              ReportId: '365',
              Thcno: this.drsNo
            }
          }).subscribe({
            next: (editRes: any) => {
              this.isLoading = false;
              const editList = (editRes && editRes.success && editRes.data && editRes.data.Table1) || (editRes && editRes.Table1) || [];
              this.populateFormForEdit(editList);
            },
            error: (err: any) => {
              this.isLoading = false;
              console.error('Error loading edit DEPS data:', err);
              this.populateFormForEdit([]);
            }
          });
        } else {
          // ADD MODE: Call only GetDetForDepsDeclarationByTCNo to load all TC dockets
          this.prsdrsApiService.GetDetForDepsDeclarationByTCNo(this.drsNo).subscribe({
            next: (response: any) => {
              this.isLoading = false;
              if (response && response.success && response.data) {
                this.populateFormForAdd(response.data);
              } else {
                this.populateFormForAdd([]);
              }
            },
            error: (err: any) => {
              this.isLoading = false;
              console.error('Error loading DEPS details:', err);
              this.populateFormForAdd([]);
            }
          });
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  populateFormForAdd(docketsData: any[]) {
    const formArray = this.docketsArray;
    formArray.clear();
    this.severityLists = [];

    docketsData.forEach((docketItem: any, index: number) => {
      formArray.push(this.createDocketFormGroup(docketItem));
      this.severityLists[index] = [];
    });
  }

  populateFormForEdit(editList: any[]) {
    const formArray = this.docketsArray;
    formArray.clear();
    this.severityLists = [];
    editList.forEach((editItem: any, index: number) => {
      let prefilledItem = {
        dockno: editItem.dockno,
        docksf: editItem.docketsf,
        dockdt: editItem.dockdt || '',
        orgncd: editItem.orgncd || '',
        destcd: editItem.destcd || '',
        pkgsno: editItem.pkgsno,
        invval: editItem.Invval,
        depstype: editItem.depstype,
        damageType: editItem.DamageType,
        severity: editItem.Severity,
        remarks: editItem.Remark,
        depsNo: editItem.DEPSNo,
        depsDate: editItem.DepsDate,
        fileName: editItem.DepsImage,
        fileAttached: !!(editItem.DepsImage),
        fileUrl: '',
        affectedPkgs: editItem.affectedQty,
        selectedBoxIds: [] as string[],
        affectedInvVal: editItem.affectedInvVal
      };

      if (prefilledItem.fileName) {
        prefilledItem.fileUrl = `${this.env.liveUrl}Uploads/${prefilledItem.fileName}`;
      }

      const affectedQty = Number(editItem.Lossvalue || editItem.affectedQty || 0);
      prefilledItem.affectedPkgs = affectedQty;

      const boxIds = [];
      const totalPackagesCount = prefilledItem.pkgsno || 0;
      for (let k = 1; k <= totalPackagesCount; k++) {
        const suffix = k.toString().padStart(3, '0');
        boxIds.push(`${editItem.dockno}_${suffix}`);
      }
      prefilledItem.selectedBoxIds = boxIds.slice(0, affectedQty);

      if (affectedQty > 0) {
        prefilledItem.affectedInvVal = Number((prefilledItem.invval / affectedQty).toFixed(2));
      } else {
        prefilledItem.affectedInvVal = 0.00;
      }

      formArray.push(this.createDocketFormGroup(prefilledItem));

      if (prefilledItem.damageType) {
        this.fetchSeverityDataForRow(index, prefilledItem.damageType);
      } else {
        this.severityLists[index] = [];
      }
    });
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

  onDamageTypeChange(index: number, event: any) {
    const row = this.docketsArray.at(index) as FormGroup;
    // const damageType = row.get('damageType')?.value;

    row.get('severity')?.setValue(event.codeFor);
      // if (!damageType) {
      //   this.severityLists[index] = [];
      // } else {
      //   this.fetchSeverityDataForRow(index, damageType);
      // }
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

      const invval = +row.get('invval')?.value || 0;
      const totalPkgs = +row.get('bkG_PKGSNO')?.value || +row.get('pkgsno')?.value || 1;
      let rawVal = 0.00;
      if (totalPkgs > 0 && affectedPkgsCount > 0) {
        rawVal = (invval / totalPkgs) * affectedPkgsCount;
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

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.includes(',') ? result.split(',')[1] : result;
        row.get('fileBase64')?.setValue(base64String);
      };
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
    row.get('fileBase64')?.setValue('');
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

    const activeRows = this.docketsArray.controls.filter((c: any) => {
      const v = c.value;
      return (v.depsNo && v.depsNo.trim() !== '') || (v.affectedPkgs && v.affectedPkgs > 0);
    });
    if (activeRows.length === 0) {
      this.sweetAlertService.warning('Please declare at least one DEPS record (Damage/Shortage) with affected packages.');
      return;
    }

    this.isLoading = true;

    const depsData = activeRows.map((c: any) => {
      const v = c.value;
      return {
        documentNo: this.drsNo,
        docket: v.dockno || '', 
        docketsf: v.docketsf || '',
        pkgsDelivered: v.pkgsno || 0,
        totWeight: 0,
        affectedQty: v.affectedPkgs || 0,
        affectedWeight: 0,
        affectedInvVal: v.affectedInvVal || 0,
        fileName: v.fileName || '',
        depsfile: v.fileBase64 ? v.fileBase64 : '',
        reason: '',
        remarks: v.remarks || '',
        depsTyp: v.depstype || '',
        damageType: v.damageType || '',
        severity: v.severity || '',
        invval: v.invval || 0,
        depsNo: v.depsNo || ""
      };
    });

    const payload = {
      baseUserName: this.docketService.loginUserList?.BaseUserName,
      baseLoctaionCode: this.docketService.loginUserList?.LocationCode,
      depsData,
      type: this.isEditMode ? 'U' : 'A'
    };

    this.prsdrsApiService.submitDepsGeneration(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.data && (res.data.Status === 1)) {
          const successMsg = res.data.DepsId 
            ? `${res.data.Message || 'DEPS saved successfully!'} (ID: ${res.data.DepsId})`
            : (res.data.Message || 'DEPS saved successfully!');
          this.sweetAlertService.success(successMsg).then(() => {
            this.closePopup();
            this.dataEmitter.emit();
          });
        } else {
          this.sweetAlertService.error(res.data?.Message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.sweetAlertService.error(err?.error?.Message);
      }
    });
  }


  closeBoxDropdowns() {
    this.activeBoxDropdownIndex = null;
  }
}
