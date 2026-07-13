import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-drs-update-deps',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './drs-update-deps.component.html',
  styleUrls: ['./drs-update-deps.component.scss']
})
export class DrsUpdateDepsComponent {
  public modalRef!: BsModalRef;
  public drsNo: string = '';
  public depsNo: string = '';
  public dateStr: string = '';
  public vendorName: string = '';
  public totalDeliveredDockets: number = 0;
  env = environment;

  @Output() dataEmitter = new EventEmitter<any>();
  @ViewChild('TemplateDeps', { static: true }) TemplateDeps!: TemplateRef<any>;

  public depsForm!: FormGroup;
  public damageTypes: any[] = [];
  public activeBoxDropdownIndex: number | null = null;
  public severityLists: any[][] = [];

  public depsTypeList = [
    { value: 'D', label: '🔴 Damage' },
    { value: 'S', label: '🟠 Shortage' }
  ];

  public rowDataIndex: number = -1;

  constructor(
    private modalService: BsModalService,
    private prsdrsApiService: PRSDRSApiService,
    private thcMasterService: THCMasterService,
    private sweetAlertService: SweetAlertService
  ) { }

  get docketsArray(): FormArray {
    return this.depsForm?.get('dockets') as FormArray;
  }

  createDocketFormGroup(item: any): FormGroup {
    const boxIds = [];
    const pkgsCount = item.deliveredPkgs || item.pkgsDelivered || item.pkgsno || 0;

    const dockno = item.dockno || item.docket;
    for (let k = 1; k <= pkgsCount; k++) {
      boxIds.push(`${dockno}_${k.toString().padStart(3, '0')}`);
    }

    const depstype = item.depstype || item.depsTyp;
    if (depstype === 'D') {
      this.fetchDamageTypes();
    }

    const totalPkgsVal = +(item.bkG_PKGSNO || item.totalPkgs || (item.pkgsno && +item.pkgsno > pkgsCount ? +item.pkgsno : 0) || pkgsCount || 1);
    const initialAffectedPkgs = +(item.selectedBoxIds ? item.selectedBoxIds.length : (item.affectedPkgs || item.affectedQty || 0));
    let initialAffectedInvVal = Number(item.affectedInvVal || 0.00);
    if (!item.affectedInvVal && totalPkgsVal > 0 && initialAffectedPkgs > 0) {
      initialAffectedInvVal = Number((( (item.invval || 0) / totalPkgsVal ) * initialAffectedPkgs).toFixed(2));
    }

    return new FormGroup({
      dockno: new FormControl(dockno),
      docketsf: new FormControl(item.docksf || item.docketsf || ''),
      dockdt: new FormControl(item.booking_Date),
      orgncd: new FormControl(item.orgncd),
      destcd: new FormControl(item.destcd),
      pkgsno: new FormControl(pkgsCount),
      bkG_PKGSNO: new FormControl(totalPkgsVal),
      invval: new FormControl(item.invval),
      depstype: new FormControl(depstype || null),
      damageType: new FormControl(item.damageType || null),
      severity: new FormControl(item.severity || null),
      affectedPkgs: new FormControl(initialAffectedPkgs),
      affectedInvVal: new FormControl(initialAffectedInvVal),
      remarks: new FormControl(item.remarks || ''),
      fileAttached: new FormControl(!!item.fileAttached),
      fileName: new FormControl(item.fileName || ''),
      fileUrl: new FormControl(item.fileUrl || null),
      fileBase64: new FormControl(item.fileBase64 || item.depsfile || ''),
      boxIds: new FormControl(boxIds),
      selectedBoxIds: new FormControl(item.selectedBoxIds || []),
      depsNo: new FormControl(item.depsNo || ''),
      depsDate: new FormControl(item.depsDate || '')
    });
  }

  showPopup(data: any, drsNo: string, dateStr: string, vendorName: string, totalDeliveredDockets: number, index: number) {
    this.drsNo = drsNo;
    this.dateStr = dateStr;
    this.vendorName = vendorName;
    this.totalDeliveredDockets = totalDeliveredDockets;
    this.rowDataIndex = index;

    this.depsForm = new FormGroup({
      dockets: new FormArray([])
    });

    this.modalRef = this.modalService.show(this.TemplateDeps, { class: 'modal-xxl modal-dialog-centered deps-entry-modal-wrapper', backdrop: 'static' });

    // Ensure we populate any existing depsData if it was previously saved but not submitted yet
    const formData = data.depsData ? data.depsData : data;
    this.populateFormForAdd([formData]);
  }

  populateFormForAdd(docketsData: any[]) {
    const formArray = this.docketsArray;
    formArray.clear();
    this.severityLists = [];

    docketsData.forEach((docketItem: any, index: number) => {
      formArray.push(this.createDocketFormGroup(docketItem));
      this.severityLists[index] = [];
      if (docketItem.damageType) {
        this.fetchSeverityDataForRow(index, docketItem.damageType);
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

    const missingDamageFile = activeRows.find((c: any) => c.value.depstype === 'D' && !c.value.fileAttached);
    if (missingDamageFile) {
      this.sweetAlertService.warning(`File upload is required for Damage record on Docket ${missingDamageFile.value.dockno || ''}.`);
      return;
    }

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
        invval: Number(v.invval) || 0,
        depsNo: v.depsNo || "",
        // For local display state (only keeping fields not present in API payload)
        fileUrl: v.fileUrl,
        selectedBoxIds: v.selectedBoxIds,
        fileAttached: v.fileAttached,
        booking_Date: v.dockdt,
        orgncd: v.orgncd,
        destcd: v.destcd
      };
    });

    // Instead of calling API here, we emit it to the parent to save in its form state.
    this.dataEmitter.emit({
      rowIndex: this.rowDataIndex,
      depsData: depsData[0]
    });

    this.closePopup();
  }

  closeBoxDropdowns() {
    this.activeBoxDropdownIndex = null;
  }
}
