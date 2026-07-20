import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
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
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;


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
    public customerService: CustomerService,
    private stockUpdateService: StockUpdateService,
    public generalMasterService: GeneralMasterService,
    public THCService: THCMasterService,
    private modalService: BsModalService,
    private sweetAlertService: SweetAlertService,
    public commonDateService: CommonDateService) { }

  showPopup(data: any) {
    this.buildForm();
    this.dateAccess();
    this.THCData = data;
    console.log(this.THCData);
    this.refreshData();
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
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
      VendorCode: new FormControl(null),
      vendorName: new FormControl(''),
      Rate: new FormControl(0),
      LoadingCharge: new FormControl(0)
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
      next: (response) => {
        this.arrivalDetail = response;
        this.arrivalForm.patchValue({
          CLOSEKM: this.arrivalDetail.closekm
        });
        this.fetchPreparedByEmployee()
        this.isFetchingData = false;
      },
      error: (err) => {
        this.isFetchingData = false;
        console.error('Error fetching arrival details:', err);
      }
    })
  }

  onFocusCloseKM() {
    const control = this.arrivalForm.get('CLOSEKM');
    if (control?.value === '0' || control?.value === 0) {
      control.setValue(null);
    }
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
      this.isloading = true;
      const payload = {
        status: this.arrivalForm.value.s2id_Status,
        thcno: this.THCData?.thcNo,
        openkm: this.arrivalDetail?.openkm,
        closekm: this.arrivalForm.value.CLOSEKM?.toString(),
        ad: new Date(this.arrivalForm.value.AD)?.toISOString(),
        at: "",
        lar: this.arrivalForm.value.LAR,
        isn: this.arrivalForm.value.ISN,
        ir: this.arrivalForm.value.IR,
        seal_Reason: "",
        loadingCharge: Number(this.arrivalForm.value.LoadingCharge) || 0,
        rateType: this.arrivalDetail?.rateType || '',
        loadingBy: this.arrivalDetail?.loadingBy || '',
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
      this.stockUpdateService.THCArrival(payload).subscribe({
        next: (response:any) => {
          if (response.success) {
            this.isloading = false;
            this.sweetAlertService.success(`THC arrived ${this.THCData?.thcNo} successfully.`);
            this.dataEmitter.emit()
            this.modalRef.hide();
          } else {
            this.isloading = false;
            this.sweetAlertService.error(response.message || 'Error from server');
          }
        }, error: (error) => {
          this.isloading = false;
          this.sweetAlertService.error(error?.error?.message || error?.error?.title);
        }
      })
    }
  }
}
