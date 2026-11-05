import { ChangeDetectorRef, Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { environment } from 'environments/environment';
import { CommonDateService } from 'app/shared/services/common-date.service';
import { CommonModule } from '@angular/common';
import { CustomerService } from 'app/shared/services/customer.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-thc-arrival-popup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule, SharedModule],
  providers: [BsModalService],
  templateUrl: './thc-arrival-popup.component.html',
  styleUrl: './thc-arrival-popup.component.scss'
})
export class ThcArrivalPopupComponent {
  public modalRef!: BsModalRef;
  public arrivalForm!: FormGroup;
  public arrivalDetail: any;
  public env = environment;
  public minDate: Date | undefined;
  public maxDate: Date | undefined;
  public isloading: boolean = false;
  public THCData: any;
  public isFetchingData: boolean = false;
  public maxCloseKMValue: number = 900000;
  public isLarRequired: boolean = false;
  public apiSealNo: string = '';
  public apiSealList: string[] = [];
  public expectedSealCount: number = 1;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;


  public Reasonlist = [
    {
      text: "Late Dept. of Vehicle",
      value: "P84"
    }, {
      text: "Vehicle break down",
      value: "P88"
    }
  ]
  public Seallist = [
    {
      text: 'Ok',
      value: 'Ok'
    },
    {
      text: 'Broken',
      value: 'Broken'
    },
    {
      text: 'Unsealed',
      value: 'Unsealed'
    }
  ];
  public matchSeallist = [
    {
      text: 'Ok',
      value: 'Ok'
    }
  ];
  public mismatchSeallist = [
    {
      text: 'Broken',
      value: 'Broken'
    },
    {
      text: 'Unsealed',
      value: 'Unsealed'
    }
  ];
  public activeSeallist: any[] = [...this.mismatchSeallist];
  public isStatusFrozen: boolean = true;

  constructor(
    public docketService: DocketService,
    public commonService: CommonService,
    public customerService: CustomerService,
    private stockUpdateService: StockUpdateService,
    public generalMasterService: GeneralMasterService,
    public THCService: THCMasterService,
    private modalService: BsModalService,
    private sweetAlertService: SweetAlertService,
    public commonDateService: CommonDateService,
    private dynamicDataService: DynamicDataService,
    private cdr: ChangeDetectorRef) { }

    ngOnInit(){
          const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    }

  showPopup(data: any) {
    
    this.buildForm();
    this.dateAccess();
    this.THCData = data;
    console.log(this.THCData);
    this.refreshData();
    this.sealvalidation(this.THCData.thcNo);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  buildForm() {
    if (!this.apiSealList || this.apiSealList.length === 0) {
      this.apiSealNo = '';
    }

    this.isStatusFrozen = true;
    this.activeSeallist = [...this.mismatchSeallist];
    this.arrivalForm = new FormGroup({
      ISN: new FormControl('', [Validators.required, Validators.maxLength(6)]),
      ISN2: new FormControl('', [Validators.maxLength(6)]),
      ISN3: new FormControl('', [Validators.maxLength(6)]),
      s2id_Status: new FormControl(null, [Validators.required]),
      AD: new FormControl(this.getCurrentDateTime()),
      CLOSEKM: new FormControl('0'),
      IR: new FormControl('', [Validators.required]),
      Unloder: new FormControl(''),
      LAR: new FormControl(null),
      VendorCode: new FormControl(null),
      vendorName: new FormControl(''),
      Rate: new FormControl(0),
      LoadingCharge: new FormControl(0)
    });

    this.arrivalForm.get('ISN')?.valueChanges.subscribe(() => {
      this.validateAllSeals();
    });

    this.arrivalForm.get('ISN2')?.valueChanges.subscribe(() => {
      this.validateAllSeals();
    });

    this.arrivalForm.get('ISN3')?.valueChanges.subscribe(() => {
      this.validateAllSeals();
    });

    this.arrivalForm.get('s2id_Status')?.valueChanges.subscribe(status => {
      this.onStatusChange(status);
    });

    this.setupSealFormControls();
    this.arrivalForm.get('AD')?.valueChanges.subscribe(() => {
      this.validateLateArrivalReason();
    });
  }

  refreshData() {
    this.docketService.loginUserList.id = this.THCData.thcNo;
    this.buildForm();
    this.getArrival();
  }

  getCurrentDateTime(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // 12-hour format
    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }


  getArrival() {
    const params = {
      id: this.docketService.loginUserList.id,
      loadBy: '',
      chargeType: '',
      BaseLocationCode: this.docketService.loginUserList.LocationCode,
      BaseUserName: this.docketService.loginUserList.BaseUserName
    }
    this.isFetchingData = true;
    this.stockUpdateService.getArrivalDetail(params).subscribe({
      next: (response: any) => {
        this.arrivalDetail = response;
        this.arrivalForm.patchValue({
          CLOSEKM: this.arrivalDetail.closekm
        });
        this.fetchPreparedByEmployee();
        this.isFetchingData = false;
        this.validateLateArrivalReason();
        if (!this.apiSealNo) {
          const resAny = response as any;
          const detailSeal = (resAny?.sealNo ?? resAny?.SealNo ?? resAny?.SEALNO ?? resAny?.isn ?? '').toString().trim();
          if (detailSeal && detailSeal.toLowerCase() !== 'null' && detailSeal.toLowerCase() !== 'undefined') {
            this.apiSealNo = detailSeal;
            this.parseApiSeals(detailSeal);
            this.setupSealFormControls();
            this.validateAllSeals();
            this.cdr.detectChanges();
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isFetchingData = false;
        console.error('Error fetching arrival details:', err);
      }
    })
  }

  sealvalidation(thcNo: any) {
    let location = this.docketService.Location || this.docketService.loginUserList?.LocationCode || '';
    if (!location) {
      try {
        const saved = localStorage.getItem("loginUserList");
        if (saved) {
          const parsed = JSON.parse(saved);
          location = parsed?.LocationCode || '';
          this.docketService.Location = location;
          this.docketService.loginUserList = parsed;
        }
      } catch (e) {}
    }

    const payload = {
      FilterJson: {
        ReportId: '395',
        DocNo: thcNo,
        BRCD: location
      }
    };

    let seal = '';
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        const list = response?.Table1 || (Array.isArray(response) ? response : (response?.data?.Table1 || []));
        seal = '';
        if (list && list.length > 0) {
          const allRowSeals = list.map((r: any) => (r?.SealNo ?? r?.sealNo ?? r?.SEALNO ?? r?.Sealno ?? r?.seal_no ?? r?.isn ?? '').toString().trim()).filter((s: string) => s && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined');
          seal = allRowSeals.join(',');

          if (seal.toLowerCase() === 'null' || seal.toLowerCase() === 'undefined') {
            seal = '';
          }
        }
        if (!seal && this.THCData) {
          seal = (this.THCData?.sealNo ?? this.THCData?.SealNo ?? this.THCData?.SEALNO ?? '').toString().trim();
        }
        if (!seal && this.arrivalDetail) {
          seal = (this.arrivalDetail?.sealNo ?? this.arrivalDetail?.SealNo ?? this.arrivalDetail?.isn ?? '').toString().trim();
        }
        this.apiSealNo = seal;
        this.parseApiSeals(seal);
        this.cdr.detectChanges();
        this.setupSealFormControls();
        this.validateAllSeals();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error in sealvalidation:', err);
        this.apiSealNo = '';
        this.apiSealList = [];
        this.expectedSealCount = 1;
        this.parseApiSeals('');
        this.cdr.detectChanges();
        this.setupSealFormControls();
        this.validateAllSeals();
        this.cdr.detectChanges();
      }
    });
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

  setupSealFormControls() {
    const isnCtrl = this.arrivalForm?.get('ISN');
    const isn2Ctrl = this.arrivalForm?.get('ISN2');
    const isn3Ctrl = this.arrivalForm?.get('ISN3');

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

  validateAllSeals() {
    if (!this.arrivalForm) return;

    const s1 = (this.arrivalForm.get('ISN')?.value || '').toString().trim();
    const s2 = (this.arrivalForm.get('ISN2')?.value || '').toString().trim();
    const s3 = (this.arrivalForm.get('ISN3')?.value || '').toString().trim();

    const isnCtrl = this.arrivalForm.get('ISN');
    const isn2Ctrl = this.arrivalForm.get('ISN2');
    const isn3Ctrl = this.arrivalForm.get('ISN3');
    const statusControl = this.arrivalForm.get('s2id_Status');

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
    this.cdr.detectChanges();
  }

  getFormattedArrivalSeals(): string {
    const s1 = (this.arrivalForm.get('ISN')?.value || '').toString().trim();
    const s2 = (this.arrivalForm.get('ISN2')?.value || '').toString().trim();
    const s3 = (this.arrivalForm.get('ISN3')?.value || '').toString().trim();

    const seals: string[] = [];
    if (s1) seals.push(s1);
    if (s2) seals.push(s2);
    if (s3) seals.push(s3);

    return seals.join(',');
  }

  onStatusDropdownOpen() {
    this.validateAllSeals();
    this.cdr.detectChanges();
  }

  onStatusChange(status: any) {
    this.validateAllSeals();
  }

  onlyNumberKey(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  onSealInput(event: any, controlName: string = 'ISN'): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const cleanValue = (input.value || '').replace(/\D/g, '').slice(0, 6);
    if (input.value !== cleanValue) {
      input.value = cleanValue;
      this.arrivalForm.get(controlName)?.setValue(cleanValue, { emitEvent: true });
    }
  }

  validateLateArrivalReason() {
    const larControl = this.arrivalForm?.get('LAR');
    if (!this.arrivalDetail || !this.arrivalDetail.eta) {
      this.isLarRequired = false;
      larControl?.clearValidators();
      larControl?.setValue(null, { emitEvent: false });
      larControl?.updateValueAndValidity({ emitEvent: false });
      this.cdr.detectChanges();
      return;
    }
    
    const adValue = this.arrivalForm.get('AD')?.value;
    if (!adValue) return;

    const adDate = new Date(adValue);
    const etaDate = new Date(this.arrivalDetail.eta);
    if (adDate > etaDate) {
      this.isLarRequired = true;
      larControl?.setValidators([Validators.required]);
    } else {
      this.isLarRequired = false;
      larControl?.clearValidators();
      larControl?.setValue(null, { emitEvent: false });
    }
    larControl?.updateValueAndValidity({ emitEvent: false });
    this.cdr.detectChanges();
  }

  // onFocusCloseKM() {
  //   const control = this.arrivalForm.get('CLOSEKM');
  //   if (control?.value === '0' || control?.value === 0) {
  //     control.setValue(null);
  //   }
  // }

  dateAccess() {
    const payload = {
      moduleCode: '46',
      baseUserName: this.docketService.baseUsername
    };
    this.commonDateService.userDateSelection(payload).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          const rule = res[0];
          // API min_Date
          this.minDate = new Date(rule.min_Date);
          // BackDate days logic
          if (rule.backDate_Days && rule.backDate_Days > 0) {
            const today = new Date();
            this.minDate = new Date(today.setDate(today.getDate() - rule.backDate_Days));
          }
          // Max date = today
          this.maxDate = new Date();
        }
      }
    });
  }

  fetchPreparedByEmployee() {
    const searchText = this.docketService.loginUserList?.UserId;
    const baseUserName = this.docketService.loginUserList?.BaseUserName;
    if (!searchText || !baseUserName) return;

    this.customerService.getEmployeeDropdown(searchText, baseUserName).subscribe({
      next: (response: any) => {
        if (Array.isArray(response) && response.length > 0) {
          const emp = response[0];
          const val = emp.id ? `${emp.id} : ${emp.text}` : emp.text;
          this.arrivalForm?.get('Unloder')?.setValue(val);
        }
      }
    });
  }

  // validateCloseKM() {
  //   const control = this.arrivalForm.get('CLOSEKM');
  //   if (control?.value === null || control?.value === '') {
  //     control.setValue(0);
  //   }
  //   const loadingBy = this.arrivalDetail?.loadingBy;
  //   const opnKm = Number(this.arrivalDetail?.openkm);
  //   const closeKMControl = this.arrivalForm.get('CLOSEKM');

  //   // DEFAULT MAX (always applicable)
  //   this.maxCloseKMValue = 900000;

  //   // Additional restriction only when NOT B / XX6
  //   // if (loadingBy !== 'B' && loadingBy !== 'XX6') {
  //   //   const calculatedMax = opnKm + 2000;
  //   //   this.maxCloseKMValue =
  //   //     calculatedMax > 900000 ? 900000 : calculatedMax;
  //   // }

  //   closeKMControl?.setValidators([
  //     Validators.required,
  //     Validators.max(this.maxCloseKMValue)
  //   ]);

  //   closeKMControl?.updateValueAndValidity();
  // }

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

  onSubmit() {
    this.validateAllSeals();
    const statusControl = this.arrivalForm.get('s2id_Status');
    if (!statusControl?.value) {
      statusControl?.setErrors({ required: true });
    }
    this.cdr.detectChanges();

    if (this.arrivalForm.invalid) {
      Object.keys(this.arrivalForm.controls).forEach(controlName => {
        const control = this.arrivalForm.get(controlName);
        if (control && control.invalid) {
          console.log(`Invalid Control: ${controlName}`, control.errors);
        }
      });
      this.arrivalForm.markAllAsTouched();
      return;
    }

    if (this.arrivalForm.valid) {
      this.isloading = true;
      const payload = {
        status: this.arrivalForm.value.s2id_Status,
        thcno: this.THCData?.thcNo,
        openkm: this.arrivalDetail?.openkm,
        closekm: this.arrivalForm.value.CLOSEKM?.toString() || '',
        ad: this.formatDateTime(this.arrivalForm.value.AD),
        at: "",
        lar: this.isLarRequired ? (this.arrivalForm.value.LAR || '') : '',
        isn: this.getFormattedArrivalSeals(),
        ir: this.arrivalForm.value.IR,
        seal_Reason: "",
        loadingCharge: Number(this.arrivalForm.value.LoadingCharge) || 0,
        rateType: this.arrivalDetail?.rateType || '',
        loadingBy: this.arrivalDetail?.loadingBy || '',
        rate: this.arrivalForm.value.Rate,
        maxLimit: this.arrivalDetail.maxLimit,
        vendorCode: this.arrivalForm.value.VendorCode,
        vendorName: this.arrivalForm.value.vendorName,
        isMonthly: this.arrivalForm.value.isMonthly,
        isMathadi: this.arrivalDetail?.isMathadi,
        mathadiSlipNo: "",
        mathadiDate: this.arrivalDetail.mathadiDate,
        mathadiAmt: this.arrivalDetail?.mathadiAmt,
        isDeps: this.arrivalDetail?.isDeps,
        baseLocationCode: this.docketService.loginUserList.LocationCode,
        baseUserName: this.docketService.loginUserList.BaseUserName
      };
      this.stockUpdateService.THCArrival(payload).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.isloading = false;
            this.sweetAlertService.success(`THC arrived ${this.THCData?.thcNo} successfully.`);
            this.dataEmitter.emit();
            this.modalRef.hide();
          } else {
            this.isloading = false;
            this.sweetAlertService.error(response.message || 'Error from server');
          }
        },
        error: (error) => {
          this.isloading = false;
          this.sweetAlertService.error(error?.error?.message || error?.error?.title);
        }
      });
    }
  }
}
