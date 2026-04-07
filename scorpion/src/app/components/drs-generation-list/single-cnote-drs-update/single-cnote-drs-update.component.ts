import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DeliveryUpdateService } from 'app/shared/services/delivery-update.service';
import { DocketService } from 'app/shared/services/docket.service';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'single-cnote-drs-update',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, ReactiveFormsModule, FormsModule, SharedModule],
  templateUrl: './single-cnote-drs-update.component.html',
  styleUrl: './single-cnote-drs-update.component.scss'
})
export class SingleCnoteDrsUpdateComponent {
  public modalRef!: BsModalRef;
  public DRSUpdateForm !: FormGroup;
  public selectedData: any;
  public docketData: any[] = [];
  public deliveryReason: any[] = [];
  public drsSummary: any;
  public isSubmit: boolean = false;
  today: Date = new Date();
  public isLoading = false;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;


  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    private prsDrsApiService: PRSDRSApiService,
    private deliveryUpdateService: DeliveryUpdateService,
    private sweetAlertService: SweetAlertService,
    private docketService: DocketService
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.DRSUpdateForm = this.fb.group({
      cnoteList: this.fb.array([])
    });
  }

  createCnoteForm(item: any): FormGroup {
    const [day, month, year] = item.booking_Date.split('/').map(Number);
    const formattedDate = new Date(year, month - 1, day);

    const form = this.fb.group({
      dockno: [item.dockno],
      booking_Date: [formattedDate],
      orgncd: [item.orgncd],
      destcd: [item.destcd],
      payBasis: [item.payBasis],
      csgncd: [item.csgncd],
      csgnnm: [item.csgnnm],
      csgecd: [item.csgecd],
      csgenm: [item.csgenm],
      pkgs_Pending: [item.pkgs_Pending],
      pkgs_Arrived: [item.pkgs_Arrived],
      pkgs_Booked: [item.pkgs_Booked],
      comm_Dely_Dt: [item.comm_Dely_Dt],
      IsEnabledBadPodoption: [item.isEnabledBadPodoption || false],
      IsChecked: [''],
      PKGSDELIVERED: ['', [Validators.required, this.maxPendingValidator('pkgs_Pending')]],
      DelyLocation: [null],
      DELYDATE: [this.getCurrentDateTime()],
      DELYPERSON: [''],
      cboReason: [''],
      podFront: [null],
      podBack: [null],
      frontFiles: [[]],
      backFiles: [[]],
      frontPreview: [null],
      backPreview: [null],

      autoNo: [item.autoNo],
      docksf: [item.docksf],
      dockDt: [item.dockDt],
      curr_loc: [item.curr_loc],
      payBasCode: [item.payBasCode],

      pkgQty: [item.pkgQty],
      booked_Wt: [item.booked_Wt],
      wt_Arrived: [item.wt_Arrived],

      freight: [item.freight],
      docket_Total: [item.docket_Total],
      service_Tax: [item.service_Tax],

      delyLocationApi: [item.delyLocation],

      coD_DOD: [item.coD_DOD],
      coddod: [item.coddod],
      coddodAmount: [item.coddodAmount],

      coddodcollected: [item.coddodcollected],
      coddodno: [item.coddodno],

      dlypdcno: [item.dlypdcno],

      cdeldT_ddmmyyyy: [item.cdeldT_ddmmyyyy],
      dockDt_ddmmyyyy: [item.dockDt_ddmmyyyy],

      delydate_api: [item.delydate],
      delytime_api: [item.delytime],

      actQty: [item.actQty],
      rate: [item.rate],
      maxLimit: [item.maxLimit],
      newRate: [item.newRate],

      isEnabled: [item.isEnabled],

      //     remark:[''],
      // otp:['']
    });
    return form;
  }

  onDeliveredInput(event: any, row: AbstractControl) {
    let value = +event.target.value;
    const pending = +row.get('pkgs_Pending')?.value;

    if (value > pending) {
      row.get('PKGSDELIVERED')?.setErrors({ maxPending: true });
    } else {
      row.get('PKGSDELIVERED')?.setErrors(null);
    }
  }

  maxPendingValidator(pendingKey: string) {
    return (control: AbstractControl) => {
      const parent = control.parent;
      if (!parent) return null;

      const pending = parent.get(pendingKey)?.value;
      const delivered = control.value;

      if (delivered && pending && delivered > pending) {
        return { maxPending: true };
      }
      return null;
    };
  }

  get cnoteList(): FormArray {
    return this.DRSUpdateForm.get('cnoteList') as FormArray;
  }

  showPopup(data: any) {
    console.log('Data received for Single C Note Update:', data);
    this.selectedData = data;
    this.drsSummary = null;
    this.DRSUpdateForm.reset();
    this.cnoteList.clear();
    this.docketDetail(data.drsNo);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  docketDetail(drsNo: string) {
    this.prsDrsApiService.docketList(drsNo).subscribe({
      next: (response: any) => {
        this.docketData = response;
      }
    })
  }

  getDRSDetail(event: any) {
    const params = {
      "dockNo": event.dockNo,
      "drsCode": this.selectedData.drsNo,
      "dockSf": "."
    }

    this.isLoading = true;
    this.prsDrsApiService.singleDRSUpdateDetail(params).subscribe({
      next: (response: any) => {
        const list = response?.data?.updateDRSLits || [];
        this.drsSummary = response?.data?.drsSummary;
        this.cnoteList.clear();

        // 🔹 Push new data
        list.forEach((item: any) => {
          this.cnoteList.push(this.createCnoteForm(item));
        });
        this.getDeliveryReason();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  getDeliveryReason() {
    this.prsDrsApiService.getDeliveryDetail().subscribe({
      next: (response: any) => {
        this.deliveryReason = response.data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
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

  removeFile(index: number, type: 'FRONT' | 'BACK') {
    const row = this.cnoteList.at(index) as FormGroup;

    if (type === 'FRONT') {
      const url = row.get('frontPreview')?.value;
      if (url) URL.revokeObjectURL(url);

      row.patchValue({
        frontFiles: [],
        frontPreview: null
      });

      row.get('frontFiles')?.markAsTouched();
    } else {
      const url = row.get('backPreview')?.value;
      if (url) URL.revokeObjectURL(url);

      row.patchValue({
        backFiles: [],
        backPreview: null
      });
    }
  }

  onFileSelected(event: any, index: number, type: 'FRONT' | 'BACK') {
    const file = event.target.files?.[0];
    if (!file) return;

    const row = this.cnoteList.at(index) as FormGroup;
    const previewUrl = URL.createObjectURL(file);

    if (type === 'FRONT') {
      const old = row.get('frontPreview')?.value;
      if (old) URL.revokeObjectURL(old);

      row.patchValue({
        frontFiles: [file],
        frontPreview: previewUrl
      });

      row.get('frontFiles')?.markAsTouched();
    } else {
      const old = row.get('backPreview')?.value;
      if (old) URL.revokeObjectURL(old);

      row.patchValue({
        backFiles: [file],
        backPreview: previewUrl
      });
    }

    event.target.value = '';

    this.validatePOD(index);
  }

  validatePOD(index: number) {

    const row = this.cnoteList.at(index) as FormGroup;
    const docketNo = row.get('dockno')?.value;

    if (!docketNo) {
      console.error('Dock No not found for row', index);
      return;
    }

    const frontFiles = row.get('frontFiles')?.value || [];
    const backFiles = row.get('backFiles')?.value || [];

    // OPTIONAL: only front mandatory
    if (!frontFiles.length) {
      return;
    }

    const formData = new FormData();
    formData.append('DocNo', docketNo);

    frontFiles.forEach((file: File) => {
      formData.append('PodFile', file);
    });

    // If backend needs back also
    backFiles.forEach((file: File) => {
      formData.append('PodBackFile', file);
    });

    this.deliveryUpdateService.checkPODValidation(formData).subscribe({
      next: (response: any) => {
        if (response?.success) {
          row.patchValue({ podValidated: true });
        } else {
          this.sweetAlertService.error(
            `POD validation failed for Dock No ${docketNo}`
          );
        }
      },
      error: (error) => {
        this.sweetAlertService.error(
          error?.error?.message || `Error validating POD for Dock No ${docketNo}`
        );
      }
    });
  }

  isPodFrontRequired(index: number): boolean {
    const row = this.cnoteList.at(index) as FormGroup;

    const deliveredPkgs = Number(row.get('PKGSDELIVERED')?.value || 0);
    const frontPreview = row.get('frontPreview')?.value;

    return (
      deliveredPkgs > 0 &&
      !frontPreview &&
      (row.get('frontFiles')?.touched || this.isSubmit)
    );
  }

  hasPODError(): boolean {
    let hasError = false;
    this.cnoteList.controls.forEach((row: any) => {
      const deliveredPkgs = Number(row.get('PKGSDELIVERED')?.value || 0);
      const frontFiles = row.get('frontFiles')?.value || [];

      if (deliveredPkgs > 0 && frontFiles.length === 0) {
        hasError = true;
        row.get('frontFiles')?.markAsTouched();
      }
    });
    return hasError;
  }

  onSubmit() {
    const DRSDocketsUpdateList = this.cnoteList.getRawValue().map((row: any) => ({
      pkgs_Booked: Number(row.pkgs_Booked) || 0,
      rate: Number(row.rate) || 0,
      newRate: Number(row.newRate) || 0,
      remark: row.remark || '',
      coddod: row.coddod ?? false,
      service_Tax: Number(row.service_Tax) || 0,
      coddodno: Number(row.coddodno) || 0,
      dockDt: row.dockDt,
      destcd: row.destcd,
      delyperson: row.DELYPERSON || '',
      freight: Number(row.freight) || 0,
      delyLocation: row.DelyLocation || row.delyLocationApi || '',
      actQty: Number(row.actQty) || 0,
      docksf: row.docksf,
      cdeldT_ddmmyyyy: row.cdeldT_ddmmyyyy,
      docket_Total: Number(row.docket_Total) || 0,
      coddodcollected: Number(row.coddodcollected) || 0,
      pkgQty: Number(row.pkgQty) || 0,
      wt_Arrived: Number(row.wt_Arrived) || 0,
      otp: row.otp || '',
      orgncd: row.orgncd,
      isEnabledBadPodoption: row.IsEnabledBadPodoption ?? false,
      cboEmail: row.cboEmail || '',
      csgenm: row.csgenm,
      comm_Dely_Dt: row.comm_Dely_Dt,
      csgecd: row.csgecd,
      autoNo: Number(row.autoNo) || 0,
      coD_DOD: row.coD_DOD,
      cboMobileNo: row.cboMobileNo || '',
      curr_loc: row.curr_loc,
      booked_Wt: Number(row.booked_Wt) || 0,
      cboReason: row.cboReason || '',
      dockno: row.dockno,
      booking_Date: row.booking_Date,
      pkgs_Arrived: Number(row.pkgs_Arrived) || 0,
      payBasis: row.payBasis,
      csgnnm: row.csgnnm,
      maxLimit: Number(row.maxLimit) || 0,
      isEnabled: row.isEnabled ?? false,
      hDcboReason: row.hDcboReason || '',
      csgncd: row.csgncd,
      coddodAmount: Number(row.coddodAmount) || 0,
      payBasCode: row.payBasCode,
      ratetype: row.ratetype || '',
      cboLateReason: row.cboLateReason || '',
      delydate: row.DELYDATE,
      delytime: row.DELYDATE,
      dockDt_ddmmyyyy: row.dockDt_ddmmyyyy,
      pkgsdelivered: Number(row.PKGSDELIVERED) || 0,
      isChecked: row.IsChecked ?? false,
      dlypdcno: row.dlypdcno,
      pkgs_Pending: Number(row.pkgs_Pending) || 0
    }));

    const formData = new FormData();
    formData.append("DRSsingleDocketsUpdateList", JSON.stringify(DRSDocketsUpdateList));
    formData.append("pdcno", this.drsSummary.pdcno);
    // formData.append("LoadingBy", this.DRSSummaryForm.value.LoadingBy);
    // formData.append("VendorCode", this.drsSummary.VendorCode);
    // formData.append("VendorName", this.drsSummary.VendorName);
    formData.append("IsMonthly", this.drsSummary.isMonthly);
    formData.append("LoadingCharge", this.drsSummary.loadingCharge);
    formData.append("MaxLimit", this.drsSummary.maxLimit);
    formData.append("CloseKM", this.drsSummary.closeKM);
    formData.append("IsMathadi", this.drsSummary.isMathadi);
    // formData.append("RateType", this.drsSummary.rateType);
    formData.append("Rate", this.drsSummary.rate);
    formData.append("MathadiDate", this.drsSummary.mathadiDate);
    formData.append("MathadiAmt", this.drsSummary.mathadiAmt);
    formData.append("LocationCode", this.docketService.loginUserList.LocationCode);
    formData.append("BaseUserName", this.docketService.loginUserList.BaseUserName);
    formData.append("FinYear", this.docketService.loginUserList.FinYear);

    this.cnoteList.controls.forEach((ctrl: any) => {
      ctrl.value.frontFiles.forEach((file: File) => {
        formData.append('Files', file, `${ctrl.value.dockno}_FRONT_${file.name}`);
      });

      ctrl.value.backFiles.forEach((file: File) => {
        formData.append('BackFiles', file, `${ctrl.value.dockno}_BACK_${file.name}`);
      });
    });
    const podError = this.hasPODError();

    if (this.DRSUpdateForm.valid && !podError) {
      this.prsDrsApiService.submitSingleCnoteDRSUpdate(formData).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.sweetAlertService.success('Single Cnote DRS Update submitted successfully');
            this.modalRef.hide();
          }
        },
        error: (err: any) => {
          console.error(err);
          this.sweetAlertService.error('Error submitting Single Cnote DRS Update');
        }
      });
    } else {
      this.DRSUpdateForm.markAllAsTouched();
    }
  }
}
