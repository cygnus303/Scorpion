import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BranchWiseLoadingUnloading } from 'app/shared/models/thc-master.model';
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


@Component({
  selector: 'app-arrival-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule, SharedModule],
  templateUrl: './arrival-update.component.html',
  styleUrl: './arrival-update.component.scss'
})
export class ArrivalUpdateComponent {
  public arrivalForm!: FormGroup;
  public arrivalDetail: any;
  public isSubmit: boolean = false;
  env = environment;
  minDate: Date | undefined;
  maxDate: Date | undefined;
  public isRedirect: boolean = false;
  public branchWiseLoadingUnloadingList: BranchWiseLoadingUnloading[] = [];
   maxCloseKMValue: number = 900000;

  public Reasonlist = [
    {
      text: "Late Dept. of Vehicle",
      Value: "P84"
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
  ]

  constructor(
    public docketService: DocketService,
    public commonService: CommonService,
    private stockUpdateService: StockUpdateService,
    public generalMasterService: GeneralMasterService,
    public THCService: THCMasterService,
    private sweetAlertService: SweetAlertService,
    public commonDateService:CommonDateService) { }

  ngOnInit() {
    this.buildForm();
    this.generalMasterService.getDeliveryProcessData();
    this.getArrival();
     this.dateAccess()
  }


  buildForm() {
    this.arrivalForm = new FormGroup({
      ISN: new FormControl('', [Validators.required]),
      s2id_Status: new FormControl(null, [Validators.required]),
      AD: new FormControl(this.getCurrentDateTime()),
      CLOSEKM: new FormControl('0'),
      IR: new FormControl('', [Validators.required]),
      Unloder: new FormControl(''),
      LAR: new FormControl(null),
      VendorCode: new FormControl(null, [Validators.required]),
      vendorName: new FormControl(''),
      Rate: new FormControl(0),
      LoadingCharge: new FormControl(0)
    });
    this.arrivalForm.get('LoadingBy')?.valueChanges.subscribe(value => this.updateValidatorsByLoadingBy(value));
  }

  updateValidatorsByLoadingBy(loadingBy: string) {
    const vendorCtrl = this.arrivalForm.get('VendorCode');
    const loadingChargeCtrl = this.arrivalForm.get('LoadingCharge');

    if (loadingBy === 'XX9') {
      vendorCtrl?.clearValidators();
      loadingChargeCtrl?.clearValidators();
    }

    else {
      vendorCtrl?.setValidators([Validators.required]);
      loadingChargeCtrl?.setValidators([
        Validators.required,
      ]);
    }

    vendorCtrl?.updateValueAndValidity();
    loadingChargeCtrl?.updateValueAndValidity();
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
      loadBy: this.docketService.loginUserList.loadBy,
      chargeType: this.docketService.loginUserList.chargeType,
      BaseLocationCode: this.docketService.loginUserList.LocationCode,
      BaseUserName: this.docketService.loginUserList.BaseUserName
    }
    this.stockUpdateService.getArrivalDetail(params).subscribe({
      next: (response) => {
        this.arrivalDetail = response;
        this.generalMasterService.getLoadingByDetail(this.arrivalDetail.loadingBy);
        this.updateValidatorsByLoadingBy(this.arrivalDetail.loadingBy);
        this.arrivalForm.patchValue({
          Unloder: this.arrivalDetail.unloder
        });
        this.getPANnumberData(this.arrivalDetail.loadingBy)
      },
    })
  }

  getPANnumberData(vendorCode: any) {
    const ChargedBy = vendorCode;
    if (ChargedBy === 'B' || ChargedBy == '04') {
      this.getChargesVendorsList('04');
    }
    if (ChargedBy === 'A' || ChargedBy == 'XX1') {
      this.getChargesVendorsList('XX1');
    }
    if (ChargedBy === 'M') {
      this.getChargesVendorsList('19');
    }
    if (ChargedBy === 'XX5' || ChargedBy === 'XX8') {
      this.branchWiseLoadingUnloading(vendorCode);
    }
  }

  getLoadingCharge(event: any) {
    if (event) {
      this.arrivalForm.patchValue({
        vendorName: event.text
      })
    }
    const data = {
      loadUnloadType: 'U',
      vendorCode: event.value,
      typeModule: 'M',
      chargeType: this.docketService.loginUserList.chargeType,
      brdc: this.docketService.loginUserList.LocationCode,
      loadingBy: this.arrivalDetail.loadingBy,
    };
    if (this.arrivalDetail?.loadingBy === 'XX5') {
      this.THCService.getLoadingCharge(data).subscribe({
        next: (response: any) => {
          this.arrivalForm.patchValue({
            Rate: response.rate
          });

        },
        error: (err) => {
          console.error('Error fetching loading charge:', err);
        }
      });
    }
    setTimeout(() => {
      this.calculateCharge();
    }, 200);
  }

  rateErrorMsg: any;
  validateRate(): boolean {
    const loadingBy = this.arrivalDetail.loadingBy;

    // Skip validation if 'LoadingBy' is 'XX9'
    if (loadingBy === 'XX9') {
      return true;
    }

    const rateType = this.arrivalDetail.rateType;
    const rate = parseFloat(this.arrivalForm.get('Rate')?.value || '0') || 0;
    const chrgwt = parseFloat(this.arrivalDetail.chrgwt || '0') || 0;
    const noofpkg = parseFloat(this.arrivalDetail.pkgsno || '0') || 0;

    let maxlimitcalculation = 0;

    if (rateType === '4') {
      if (chrgwt === 0) return false;
      maxlimitcalculation = rate / chrgwt;
    }
    else if (rateType === '3') {
      if (chrgwt === 0) return false;
      maxlimitcalculation = (rate * noofpkg) / chrgwt;
    }
    else {
      maxlimitcalculation = rate;
    }

    if (maxlimitcalculation > 5) {
      this.rateErrorMsg = 'Rate Amount Is High Please Check';
      this.arrivalForm.patchValue({ Rate: '0.00' });
      return false;
    }

    this.rateErrorMsg = '';
    return true;
  }

  onFocusCloseKM() {
  const control = this.arrivalForm.get('CLOSEKM');
    if (control?.value === '0' || control?.value === 0) {
      control.setValue(null);
    }
  }


  onFocusRate() {
  const control = this.arrivalForm.get('Rate');
    if (control?.value === 0) {
      control.setValue(null);
    }
  }

  onBlurRate() {
    const control = this.arrivalForm.get('Rate');
    if (control?.value === null || control?.value === '') {
      control.setValue(0);
    }
  }


  calculateCharge() {
    const isValid = this.validateRate();
    if (!isValid) {
      this.arrivalForm.patchValue({ LoadingCharge: (0).toFixed(2) })
      return;
    }
    const rateType = this.arrivalDetail.rateType;
    const newRate = parseFloat(this.arrivalForm.value.Rate || 0);
    const actuwt = parseFloat(this.arrivalDetail.chrgwt || 0);
    const pkgsno = parseFloat(this.arrivalDetail.pkgsno || 0);
    let charge = 0;
    switch (rateType) {
      case '1': // PER KG
        charge = actuwt * newRate;
        break;
      case '3': // PER PACKAGES
        charge = pkgsno * newRate;
        break;
      case '4': // FLAT
        charge = newRate;
        break;
      default:
        charge = 0;
    }
    this.arrivalForm.patchValue({
      LoadingCharge: charge.toFixed(2)
    })
  }

  branchWiseLoadingUnloading(event: any) {
    const data = {
      vendorType: event,
      baseLocationCode: this.docketService.loginUserList.LocationCode,
      type: 'U',
    }
    this.THCService.getBranchWiseLoadingUnloadingVendorList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.branchWiseLoadingUnloadingList = response.data;
        }
      },
    });
  }

  backtoStockUpdate() {
    window.parent.location.href = `${this.env.liveUrl}/Operation/ArrivalUpdate/${'1'}?type=${"1"}&src=angular`;
  }

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

  getChargesVendorsList(event: any) {
    const data = {
      vendorType: event?.codeId ? event?.codeId : event,
      branchCode: this.docketService.loginUserList.LocationCode,
      userName: this.docketService.loginUserList.BaseUserName,
      documentType: this.docketService.loginUserList.Type
    }
    this.THCService.getVendorsList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.branchWiseLoadingUnloadingList = response.data.map((x: any) => ({
            value: x.vendor_Code,
            text: x.vendor_Name
          }));
        }
      },
    });
  }

validateCloseKM() {
  const control = this.arrivalForm.get('CLOSEKM');
  if (control?.value === null || control?.value === '') {
    control.setValue(0);
  }
  const loadingBy = this.arrivalDetail?.loadingBy;
  const opnKm = Number(this.arrivalDetail?.openkm);
  const closeKMControl = this.arrivalForm.get('CLOSEKM');
 
  // DEFAULT MAX (always applicable)
  this.maxCloseKMValue = 900000;
 
  // Additional restriction only when NOT B / XX6
  // if (loadingBy !== 'B' && loadingBy !== 'XX6') {
  //   const calculatedMax = opnKm + 2000;
  //   this.maxCloseKMValue =
  //     calculatedMax > 900000 ? 900000 : calculatedMax;
  // }
 
  closeKMControl?.setValidators([
    Validators.required,
    Validators.max(this.maxCloseKMValue)
  ]);
 
  closeKMControl?.updateValueAndValidity();
}

  onSubmit() {
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
      const payload = {
        status: this.arrivalForm.value.s2id_Status,
        thcno: this.arrivalDetail?.thcno,
        openkm: this.arrivalDetail?.openkm,
        closekm: this.arrivalForm.value.CLOSEKM,
        ad: new Date(this.arrivalForm.value.AD)?.toISOString(),
        at: "",
        lar: this.arrivalForm.value.LAR,
        isn: this.arrivalForm.value.ISN,
        ir: this.arrivalForm.value.IR,
        seal_Reason: "",
        loadingCharge: Number(this.arrivalForm.value.LoadingCharge) || 0,
        rateType: this.arrivalDetail?.rateType,
        loadingBy: this.arrivalDetail?.loadingBy,
        rate: this.arrivalForm.value.Rate,
        maxLimit: this.arrivalDetail.maxLimit,
        vendorCode: this.arrivalForm.value.VendorCode,
        vendorName: this.arrivalForm.value.vendorName,
        isMonthly: true,
        isMathadi: this.arrivalDetail?.isMathadi,
        mathadiSlipNo: "",
        mathadiDate: this.arrivalDetail.mathadiDate,
        mathadiAmt: this.arrivalDetail?.mathadiAmt,
        isDeps: this.arrivalDetail?.isDeps,
        baseLocationCode: this.docketService.loginUserList.LocationCode,
        baseUserName: this.docketService.loginUserList.BaseUserName
      }
      this.isSubmit = true;
      this.stockUpdateService.THCArrival(payload).subscribe({
        next: (response) => {
          if (response.success) {
            this.isRedirect = true;
            window.parent.location.href = `${this.env.liveUrl}Operation/ArrivalUpdateDone?ThcNo=${this.arrivalDetail?.thcno}&TranXaction=True&view=Arrival&angular`;
          } else {
            this.arrivalForm.markAllAsTouched();
          }
          this.isSubmit = false;
        }, error: (error) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.sweetAlertService.error(error?.error?.message);
          this.isSubmit = false;
          this.isRedirect = false;
        }
      })
    }
  }
}

