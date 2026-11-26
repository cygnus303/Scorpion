import { ChangeDetectorRef, Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { DocketService } from 'app/shared/services/docket.service';
import { environment } from 'environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-thc-departure-confirm-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  providers: [BsModalService],
  templateUrl: './thc-departure-confirm-popup.component.html',
  styleUrl: './thc-departure-confirm-popup.component.scss'
})
export class ThcDepartureConfirmPopupComponent {
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() departSuccess: EventEmitter<any> = new EventEmitter<any>();

  public modalRef?: BsModalRef;
  public isLoading: boolean = false;
  public isSubmitting: boolean = false;

  public thcList: any[] = [];
  public selectedThcIndex: number = 0;
  public manifestsByThc: { [thcno: string]: any[] } = {};
  public modelsByThc: { [thcno: string]: any } = {};

  // Incoming Seal Form & Check logic (Matching THC Arrival / Stock Update)
  public sealForm!: FormGroup;
  public apiSealNo: string = '';
  public apiSealList: string[] = [];
  public expectedSealCount: number = 1;
  public isStatusFrozen: boolean = false;

  public Seallist = [
    { text: 'Ok', value: 'Ok' },
    { text: 'Broken', value: 'Broken' },
    { text: 'Unsealed', value: 'Unsealed' }
  ];
  public matchSeallist = [
    { text: 'Ok', value: 'Ok' }
  ];
  public mismatchSeallist = [
    { text: 'Broken', value: 'Broken' },
    { text: 'Unsealed', value: 'Unsealed' }
  ];
  public activeSeallist: any[] = [...this.Seallist];

  public incomingSealDataByThc: { [thcno: string]: { isn: string, isn2: string, isn3: string, status: string } } = {};
  public apiSealNoByThc: { [thcno: string]: string } = {};
  public apiSealListByThc: { [thcno: string]: string[] } = {};
  public expectedSealCountByThc: { [thcno: string]: number } = {};

  // Departure Outgoing Inputs
  public outgoingRemarks: string = '';
  public remarksTouched: boolean = false;

  public sealNo: string = '';
  public sealNoTouched: boolean = false;
  public sealNo2: string = '';
  public sealNo2Touched: boolean = false;
  public sealNo3: string = '';
  public sealNo3Touched: boolean = false;
  public sealCount: number = 1;

  public sealNoByThc: { [thcno: string]: string } = {};
  public sealDataByThc: { [thcno: string]: { count: number, s1: string, s2: string, s3: string } } = {};
  public errorMessage: string = '';
  public isFromArrival: boolean = false;
  public arrivalSealNumber: string = '';
  public arrivalSealNoByThc: { [thcno: string]: string } = {};

  public env = environment;

  constructor(
    private modalService: BsModalService,
    private thcService: THCMasterService,
    public docketService: DocketService,
    private cdr: ChangeDetectorRef
  ) {
    this.buildSealForm();
  }

  buildSealForm() {
    this.isStatusFrozen = true;
    this.activeSeallist = [...this.mismatchSeallist];
    this.sealForm = new FormGroup({
      ISN: new FormControl(''),
      ISN2: new FormControl('', [Validators.maxLength(6)]),
      ISN3: new FormControl('', [Validators.maxLength(6)]),
      s2id_Status: new FormControl('')
    });

    this.sealForm.get('ISN')?.valueChanges.subscribe(() => {
      this.validateAllSeals();
    });
    this.sealForm.get('ISN2')?.valueChanges.subscribe(() => {
      this.validateAllSeals();
    });
    this.sealForm.get('ISN3')?.valueChanges.subscribe(() => {
      this.validateAllSeals();
    });
    this.sealForm.get('s2id_Status')?.valueChanges.subscribe(status => {
      this.onStatusChange(status);
    });
  }

  setupSealFormControls() {
    const isnCtrl = this.sealForm?.get('ISN');
    const isn2Ctrl = this.sealForm?.get('ISN2');
    const isn3Ctrl = this.sealForm?.get('ISN3');

    isnCtrl?.setValidators([Validators.required, Validators.maxLength(6)]);
    isnCtrl?.updateValueAndValidity({ emitEvent: false });

    if (this.expectedSealCount >= 2) {
      isn2Ctrl?.setValidators([Validators.required, Validators.maxLength(6)]);
    } else {
      isn2Ctrl?.clearValidators();
      isn2Ctrl?.setValue('', { emitEvent: false });
    }
    isn2Ctrl?.updateValueAndValidity({ emitEvent: false });

    if (this.expectedSealCount >= 3) {
      isn3Ctrl?.setValidators([Validators.required, Validators.maxLength(6)]);
    } else {
      isn3Ctrl?.clearValidators();
      isn3Ctrl?.setValue('', { emitEvent: false });
    }
    isn3Ctrl?.updateValueAndValidity({ emitEvent: false });
  }

  parseApiSeals(rawSeal: string) {
    if (!rawSeal) {
      this.apiSealList = [];
      this.expectedSealCount = 1;
      return;
    }
    const seals = rawSeal
      .split(',')
      .map(s => s.trim())
      .filter(s => s && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined');
    this.apiSealList = seals;
    this.expectedSealCount = seals.length > 0 ? Math.min(seals.length, 3) : 1;
  }

  validateAllSeals() {
    if (!this.sealForm) return;

    const s1 = (this.sealForm.get('ISN')?.value || '').toString().trim();
    const s2 = (this.sealForm.get('ISN2')?.value || '').toString().trim();
    const s3 = (this.sealForm.get('ISN3')?.value || '').toString().trim();

    const isnCtrl = this.sealForm.get('ISN');
    const isn2Ctrl = this.sealForm.get('ISN2');
    const isn3Ctrl = this.sealForm.get('ISN3');
    const statusControl = this.sealForm.get('s2id_Status');

    // Case 1: No seal in API
    if (this.apiSealList.length === 0) {
      this.activeSeallist = [...this.Seallist];
      this.isStatusFrozen = false;
      if (!s1) {
        isnCtrl?.setErrors({ required: true });
      } else if (s1.length > 6) {
        isnCtrl?.setErrors({ maxlength: true });
      } else {
        isnCtrl?.setErrors(null);
      }
      this.saveCurrentThcIncomingSealData();
      this.cdr.detectChanges();
      return;
    }

    // Case 2: API has seals
    const activeControls = [isnCtrl];
    const enteredValues = [s1];
    if (this.expectedSealCount >= 2) {
      activeControls.push(isn2Ctrl);
      enteredValues.push(s2);
    }
    if (this.expectedSealCount >= 3) {
      activeControls.push(isn3Ctrl);
      enteredValues.push(s3);
    }

    let anyEmpty = false;
    activeControls.forEach((ctrl, idx) => {
      const val = enteredValues[idx];
      if (!val) {
        ctrl?.setErrors({ required: true });
        anyEmpty = true;
      } else if (val.length > 6) {
        ctrl?.setErrors({ maxlength: true });
      }
    });

    if (anyEmpty) {
      this.isStatusFrozen = true;
      this.activeSeallist = [...this.mismatchSeallist];
      if (statusControl?.value === 'Ok') {
        statusControl?.setValue(null, { emitEvent: false });
      }
      this.saveCurrentThcIncomingSealData();
      this.cdr.detectChanges();
      return;
    }

    // Check if ALL entered seals match the API seals (sorted comparison)
    const expectedSorted = [...this.apiSealList.slice(0, this.expectedSealCount)].map(s => s.toLowerCase()).sort();
    const enteredSorted = [...enteredValues].map(s => s.toLowerCase()).sort();
    const allMatched = JSON.stringify(expectedSorted) === JSON.stringify(enteredSorted);

    if (allMatched) {
      this.activeSeallist = [...this.matchSeallist];
      statusControl?.setValue('Ok', { emitEvent: false });
      this.isStatusFrozen = true;
      activeControls.forEach(ctrl => ctrl?.setErrors(null));
      statusControl?.setErrors(null);
    } else {
      // Ok is strictly EXCLUDED when mismatch occurs; only Broken & Unsealed are shown
      this.activeSeallist = [...this.mismatchSeallist];
      this.isStatusFrozen = false;
      if (statusControl?.value === 'Ok') {
        statusControl?.setValue(null, { emitEvent: false });
      }

      const currentStatus = statusControl?.value;
      if (currentStatus === 'Broken' || currentStatus === 'Unsealed') {
        activeControls.forEach(ctrl => {
          if (!ctrl?.errors?.['required'] && !ctrl?.errors?.['maxlength']) {
            ctrl?.setErrors(null);
          }
        });
      } else {
        activeControls.forEach((ctrl, idx) => {
          const val = enteredValues[idx];
          const matchesAnyExpected = this.apiSealList.some(exp => exp.toLowerCase() === val.toLowerCase());
          const countInEntered = enteredValues.filter(v => v.toLowerCase() === val.toLowerCase()).length;
          if (!matchesAnyExpected || countInEntered > 1) {
            ctrl?.setErrors({ sealMismatch: true });
          } else {
            ctrl?.setErrors(null);
          }
        });
      }
    }
    this.saveCurrentThcIncomingSealData();
    this.cdr.detectChanges();
  }

  onStatusDropdownOpen() {
    this.validateAllSeals();
    this.cdr.detectChanges();
  }

  onStatusChange(status: any) {
    this.validateAllSeals();
  }

  onSealInput(event: any, controlName: string = 'ISN'): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const cleanValue = (input.value || '').replace(/\D/g, '').slice(0, 6);
    if (input.value !== cleanValue) {
      input.value = cleanValue;
      this.sealForm?.get(controlName)?.setValue(cleanValue, { emitEvent: true });
    }
  }

  onlyNumberKey(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  saveCurrentThcIncomingSealData() {
    if (!this.currentThc || !this.sealForm) return;
    this.incomingSealDataByThc[this.currentThc.thcno] = {
      isn: this.sealForm.get('ISN')?.value || '',
      isn2: this.sealForm.get('ISN2')?.value || '',
      isn3: this.sealForm.get('ISN3')?.value || '',
      status: this.sealForm.get('s2id_Status')?.value || ''
    };
  }

  loadIncomingSealDataForCurrentThc() {
    if (!this.currentThc) return;
    const rawSeal = this.apiSealNoByThc[this.currentThc.thcno] || '';
    this.apiSealNo = rawSeal;
    this.parseApiSeals(rawSeal);
    this.setupSealFormControls();

    const saved = this.incomingSealDataByThc[this.currentThc.thcno];
    if (saved) {
      this.sealForm.patchValue({
        ISN: saved.isn,
        ISN2: saved.isn2,
        ISN3: saved.isn3,
        s2id_Status: saved.status
      }, { emitEvent: false });
    } else {
      this.sealForm.patchValue({
        ISN: '',
        ISN2: '',
        ISN3: '',
        s2id_Status: ''
      }, { emitEvent: false });
    }
    this.validateAllSeals();
  }

  get currentThc(): any {
    return this.thcList[this.selectedThcIndex] || null;
  }

  get currentThcModel(): any {
    return this.currentThc ? this.modelsByThc[this.currentThc.thcno] : null;
  }

  get currentManifests(): any[] {
    return this.currentThc ? (this.manifestsByThc[this.currentThc.thcno] || []) : [];
  }

  showPopup(thcList: any[], isFromArrival: boolean = false) {
    this.isFromArrival = isFromArrival;
    this.thcList = (thcList || []).map(thc => {
      if (typeof thc === 'string') {
        return { thcno: thc, thcNo: thc };
      }
      return {
        ...thc,
        thcno: thc?.thcno || thc?.thcNo,
        thcNo: thc?.thcno || thc?.thcNo
      };
    });
    this.selectedThcIndex = 0;
    this.sealCount = 1;
    this.sealNo = '';
    this.sealNoTouched = false;
    this.sealNo2 = '';
    this.sealNo2Touched = false;
    this.sealNo3 = '';
    this.sealNo3Touched = false;
    this.sealNoByThc = {};
    this.sealDataByThc = {};
    this.outgoingRemarks = '';
    this.remarksTouched = false;
    this.errorMessage = '';
    this.manifestsByThc = {};
    this.modelsByThc = {};
    this.arrivalSealNumber = '';
    this.arrivalSealNoByThc = {};

    // Reset Incoming Seal Form & Data completely
    this.incomingSealDataByThc = {};
    this.apiSealNoByThc = {};
    this.apiSealListByThc = {};
    this.expectedSealCountByThc = {};
    this.apiSealNo = '';
    this.apiSealList = [];
    this.expectedSealCount = 1;
    this.isStatusFrozen = true;
    if (this.sealForm) {
      this.sealForm.reset({
        ISN: '',
        ISN2: '',
        ISN3: '',
        s2id_Status: ''
      }, { emitEvent: false });
      this.sealForm.markAsPristine();
      this.sealForm.markAsUntouched();
    }

    if (this.thcList.length === 0) {
      return;
    }

    this.modalRef = this.modalService.show(this.Templatepod, {
      class: 'modal-xl modal-dialog-centered',
      backdrop: 'static',
      keyboard: false
    });

    this.loadDepartureDetails();
  }

  closePopup() {
    this.modalRef?.hide();
    if (this.sealForm) {
      this.sealForm.reset({
        ISN: '',
        ISN2: '',
        ISN3: '',
        s2id_Status: ''
      }, { emitEvent: false });
      this.sealForm.markAsPristine();
      this.sealForm.markAsUntouched();
    }
    this.incomingSealDataByThc = {};
    this.apiSealNoByThc = {};
    this.apiSealListByThc = {};
    this.expectedSealCountByThc = {};
    this.apiSealNo = '';
    this.apiSealList = [];
    this.expectedSealCount = 1;
    this.isStatusFrozen = true;
    this.sealNo = '';
    this.sealNo2 = '';
    this.sealNo3 = '';
    this.sealCount = 1;
    this.outgoingRemarks = '';
    this.errorMessage = '';
  }

  addSeal() {
    if (this.sealCount < 3) {
      this.sealCount++;
      if (this.currentThc) {
        this.saveCurrentThcSealData();
      }
    }
  }

  removeSeal(index: number) {
    if (index === 2) {
      if (this.sealCount === 3) {
        this.sealNo2 = this.sealNo3;
        this.sealNo3 = '';
        this.sealNo3Touched = false;
      } else {
        this.sealNo2 = '';
        this.sealNo2Touched = false;
      }
      this.sealCount--;
    } else if (index === 3) {
      this.sealNo3 = '';
      this.sealNo3Touched = false;
      this.sealCount--;
    }
    if (this.currentThc) {
      this.saveCurrentThcSealData();
    }
  }

  hasDuplicateSeals(): boolean {
    const s1 = (this.sealNo || '').trim();
    const s2 = (this.sealNo2 || '').trim();
    const s3 = (this.sealNo3 || '').trim();

    const activeSeals: string[] = [];
    if (s1) activeSeals.push(s1);
    if (this.sealCount >= 2 && s2) activeSeals.push(s2);
    if (this.sealCount >= 3 && s3) activeSeals.push(s3);

    const uniqueSeals = new Set(activeSeals);
    return uniqueSeals.size !== activeSeals.length;
  }

  getFormattedSealNumbers(): string {
    const s1 = (this.sealNo || '').trim();
    const s2 = (this.sealNo2 || '').trim();
    const s3 = (this.sealNo3 || '').trim();

    const seals: string[] = [];
    if (s1) seals.push(s1);
    if (this.sealCount >= 2 && s2) seals.push(s2);
    if (this.sealCount >= 3 && s3) seals.push(s3);

    return seals.join(',');
  }

  saveCurrentThcSealData() {
    if (!this.currentThc) return;
    this.sealDataByThc[this.currentThc.thcno] = {
      count: this.sealCount,
      s1: this.sealNo,
      s2: this.sealNo2,
      s3: this.sealNo3
    };
    this.sealNoByThc[this.currentThc.thcno] = this.getFormattedSealNumbers();
  }

  parseIncomingSeal(raw: string) {
    if (!raw) {
      this.sealCount = 1;
      this.sealNo = '';
      this.sealNo2 = '';
      this.sealNo3 = '';
      return;
    }
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    this.sealCount = parts.length > 0 ? Math.min(parts.length, 3) : 1;
    this.sealNo = parts[0] || '';
    this.sealNo2 = parts[1] || '';
    this.sealNo3 = parts[2] || '';
  }

  onSealNoChange(val: string, index: number = 1) {
    if (val) {
      val = val.replace(/[^0-9]/g, '');
    }
    if (index === 1) {
      this.sealNo = val;
    } else if (index === 2) {
      this.sealNo2 = val;
    } else if (index === 3) {
      this.sealNo3 = val;
    }
    if (this.currentThc) {
      this.saveCurrentThcSealData();
    }
    this.errorMessage = '';
  }

  selectThcTab(index: number) {
    if (this.currentThc) {
      this.saveCurrentThcSealData();
      this.saveCurrentThcIncomingSealData();
    }
    this.selectedThcIndex = index;
    if (this.currentThc) {
      const data = this.sealDataByThc[this.currentThc.thcno];
      if (data) {
        this.sealCount = data.count;
        this.sealNo = data.s1;
        this.sealNo2 = data.s2;
        this.sealNo3 = data.s3;
      } else {
        const raw = this.sealNoByThc[this.currentThc.thcno] || '';
        this.parseIncomingSeal(raw);
      }
      this.loadIncomingSealDataForCurrentThc();
    }
    this.errorMessage = '';
  }

  isValidSealNo(val: string): boolean {
    if (!val) return false;
    return /^[0-9]{6}$/.test(val.trim());
  }

  isDepartDisabled(): boolean {
    if (this.isSubmitting || this.isLoading) {
      return true;
    }
    if (!this.outgoingRemarks || !this.outgoingRemarks.trim()) {
      return true;
    }
    if (!this.isFromArrival) {
      if (this.sealForm && this.sealForm.invalid) {
        return true;
      }
      if (!this.sealNo || !this.isValidSealNo(this.sealNo)) {
        return true;
      }
      if (this.sealCount >= 2 && this.sealNo2 && this.sealNo2.trim() && !this.isValidSealNo(this.sealNo2)) {
        return true;
      }
      if (this.sealCount >= 3 && this.sealNo3 && this.sealNo3.trim() && !this.isValidSealNo(this.sealNo3)) {
        return true;
      }
      if (this.hasDuplicateSeals()) {
        return true;
      }
    }
    return false;
  }

  loadDepartureDetails() {
    this.isLoading = true;
    const baseLocationCode = this.docketService.loginUserList?.LocationCode || '';

    const requests = this.thcList.map(thc => {
      const payload = {
        thcNo: thc.thcno,
        baseLocationCode: baseLocationCode || thc.thcbr || ''
      };
      return this.thcService.getDepartureDetail(payload).pipe(
        catchError(err => {
          console.error(`Error loading departure detail for THC ${thc.thcno}:`, err);
          return of({ thcDepList: [], thcDepModel: {} });
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        this.isLoading = false;
        responses.forEach((res, idx) => {
          const thc = this.thcList[idx];
          const rawList = res?.thcDepList || [];
          const mappedList = rawList.map((m: any) => ({
            ...m,
            isChecked: this.isFromArrival ? true : false,
            parentThc: thc
          }));

          this.manifestsByThc[thc.thcno] = mappedList;
          this.modelsByThc[thc.thcno] = res?.thcDepModel || {};

          // Incoming Seal from thcDepModel (sealno_in or sealno)
          const modelSeal = (res?.thcDepModel?.sealno_in || res?.thcDepModel?.sealno || res?.thcDepModel?.sealNo || thc?.sealNo || thc?.sealno || '').toString().trim();
          this.apiSealNoByThc[thc.thcno] = modelSeal;
          const parts = modelSeal ? modelSeal.split(',').map((s: string) => s.trim()).filter((s: string) => s && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined') : [];
          this.apiSealListByThc[thc.thcno] = parts;
          this.expectedSealCountByThc[thc.thcno] = parts.length > 0 ? Math.min(parts.length, 3) : 1;
        });

        if (this.currentThc) {
          const data = this.sealDataByThc[this.currentThc.thcno];
          if (data) {
            this.sealCount = data.count;
            this.sealNo = data.s1;
            this.sealNo2 = data.s2;
            this.sealNo3 = data.s3;
          } else {
            this.sealCount = 1;
            this.sealNo = '';
            this.sealNo2 = '';
            this.sealNo3 = '';
          }
          this.loadIncomingSealDataForCurrentThc();
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load departure manifest details.';
      }
    });
  }

  isAllSelectedForCurrentThc(): boolean {
    const list = this.currentManifests;
    if (!list || list.length === 0) return false;
    return list.every(item => item.isChecked);
  }

  isPartiallySelectedForCurrentThc(): boolean {
    const list = this.currentManifests;
    if (!list || list.length === 0) return false;
    const someChecked = list.some(item => item.isChecked);
    const allChecked = list.every(item => item.isChecked);
    return someChecked && !allChecked;
  }

  toggleSelectAllCurrentThc(event: any) {
    const checked = event.target.checked;
    this.currentManifests.forEach(item => {
      item.isChecked = checked;
    });
    this.errorMessage = '';
  }

  onManifestCheckChange() {
    this.errorMessage = '';
  }

  getSelectedCountForThc(thcno?: string): number {
    if (!thcno) return 0;
    const list = this.manifestsByThc[thcno] || [];
    return list.filter(item => item.isChecked).length;
  }

  getManifestCountForThc(thcno?: string): number {
    if (!thcno) return 0;
    return (this.manifestsByThc[thcno] || []).length;
  }

  getTotalSelectedCount(): number {
    let count = 0;
    Object.values(this.manifestsByThc).forEach(list => {
      count += (list || []).filter(item => item.isChecked).length;
    });
    return count;
  }

  getTransportMode(row: any): string {
    return row.routE_MODE || row.transportMode || row.parentThc?.rut_cat || this.currentThc?.rut_cat || 'Road';
  }

  getModeBadgeClass(mode: string): string {
    if (!mode) return 'mf-mode-road';
    const m = mode.toString().toLowerCase();
    if (m === 'road') return 'mf-mode-road';
    if (m === 'air') return 'mf-mode-air';
    if (m === 'train') return 'mf-mode-train';
    return 'mf-mode-road';
  }

  getMfType(row: any): string {
    return row.lsType || row.serviceType || row.parentThc?.serviceType || this.currentThc?.serviceType || 'LTL';
  }

  getMfTypeClass(lsType: string): string {
    if (!lsType) return 'type-default';
    return `type-${lsType.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '-')}`;
  }

  getBaseService(lsType: string): string {
    if (!lsType) return '';
    const parts = lsType.toString().split(/[- ]+/);
    if (parts.length >= 3) {
      return `${parts[0]}-${parts[1]}`;
    } else if (parts.length === 2) {
      return parts[0];
    }
    return lsType;
  }

  formatPkgsWt(row: any): string {
    if (!row) return '0/0';

    let pkg = '0';
    if (row.pkgs !== null && row.pkgs !== undefined) {
      const pStr = row.pkgs.toString();
      pkg = pStr.includes('/') ? pStr.split('/')[0] : pStr;
    }

    let wt = '0';
    if (row.wts !== null && row.wts !== undefined) {
      const wStr = row.wts.toString();
      const firstPart = wStr.includes('/') ? wStr.split('/')[0] : wStr;
      const parsed = parseFloat(firstPart);
      wt = isNaN(parsed) ? firstPart : (parsed % 1 === 0 ? parsed.toFixed(0) : parsed.toString());
    }

    return `${pkg}/${wt}`;
  }

  openMFView(mfNo: string) {
    if (!mfNo) return;
    const url = `${this.env.liveUrl}ViewPrint/ViewMF?MFNO=${mfNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

  formatDateTime(dateVal: any): string | null {
    if (!dateVal) return null;
    let d: Date;
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      const [y, m, day] = dateVal.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let hours = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();

    if (hours === 0 && minutes === 0 && seconds === 0) {
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
    }

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    return `${year}-${month}-${day}T${hStr}:${mStr}:${sStr}.000Z`;
  }

  confirmDepart() {
    this.remarksTouched = true;
    this.sealNoTouched = true;
    this.sealNo2Touched = true;
    this.sealNo3Touched = true;
    this.errorMessage = '';

    if (this.currentThc) {
      this.saveCurrentThcSealData();
      this.saveCurrentThcIncomingSealData();
    }

    if (!this.isFromArrival) {
      if (this.sealForm && this.sealForm.invalid) {
        this.sealForm.markAllAsTouched();
        this.errorMessage = 'Please verify Incoming Seal details.';
        return;
      }

      if (!this.sealNo || !this.sealNo.trim()) {
        this.errorMessage = 'Please enter Seal No. 1';
        return;
      }

      if (!this.isValidSealNo(this.sealNo)) {
        this.errorMessage = 'Seal No. 1 should be 6 digits.';
        return;
      }

      if (this.sealCount >= 2 && this.sealNo2 && this.sealNo2.trim() && !this.isValidSealNo(this.sealNo2)) {
        this.errorMessage = 'Seal No. 2 should be 6 digits.';
        return;
      }

      if (this.sealCount >= 3 && this.sealNo3 && this.sealNo3.trim() && !this.isValidSealNo(this.sealNo3)) {
        this.errorMessage = 'Seal No. 3 should be 6 digits.';
        return;
      }

      if (this.hasDuplicateSeals()) {
        this.errorMessage = 'Duplicate seal numbers are not allowed. Please enter unique seal numbers.';
        return;
      }
    }

    if (!this.outgoingRemarks || !this.outgoingRemarks.trim()) {
      this.errorMessage = 'Please enter Outgoing Remarks.';
      return;
    }

    // Build payload for each THC
    const thcListPayload: any[] = [];
    const nowISO = this.formatDateTime(new Date());
    const nowTime = formatDate(new Date(), 'HH:mm', 'en-US');

    for (const thc of this.thcList) {
      const manifests = (this.manifestsByThc[thc.thcno] || [])
        .filter((m: any) => m.isChecked)
        .map((m: any) => ({
          tcno: m.tcno,
          isChecked: true
        }));

      const sealVal = (this.sealNoByThc[thc.thcno] || this.getFormattedSealNumbers() || '').trim();
      const incData = this.incomingSealDataByThc[thc.thcno];

      thcListPayload.push({
        thcno: thc.thcno,
        atd: nowISO,
        deptime_flight: nowTime,
        sealno_in: this.isFromArrival ? '' : sealVal,
        isDirectDeparted: this.isFromArrival ? 'Y' : 'N',
        outRemarks: this.outgoingRemarks.trim(),
        tcList: manifests,
        incomingSeal: incData?.isn || '',
        incomingSealStatus: incData?.status || ''
      });
    }

    const payload = {
      thcList: thcListPayload,
      baseUserName: this.docketService.loginUserList?.BaseUserName || '',
      baseLocationCode: this.docketService.loginUserList?.LocationCode || '',
      companyCode: this.docketService.loginUserList?.Companycode || ''
    };

    console.log('THC Departure Payload:', payload);
    this.isSubmitting = true;

    this.thcService.submitTHCDepartureMultiple(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res?.length && res.every((r: any) => r.success)) {
          this.closePopup();
          this.showSuccessAlert(res);
          this.departSuccess.emit(res);
        } else {
          this.errorMessage = res?.[0]?.message || 'Failed to depart THC.';
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        let errMsg = 'An error occurred during departure.';
        if (typeof err === 'string') {
          errMsg = err;
        } else if (err?.error?.message) {
          errMsg = err.error.message;
        } else if (typeof err?.error === 'string') {
          errMsg = err.error;
        } else if (err?.message) {
          errMsg = err.message;
        }
        this.errorMessage = errMsg;
      }
    });
  }

  showSuccessAlert(res: any) {
    const uniqueThcs = Array.from(new Set(res.map((r: any) => r.thcno))).filter(Boolean);

    let resDetailsHtml = '';
    if (uniqueThcs.length > 0) {
      resDetailsHtml = `
        <div style="margin-top: 15px; text-align: left; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e9ecef; max-height: 160px; overflow-y: auto;">
          <table style="width: 100%; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid #dee2e6;">
                <th style="padding-bottom: 8px; color: #6c757d; font-weight: 600;">THC No</th>
              </tr>
            </thead>
            <tbody>
              ${uniqueThcs.map((thcno: any) => `
                <tr style="border-bottom: 1px dashed #e9ecef;">
                  <td style="padding: 8px 0; font-weight: 600; color: #0b1a30;">${thcno}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    Swal.fire({
      html: `
        <div class="mb-4 d-flex justify-content-center">
          <div style="width: 90px; height: 90px; border-radius: 50%; background-color: #e6f9ed; border: 1px solid #c2f0d5; display: flex; align-items: center; justify-content: center;">
            <i class="ti ti-check text-success" style="font-size: 60px !important; width: 60px !important; height: 60px !important; display: flex; align-items: center; justify-content: center;"></i>
          </div>
        </div>
        <h5 style="font-weight: 700; color: #0b1a30; margin-bottom: 12px; font-size: 18px;">THC departed successfully</h5>
        <div style="font-size: 14px; color: #4b5563; line-height: 1.5; padding: 0 10px;">
          Docket status is now available for <strong style="color: #0b1a30;">LS / MF</strong> at the departure location.
          ${resDetailsHtml}
        </div>
      `,
      confirmButtonText: '<i class="ti ti-check me-2"></i> Done',
      width: '460px',
      padding: '35px 24px 24px 24px',
      customClass: {
        popup: 'rounded-4 shadow-sm text-center',
        htmlContainer: 'm-0 p-0',
        actions: 'justify-content-center mt-4 mb-0 w-100 p-0',
        confirmButton: 'btn btn-danger px-4 py-2 fw-medium d-flex align-items-center'
      },
      buttonsStyling: false
    });
  }
}
