import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-godown-update-deps',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './godown-update-deps.component.html',
  styleUrl: './godown-update-deps.component.scss'
})
export class GodownUpdateDepsComponent implements OnInit, OnDestroy {
  @Output() depsSaved = new EventEmitter<{ docket: any; depsData: any[] }>();
  @Output() depsCancelled = new EventEmitter<{ docket: any; hasExisting: boolean }>();

  public showModal: boolean = false;
  public currentDocket: any = null;
  public depsForm!: FormGroup;

  public drsNo: string = '';
  public depsNo: string = '';
  public dateStr: string = '';
  public vendorName: string = '';
  public totalDeliveredDockets: number = 0;
  env = environment;

  public isSaved: boolean = false;
  public damageTypes: any[] = [];
  public activeBoxDropdownIndex: number | null = null;
  public hasExistingDeps: boolean = false;

  public depsTypeList = [
    { value: 'D', label: '🔴 Damage' },
    { value: 'S', label: '🟠 Shortage' }
  ];

  constructor(
    private thcMasterService: THCMasterService,
    private sweetAlertService: SweetAlertService
  ) {}

  ngOnInit() {
    this.initForm();
    this.fetchDamageTypes();
  }

  ngOnDestroy() {
    this.cleanupObjectUrls();
  }

  get docketsArray(): FormArray {
    return this.depsForm?.get('dockets') as FormArray;
  }

  initForm() {
    this.depsForm = new FormGroup({
      dockets: new FormArray([])
    });
  }

  fetchDamageTypes(callback?: () => void) {
    if (this.damageTypes && this.damageTypes.length > 0) {
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

  createDocketFormGroup(item: any): FormGroup {
    const boxIds: string[] = [];
    const pkgsCount = Number(item.deliveredPkgs !== undefined ? item.deliveredPkgs :
                            (item.pkgsno !== undefined ? item.pkgsno :
                            (item.Pkgs !== undefined ? item.Pkgs : 0))) || 0;

    const dockno = item.dockno || item.LRNumber || item.lrNo || item.docket || '';
    const docketsf = item.docksf || item.docketsf || '';

    for (let k = 1; k <= pkgsCount; k++) {
      boxIds.push(`${dockno}_${k.toString().padStart(3, '0')}`);
    }

    const depstype = item.depstype || item.depsTyp || null;
    if (depstype === 'D') {
      this.fetchDamageTypes();
    }

    const totalPkgsVal = Number(item.bkG_PKGSNO || item.totalPkgs || item.Pkgs || pkgsCount || 1);
    const initialAffectedPkgs = Number(item.selectedBoxIds ? item.selectedBoxIds.length :
                                      (item.affectedPkgs || item.affectedQty || 0));

    let initialAffectedInvVal = Number(item.affectedInvVal || 0.00);
    const invval = Number(item.invval !== undefined ? item.invval :
                          (item.InvoiceValue !== undefined ? item.InvoiceValue :
                          (item.InvVal !== undefined ? item.InvVal : 0))) || 0;

    if (!item.affectedInvVal && totalPkgsVal > 0 && initialAffectedPkgs > 0) {
      initialAffectedInvVal = Number(((invval / totalPkgsVal) * initialAffectedPkgs).toFixed(2));
    }

    return new FormGroup({
      dockno: new FormControl(dockno),
      docketsf: new FormControl(docketsf),
      dockdt: new FormControl(item.dockdt || item.LRDateText || item.LRDate || item.booking_Date || ''),
      orgncd: new FormControl(item.orgncd || item.OrgCode || ''),
      destcd: new FormControl(item.destcd || item.DestCode || ''),
      pkgsno: new FormControl(pkgsCount),
      bkG_PKGSNO: new FormControl(totalPkgsVal),
      invval: new FormControl(invval),
      depstype: new FormControl(depstype),
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

  openModal(docket: any) {
    this.currentDocket = docket;
    this.isSaved = false;
    this.activeBoxDropdownIndex = null;

    this.drsNo = docket.DRSNo || docket.drsNo || docket.GDNo || 'Godown Delivery';
    this.depsNo = docket.LRNumber || docket.dockno || docket.lrNo || '—';
    this.dateStr = docket.LRDateText || docket.LRDate || new Date().toISOString();
    this.totalDeliveredDockets = 1;

    this.initForm();
    const formArray = this.docketsArray;
    formArray.clear();

    const existing = docket.depsData;
    if (existing && Array.isArray(existing) && existing.length > 0) {
      this.hasExistingDeps = true;
      existing.forEach((item: any) => {
        formArray.push(this.createDocketFormGroup({ ...docket, ...item }));
      });
    } else if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      this.hasExistingDeps = true;
      formArray.push(this.createDocketFormGroup({ ...docket, ...existing }));
    } else {
      this.hasExistingDeps = false;
      formArray.push(this.createDocketFormGroup({ ...docket, depstype: 'D' }));
    }

    // Try fetching real invoice value if 0
    const firstGroup = formArray.at(0) as FormGroup;
    if (firstGroup && firstGroup.get('invval')?.value === 0 && docket.LRNumber) {
      this.thcMasterService.getDocketInvoiceDetails(docket.LRNumber).subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            const val = Number(res.data.invval || res.data.invoiceValue || res.data.InvVal || 0);
            if (val > 0) {
              formArray.controls.forEach((c: any) => {
                c.get('invval')?.setValue(val);
                this.recalculateInvVal(c);
              });
            }
          }
        },
        error: () => {}
      });
    }

    this.fetchDamageTypes();
    this.showModal = true;
  }

  addRow() {
    if (this.docketsArray.length >= 2) return;

    const row0 = this.docketsArray.at(0)?.value || {};
    if (!row0.depstype) {
      this.docketsArray.at(0)?.get('depstype')?.setValue('D');
      row0.depstype = 'D';
    }
    const firstType = row0.depstype;
    const nextType = firstType === 'D' ? 'S' : 'D';

    const newDocketItem = {
      ...this.currentDocket,
      ...row0,
      depstype: nextType,
      damageType: null,
      severity: null,
      remarks: '',
      fileAttached: false,
      fileName: '',
      fileUrl: null,
      fileBase64: '',
      selectedBoxIds: [],
      affectedPkgs: 0,
      affectedInvVal: 0
    };

    this.docketsArray.push(this.createDocketFormGroup(newDocketItem));
    if (nextType === 'D') {
      this.fetchDamageTypes();
    }
  }

  removeRow(index: number) {
    if (this.docketsArray.length > 1) {
      this.removeFile(index);
      this.docketsArray.removeAt(index);
    }
  }

  onDepsTypeChange(index: number) {
    const row = this.docketsArray.at(index) as FormGroup;
    const depstype = row.get('depstype')?.value;

    if (depstype === 'D') {
      this.fetchDamageTypes();
    } else {
      row.get('damageType')?.setValue(null);
      row.get('severity')?.setValue(null);
      this.removeFile(index);
    }

    // When 2 rows exist, ensure uniqueness: the other row automatically flips to the opposite type
    if (this.docketsArray.length > 1 && depstype) {
      const otherIndex = index === 0 ? 1 : 0;
      const otherRow = this.docketsArray.at(otherIndex) as FormGroup;
      const flippedType = depstype === 'D' ? 'S' : 'D';

      if (otherRow.get('depstype')?.value !== flippedType) {
        otherRow.get('depstype')?.setValue(flippedType);
        if (flippedType === 'D') {
          this.fetchDamageTypes();
        } else {
          otherRow.get('damageType')?.setValue(null);
          otherRow.get('severity')?.setValue(null);
          this.removeFile(otherIndex);
        }
      }
    }
  }

  onDamageTypeChange(index: number, event: any) {
    const row = this.docketsArray.at(index) as FormGroup;
    row.get('severity')?.setValue(event?.codeFor || '');
  }

  toggleBoxDropdown(index: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeBoxDropdownIndex === index) {
      this.activeBoxDropdownIndex = null;
    } else {
      this.activeBoxDropdownIndex = index;
    }
  }

  closeBoxDropdowns() {
    this.activeBoxDropdownIndex = null;
  }

  isBoxSelectedInOtherRow(rowIndex: number, boxId: string): boolean {
    if (this.docketsArray.length <= 1) return false;
    const otherIndex = rowIndex === 0 ? 1 : 0;
    const otherCtrl = this.docketsArray.at(otherIndex)?.get('selectedBoxIds');
    const otherSelected: string[] = otherCtrl?.value || [];
    return otherSelected.includes(boxId);
  }

  toggleBoxSelection(rowIndex: number, boxId: string) {
    if (this.isBoxSelectedInOtherRow(rowIndex, boxId)) {
      return;
    }
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const selectedCtrl = row.get('selectedBoxIds');
    if (selectedCtrl) {
      const currentSelected: string[] = selectedCtrl.value || [];
      let newSelected: string[];
      if (currentSelected.includes(boxId)) {
        newSelected = currentSelected.filter((id: string) => id !== boxId);
      } else {
        newSelected = [...currentSelected, boxId];
      }
      selectedCtrl.setValue(newSelected);
      selectedCtrl.markAsDirty();

      const affectedPkgsCount = newSelected.length;
      row.get('affectedPkgs')?.setValue(affectedPkgsCount);
      this.recalculateInvVal(row);
    }
  }

  recalculateInvVal(row: FormGroup) {
    const affectedPkgs = Number(row.get('affectedPkgs')?.value) || 0;
    const invval = Number(row.get('invval')?.value) || 0;
    const totalPkgs = Number(row.get('bkG_PKGSNO')?.value) || Number(row.get('pkgsno')?.value) || 1;
    let rawVal = 0.00;
    if (totalPkgs > 0 && affectedPkgs > 0) {
      rawVal = Number(((invval / totalPkgs) * affectedPkgs).toFixed(2));
    }
    row.get('affectedInvVal')?.setValue(rawVal);
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
    if (!row) return;
    const currentUrl = row.get('fileUrl')?.value;
    if (currentUrl && currentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
    }
    row.get('fileName')?.setValue('');
    row.get('fileAttached')?.setValue(false);
    row.get('fileUrl')?.setValue(null);
    row.get('fileBase64')?.setValue('');
  }

  cleanupObjectUrls() {
    if (!this.depsForm) return;
    for (let i = 0; i < this.docketsArray.length; i++) {
      this.removeFile(i);
    }
  }

  hasInvalidDepsRows(): boolean {
    return this.docketsArray.controls.some((c: any) => {
      const v = c.value;
      if (v.depstype) {
        if (!v.selectedBoxIds || v.selectedBoxIds.length === 0) return true;
        if (v.depstype === 'D' && !v.fileAttached && !v.fileName) return true;
        if (v.depstype === 'D' && !v.damageType) return true;
      } else {
        return true;
      }
      return false;
    });
  }

  closePopup() {
    this.closeBoxDropdowns();
    this.showModal = false;
    this.depsCancelled.emit({
      docket: this.currentDocket,
      hasExisting: this.hasExistingDeps
    });
  }

  saveDepsForm() {
    if (this.depsForm.invalid || this.hasInvalidDepsRows()) {
      this.depsForm.markAllAsTouched();
      this.sweetAlertService.warning('Please complete all mandatory fields: DEPS Type, Box ID, and File Upload (for Damage).');
      return;
    }

    const activeRows = this.docketsArray.controls.filter((c: any) => {
      const v = c.value;
      return (v.selectedBoxIds && v.selectedBoxIds.length > 0) || (v.affectedPkgs && v.affectedPkgs > 0);
    });

    if (activeRows.length === 0) {
      this.sweetAlertService.warning('Please declare at least one DEPS record (Damage/Shortage) with selected boxes.');
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
        depstype: v.depstype || '',
        damageType: v.damageType || '',
        severity: v.severity || '',
        invval: Number(v.invval) || 0,
        depsNo: v.depsNo || '',
        fileUrl: v.fileUrl,
        selectedBoxIds: v.selectedBoxIds,
        fileAttached: v.fileAttached,
        booking_Date: v.dockdt,
        orgncd: v.orgncd,
        destcd: v.destcd
      };
    });

    this.isSaved = true;
    this.showModal = false;
    this.depsSaved.emit({
      docket: this.currentDocket,
      depsData: depsData
    });
  }

  formatDate(val: any): string {
    if (!val) return '—';
    if (typeof val === 'string' && val.includes('-') && isNaN(Date.parse(val))) {
      return val;
    }
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const day = String(d.getDate()).padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
      }
    } catch (e) {}
    return String(val);
  }
}
