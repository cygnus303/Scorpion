import { Component, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AbstractControl, FormArray, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'environments/environment';
import { BranchWiseLoadingUnloading } from 'app/shared/models/thc-master.model';
import { DeliveryUpdateService } from 'app/shared/services/delivery-update.service';
import { ChallanService } from 'app/shared/services/challan.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { VendorChargeHelperService } from 'app/shared/services/vendor-charge.service';
import { DRSDateTimePickerComponent } from './drs-date-time-picker/drs-date-time-picker.component';
import { DrsUpdateDepsComponent } from './drs-update-deps/drs-update-deps.component';

@Component({
  selector: 'app-drs-update-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgSelectModule, ReactiveFormsModule, DrsUpdateDepsComponent, BsDatepickerModule, SharedModule, FormsModule, DRSDateTimePickerComponent],
  templateUrl: './drs-update-list.component.html',
  styleUrl: './drs-update-list.component.scss'
})
export class DRSUpdateListComponent {
  env = environment;
  public modalRef!: BsModalRef;
  public DRSSummaryForm!: FormGroup;
  public DRSInformation!: any;
  public minDate: Date | undefined;
  public maxDate = new Date();
  public branchWiseLoadingUnloadingList: BranchWiseLoadingUnloading[] = [];
  public isRedirect: boolean = false;
  public drsDeliveryList: any[] = [];
  public isSubmit: boolean = false;
  public isdeliveryRequired: boolean = false;
  maxCloseKMValue: number = 900000;
  public DRSFilterForm!: FormGroup;
  public isLoading: boolean = false;
  public validatingIndex: number | null = null;
  public validatingType: 'FRONT' | 'BACK' | null = null;
  public isDrsListCollapsed: boolean = true;
  public showDrsListModal: boolean = false;
  public isDrsListOpenedOnce: boolean = false;
  @Input() drsData: any;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('DrsUpdateDepsComponent') depsEntryComponent!: DrsUpdateDepsComponent;

  toggleDrsList() {
    this.showDrsListModal = !this.showDrsListModal;
    if (this.showDrsListModal) {
      this.isDrsListOpenedOnce = true;
    }
  }
  constructor(public challanService: ChallanService, public deliveryUpdateService: DeliveryUpdateService,
    public THCMasterService: THCMasterService,
    private vendorChargeHelper: VendorChargeHelperService,
    public docketService: DocketService, public generalMasterService: GeneralMasterService,
    public sweetAlertService: SweetAlertService, private modalService: BsModalService) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    console.log(this.drsData)
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      //   this.docketService.loginUserList.LocationCode =  'PIM';
      // this.docketService.loginUserList.loadBy = "B";
      // this.docketService.loginUserList.chargeType='1';
      // this.docketService.loginUserList.drsId='DS/PIM/2526/002772';
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.refreshData()
    this.buildFilterForm();
    this.headerVendor = null;
    this.getVendorType();
    this.generalMasterService.getChargeTypeData();
    this.generalMasterService.getLoadingBy()
    this.generalMasterService.getDeliveredToData()
  }

  buildFilterForm() {
    this.DRSFilterForm = new FormGroup({
      loadBy: new FormControl(null),
      chargeType: new FormControl(null)
    })
  }

  refreshData() {
    // this.docketService.loginUserList.loadBy = this.DRSFilterForm.value.loadBy;
    // this.docketService.loginUserList.chargeType = this.DRSFilterForm.value.chargeType;
    this.docketService.loginUserList.drsId = this.drsData.drsNo;
    this.buildForm();
    this.getDeliveryDetail();
  }

  onLoadingByChange() {
    const loadBy = this.DRSFilterForm.get('loadBy')?.value;
    if (loadBy === 'XX5' || loadBy === 'XX9') {
      this.DRSFilterForm.get('chargeType')?.setValue(null);
    }
    this.refreshData();
  }

  triggerRefresh() {
    this.drsData = { ...this.drsData };
  }

  closeModal() {
    this.dataEmitter.emit('close');
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.drsList.controls.forEach(control => {
      control.get('isChecked')?.setValue(isChecked);
    });
  }

  isAllSelected(): boolean {
    if (this.drsList.controls.length === 0) return false;
    return this.drsList.controls.every(control => control.get('isChecked')?.value === true);
  }

  get selectedCount(): number {
    return this.drsList.controls.filter(c => c.get('isChecked')?.value === true).length;
  }

  get unselectedCount(): number {
    return this.drsList.controls.filter(c => !c.get('isChecked')?.value).length;
  }

  getVendorType() {
    this.THCMasterService.getVendorType(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          const mTypeRow = response.data.find((x: any) => x.documentType === 'D');
          if (mTypeRow) {
            const vendorTypes = mTypeRow.unLoading_VendorType.split(',');
            this.generalMasterService.getLoadingByDetail(vendorTypes);
          }
        }
      }
    });
  }

  buildForm() {
    this.DRSSummaryForm = new FormGroup({
      LoadingBy: new FormControl(null),
      vendorCode: new FormControl(null),
      vendorName: new FormControl(null),
      LoadingCharge: new FormControl(0),
      Rate: new FormControl(null),
      closeKM: new FormControl(0),
      ratetype: new FormControl(null),
      drsList: new FormArray([])
    })
    this.DRSSummaryForm.get('LoadingBy')?.valueChanges
      .subscribe(value => this.updateValidatorsByLoadingBy(value));
  }

  updateValidatorsByLoadingBy(loadingBy: string) {
    const vendorCtrl = this.DRSSummaryForm.get('vendorCode');
    // const loadingChargeCtrl = this.DRSSummaryForm.get('LoadingCharge');

    // // 🔴 XX9 → NO validation
    // if (loadingBy === 'XX9') {
    //   vendorCtrl?.clearValidators();
    //   loadingChargeCtrl?.clearValidators();
    // }
    // // 🟢 Other cases → validation required
    // else {
    //   // vendorCtrl?.setValidators([Validators.required]);
    //   // loadingChargeCtrl?.setValidators([
    //   //   Validators.required,
    //   //   Validators.min(0.01)
    //   // ]);
    // }

    // // 🔄 refresh validity
    // vendorCtrl?.updateValueAndValidity();
    // loadingChargeCtrl?.updateValueAndValidity();
  }


  get drsList(): FormArray {
    return this.DRSSummaryForm.get('drsList') as FormArray;
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

  clearNewRateOnFocus(index: number): void {
    if (this.DRSSummaryForm.value.LoadingBy === 'XX5') {
      return;
    }

    const control = this.drsList.at(index).get('newRate');
    const value = control?.value;

    if (value === 0 || value === '0') {
      setTimeout(() => {
        control?.setValue('');
      });
    }
  }

  resetNewRateOnBlur(index: number): void {
    if (this.DRSSummaryForm.value.LoadingBy === 'XX5') {
      return;
    }

    const control = this.drsList.at(index).get('newRate');
    const value = control?.value;

    // user kai change na kare ane blank hoy to 0 set karo
    if (value === null || value === '' || value === undefined) {
      control?.setValue(0);
    }
  }

  createDrsRow(data: any[]) {
    data.forEach((item: any, index: number) => {
      const [day, month, year] = item.booking_Date.split('/');
      const formattedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      const group = new FormGroup({
        autoNo: new FormControl(item.autoNo),
        dockno: new FormControl(item.dockno),
        booking_Date: new FormControl(formattedDate),
        orgncd: new FormControl(item.orgncd),
        destcd: new FormControl(item.destcd),
        payBasis: new FormControl(item.payBasis),
        csgncd: new FormControl(item.csgncd),
        csgnnm: new FormControl(item.csgnnm),
        csgecd: new FormControl(item.csgecd),
        csgenm: new FormControl(item.csgenm),
        actQty: new FormControl(item.actQty),
        pkgQty: new FormControl(item.pkgQty),
        pkgs_Pending: new FormControl(item.pkgs_Pending),
        pkgs_Arrived: new FormControl(item.pkgs_Arrived),
        pkgs_Booked: new FormControl(item.pkgs_Booked),
        comm_Dely_Dt: new FormControl(item.comm_Dely_Dt),
        deliveredPkgs: new FormControl(item.pkgs_Arrived, [Validators.required, this.maxPendingValidator('pkgs_Pending')]),
        remarks: new FormControl(''),
        isChecked: new FormControl(true),
        isBadPod: new FormControl(),
        ratetype: new FormControl(item.rateType),
        newRate: new FormControl(0),
        otp: new FormControl(''),
        DELYDATE: new FormControl(this.getCurrentDateTime()),
        cboReason: new FormControl(),
        cboEmail: new FormControl(''),
        cboMobileNo: new FormControl(''),
        luVendorTyp: new FormControl(null),
        luVendorCode: new FormControl(null),
        hccAmt: new FormControl(0),
        DELYPERSON: new FormControl(''),
        totalLoadingCharge: new FormControl(''),
        showReason: new FormControl(false),
        rateError: new FormControl(''),
        frontFiles: new FormControl<File[]>([]),
        backFiles: new FormControl<File[]>([]),
        frontPreview: new FormControl<string | null>(null),
        backPreview: new FormControl<string | null>(null),
        podValidated: new FormControl(false),
        coddodno: new FormControl(item.coddodno),
        docksf: new FormControl(item.docksf),
        coddodcollected: new FormControl(item.coddodcollected),
        coD_DOD: new FormControl(item.coD_DOD),
        coddodAmount: new FormControl(item.coddodAmount),
        DeliveredTo: new FormControl(item.deliveredTo),
        DlyPerson: new FormControl(item.dlyPerson),
        DlyContactNo: new FormControl(item.dlyContactNo),
        invval: new FormControl(item.invval),
        dlypdcno: new FormControl(item.dlypdcno),
        depsData: new FormControl(null)
      });

      const initialVendorType = group.get('luVendorTyp')?.value;
      if (initialVendorType && initialVendorType !== 'XX9') {
        group.get('luVendorCode')?.setValidators([Validators.required]);
        group.get('ratetype')?.setValidators([Validators.required]);
      } else {
        group.get('luVendorCode')?.clearValidators();
        group.get('ratetype')?.clearValidators();
      }
      group.get('luVendorCode')?.updateValueAndValidity({ emitEvent: false });
      group.get('ratetype')?.updateValueAndValidity({ emitEvent: false });
      group.get('ratetype')?.valueChanges.subscribe(() => this.calculateCharge(group));
      group.get('newRate')?.valueChanges.subscribe(() => this.calculateCharge(group));
      group.get('deliveredPkgs')?.valueChanges.subscribe(() => {
        this.updateDeliveryValidators(group);
      });
      group.get('isChecked')?.valueChanges.subscribe(() => {
        this.updateDeliveryValidators(group);
      });
      this.drsList.push(group);
      group.get('deliveredPkgs')?.updateValueAndValidity({ emitEvent: false });
      this.updateDeliveryValidators(group);

      const vendorTyp = group.value.luVendorTyp;
      if (vendorTyp) {
        this.vendorChargeHelper.fetchVendorListFor(vendorTyp, (list: any[]) => {
          this.rowVendorList[index] = list;
        });
      }
    });
  }

  rowVendorList: any[][] = [];
  headerVendorList: any[] = [];
  public headerVendor: any = null;

  onHeaderHccVendorTypeChange(event: any) {
    this.headerVendor = null;
    this.vendorChargeHelper.handleHeaderHccVendorTypeChange(
      event?.codeId || event,
      this.DRSSummaryForm.get('drsList') as FormArray,
      this.rowVendorList,
      (list: any[]) => this.headerVendorList = list,
      undefined,
      undefined,
      undefined,
      undefined,
      'U'
    );

    const type = event?.codeId || event;
    const formArray = this.DRSSummaryForm.get('drsList') as FormArray;
    formArray.controls.forEach((group: any) => {
      group.get('newRate')?.patchValue(0);
      const vendorCodeCtrl = group.get('luVendorCode');
      const rateTypeCtrl = group.get('ratetype');
      if (type && type !== 'XX9') {
        vendorCodeCtrl?.setValidators([Validators.required]);
        rateTypeCtrl?.setValidators([Validators.required]);
      } else {
        vendorCodeCtrl?.clearValidators();
        rateTypeCtrl?.clearValidators();
      }
      vendorCodeCtrl?.updateValueAndValidity({ emitEvent: false });
      rateTypeCtrl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  onHeaderRateTypeChange(event: any) {
    this.vendorChargeHelper.handleHeaderRateTypeChange(
      event?.codeId || event,
      this.DRSSummaryForm.get('drsList') as FormArray,
      'ratetype'
    );
  }

  onHeaderVendorChange(event: any) {
    this.vendorChargeHelper.handleHeaderVendorChange(
      event?.value || event,
      this.DRSSummaryForm.get('drsList') as FormArray,
      'luVendorCode',
      'U',
      this.docketService.loginUserList.chargeType,
      'ratetype',
      'newRate',
      'luVendorTyp'
    );
  }

  onRowVendorTypeChange(event: any, index: number) {
    this.vendorChargeHelper.handleRowVendorTypeChange(
      event?.codeId || event,
      index,
      this.DRSSummaryForm.get('drsList') as FormArray,
      this.rowVendorList,
      undefined,
      undefined,
      undefined,
      undefined,
      'U'
    );

    const formArray = this.DRSSummaryForm.get('drsList') as FormArray;
    const group = formArray.at(index);
    group.get('newRate')?.patchValue(0);
    const vendorCodeCtrl = group.get('luVendorCode');
    const rateTypeCtrl = group.get('ratetype');
    const type = event?.codeId || event;
    if (type && type !== 'XX9') {
      vendorCodeCtrl?.setValidators([Validators.required]);
      rateTypeCtrl?.setValidators([Validators.required]);
    } else {
      vendorCodeCtrl?.clearValidators();
      rateTypeCtrl?.clearValidators();
    }
    vendorCodeCtrl?.updateValueAndValidity({ emitEvent: false });
    rateTypeCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onRowVendorCodeChange(event: any, index: number) {
    this.vendorChargeHelper.handleRowVendorCodeChange(
      event?.value || event?.vendor_Code || event,
      index,
      this.DRSSummaryForm.get('drsList') as FormArray,
      'U', // Assuming Unload/delivery for DRS
      this.docketService.loginUserList.chargeType,
      'ratetype',
      'newRate'
    );
  }

  isRequired(controlName: string, index: number): boolean {
    const control = (this.drsList.at(index) as FormGroup).get(controlName);

    if (!control) return false;

    const validator = control.validator?.({} as AbstractControl);

    return validator?.['required'] ?? false;
  }

  maxPendingValidator(pendingKey: string) {
    return (control: AbstractControl) => {
      if (!control.parent) return null;

      const pending = control.parent.get(pendingKey)?.value;
      const delivered = control.value;

      if (delivered > pending) {
        return { maxPending: true };
      }
      return null;
    };
  }

  validateRate(group: FormGroup): boolean {
    const loadingBy = this.DRSSummaryForm.get('LoadingBy')?.value;

    // Skip validation if 'LoadingBy' is 'XX9'
    if (loadingBy === 'XX9') {
      group.get('rateError')?.setValue('');
      return true;
    }
    const rateType = group.get('ratetype')?.value;
    const rate = parseFloat(group.get('newRate')?.value || '0') || 0;
    const chrgwt = parseFloat(group.get('actQty')?.value || '0') || 0;
    const noofpkg = parseFloat(group.get('pkgQty')?.value || '0') || 0;

    // Handle case where 'actQty' is zero
    if (chrgwt === 0) {
      group.get('rateError')?.setValue('Charge weight is zero, cannot validate rate.');
      group.get('newRate')?.setValue('0.00', { emitEvent: false });
      return false;
    }

    let maxlimitcalculation = 0;

    // Handling the rate calculation based on rateType
    if (rateType === '4') {
      maxlimitcalculation = rate / chrgwt;
    } else if (rateType === '3') {
      maxlimitcalculation = (rate * noofpkg) / chrgwt;
    } else {
      maxlimitcalculation = rate;
    }

    // Checking the calculated maxlimit
    if (maxlimitcalculation > 5.0) {
      group.get('rateError')?.setValue('Rate Amount Is High, Please Check');
      group.get('newRate')?.setValue('0.00', { emitEvent: false });
      return false;
    } else {
      group.get('rateError')?.setValue('');
      return true;
    }
  }

  calculateCharge(group: FormGroup) {
    const isValid = this.validateRate(group);
    if (!isValid) {
      group.get('totalLoadingCharge')?.setValue((0).toFixed(2), { emitEvent: false });
      this.updateTotalLoadingCharge();
      return;
    }
    const rateType = group.get('ratetype')?.value;
    const newRate = parseFloat(group.get('newRate')?.value || 0);
    const actuwt = parseFloat(group.get('actQty')?.value || 0);
    const pkgsno = parseFloat(group.get('pkgQty')?.value || 0);
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
    group.get('totalLoadingCharge')?.setValue(charge.toFixed(2), { emitEvent: false });
    this.updateTotalLoadingCharge()
  }

  getMinDate(bookingDate: string): Date {
    return new Date(bookingDate);
  }

  updateTotalLoadingCharge() {
    const total = this.drsList.controls.reduce((sum, ctrl) => {
      return sum + parseFloat(ctrl.get('totalLoadingCharge')?.value || 0);
    }, 0);

    this.DRSSummaryForm.get('LoadingCharge')?.setValue(total.toFixed(2), { emitEvent: false });
  }
  // in TS
  getRadioControl(i: number): FormControl {
    return (this.drsList.at(i) as FormGroup).get('isBadPod') as FormControl;
  }

  getDeliveryDetail() {
    this.isLoading = true;
    const payload = {
      drsId: this.docketService.loginUserList.drsId,
      loadBy: this.docketService.loginUserList.loadBy || null,
      chargeType: this.docketService.loginUserList.chargeType || null,
      baseLocationCode: this.docketService.loginUserList.LocationCode
    };
    this.THCMasterService.getDeliveryUpdateData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.DRSInformation = response.data.drsSummary;
        const summaryRateType = response.data.drsSummary?.rateType;
        this.drsDeliveryList = response.data.drsDeliveryList;
        this.DRSSummaryForm.patchValue({
          closeKM: this.DRSInformation?.closeKM,
          LoadingBy: response.data.drsSummary.loadingBy
        });
        this.updateValidatorsByLoadingBy(response.data.drsSummary.loadingBy);
        const docketList = response.data.updateDRSLits || [];
        this.drsList.clear();
        docketList.forEach((item: any) => {
          item.rateType = summaryRateType;
        });
        this.createDrsRow(docketList);
        this.getPANnumberData(response.data.drsSummary.loadingBy);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Delivery Detail API Error', err);
      }
    });
  }

  getLoadingCharge(event: any) {
    if (!event) {
      this.DRSSummaryForm.patchValue({
        vendorName: null
      });
      return;
    }

    this.DRSSummaryForm.patchValue({
      vendorName: event.text   // 👈 Vendor Name store
    });
    const data = {
      loadUnloadType: 'U',
      vendorCode: event.value,
      typeModule: this.docketService.loginUserList.Type === "2" ? "P" : "D",
      chargeType: this.docketService.loginUserList.chargeType,
      brdc: this.docketService.loginUserList.LocationCode,
      loadingBy: this.DRSSummaryForm.value.LoadingBy,
    };
    if (['XX5'].includes(this.DRSSummaryForm.get('LoadingBy')?.value)) {
      this.THCMasterService.getLoadingCharge(data).subscribe({
        next: (response: any) => {
          this.DRSSummaryForm.patchValue({
            Rate: response.rate
          });
          this.drsList.controls.forEach((item: any, index) => {
            this.drsList.controls[index].patchValue({
              newRate: response.rate,
              ratetype: response.rateType
            });
          });
        },
        error: (err) => {
          console.error('Error fetching loading charge:', err);
        }
      });
    }
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

  updateDeliveryValidators(row: FormGroup): void {
    const delivered = Number(row.get('deliveredPkgs')?.value || 0);
    const pending = Number(row.get('pkgs_Pending')?.value || 0);
    const isChecked = row.get('isChecked')?.value;

    const deliveredToCtrl = row.get('DeliveredTo');
    const personCtrl = row.get('DlyPerson');
    const contactCtrl = row.get('DlyContactNo');

    if (!isChecked || (delivered !== pending && pending > 0)) {
      deliveredToCtrl?.clearValidators();
      personCtrl?.clearValidators();
      contactCtrl?.clearValidators();

      if (!isChecked) {
        deliveredToCtrl?.setValue(null, { emitEvent: false });
        personCtrl?.setValue(null, { emitEvent: false });
        contactCtrl?.setValue(null, { emitEvent: false });
      } else {
        deliveredToCtrl?.setValue(null, { emitEvent: false });
        personCtrl?.setValue(null, { emitEvent: false });
        contactCtrl?.setValue(null, { emitEvent: false });
      }
    } else {
      deliveredToCtrl?.setValidators([Validators.required]);

      personCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2)
      ]);

      contactCtrl?.setValidators([
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]);
    }

    deliveredToCtrl?.updateValueAndValidity({ emitEvent: false });
    personCtrl?.updateValueAndValidity({ emitEvent: false });
    contactCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onDeliveredBlur(index: number): void {
    const row = this.drsList.at(index) as FormGroup;
    const delivered = Number(row.get('deliveredPkgs')?.value || 0);
    const pending = Number(row.get('pkgs_Pending')?.value || 0);

    this.updateDeliveryValidators(row);

    // 🔹 Clear old validators first
    row.get('DELYPERSON')?.clearValidators();
    row.get('cboReason')?.clearValidators();
    row.get('cboEmail')?.clearValidators();
    row.get('cboMobileNo')?.clearValidators();

    let show = false;
    let reasonType = '';

    //  Delivered = 0 → UNDELY
    if (delivered === 0) {
      show = true;
      reasonType = 'UNDELY';
    }
    // Delivered < Pending → PART_D
    else if (delivered < pending) {
      show = true;
      reasonType = 'PART_D';
    }
    //  Delivered > Pending → LATE_D
    else if (delivered > pending) {
      show = true;
      reasonType = 'LATE_D';
    }


    if (show) {
      row.patchValue({ showReason: true, cboReason: null });
      this.generalMasterService.getReason(reasonType);

      // 🔹 Apply validators ONLY when showReason = true
      row.get('cboReason')?.setValidators([Validators.required]);

      if (delivered > 0) {
        row.get('DELYPERSON')?.setValidators([Validators.required]);
        row.get('cboEmail')?.setValidators([Validators.required, Validators.email]);
        row.get('cboMobileNo')?.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]);
      } else {
        // If 0, clear their values and they are not required
        row.get('DELYPERSON')?.setValue(null);
        row.get('cboEmail')?.setValue(null);
        row.get('cboMobileNo')?.setValue(null);
        row.get('DeliveredTo')?.setValue(null);
        row.get('DlyPerson')?.setValue(null);
        row.get('DlyContactNo')?.setValue(null);
      }
    } else {
      row.patchValue({
        showReason: false,
        DELYPERSON: null,
        cboReason: null,
        cboEmail: null,
        cboMobileNo: null,
        remarks: null
      });
    }

    // 🔹 Refresh validation state
    row.get('DELYPERSON')?.updateValueAndValidity();
    row.get('cboReason')?.updateValueAndValidity();
    row.get('cboEmail')?.updateValueAndValidity();
    row.get('cboMobileNo')?.updateValueAndValidity();
  }


  branchWiseLoadingUnloading(event: any) {
    const data = {
      vendorType: event,
      baseLocationCode: this.docketService.loginUserList.LocationCode,
      type: 'U',
    }
    this.THCMasterService.getBranchWiseLoadingUnloadingVendorList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.branchWiseLoadingUnloadingList = response.data;
        }
      },
    });
  }

  getChargesVendorsList(event: any) {
    const data = {
      vendorType: event?.codeId ? event?.codeId : event,
      branchCode: this.docketService.loginUserList.LocationCode,
      userName: this.docketService.loginUserList.BaseUserName,
      documentType: this.docketService.loginUserList.Type
    }
    this.THCMasterService.getVendorsList(data).subscribe({
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

  getPreview(file: File): string {
    return URL.createObjectURL(file);
  }

  onFileSelected(event: any, index: number, type: 'FRONT' | 'BACK') {
    const file = event.target.files?.[0];
    if (!file) return;

    const row = this.drsList.at(index) as FormGroup;
    const previewUrl = URL.createObjectURL(file);

    if (type === 'FRONT') {
      // cleanup old url
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

    if (type === 'FRONT') {
      this.validatePOD(index, type);
    }
    else if (type === 'BACK') {
      this.validatePOD(index, type);
    }
  }


  removeFile(index: number, type: 'FRONT' | 'BACK') {
    const row = this.drsList.at(index) as FormGroup;

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

  isPodFrontRequired(index: number): boolean {
    const row = this.drsList.at(index) as FormGroup;

    const deliveredPkgs = Number(row.get('deliveredPkgs')?.value || 0);
    const frontPreview = row.get('frontPreview')?.value;
    const isChecked = row.get('isChecked')?.value;

    return (
      isChecked &&
      deliveredPkgs > 0 &&
      !frontPreview &&
      (row.get('frontFiles')?.touched || this.isSubmit)
    );
  }

  openDeps(data: any, index: number) {
    this.depsEntryComponent.showPopup(
      data,
      this.DRSInformation?.pdcno || this.drsData?.drsNo,
      this.DRSInformation?.drsDate || this.drsData?.drsDate,
      this.DRSSummaryForm.value.vendorName || this.DRSInformation?.vendorName,
      this.drsDeliveryList?.length || 0,
      index
    );
  }

  onDepsDataReceived(event: any) {
    if (event && event.depsData) {
      const row = this.drsList.at(event.rowIndex) as FormGroup;
      row.get('depsData')?.setValue(event.depsData);
    }
  }

  clearDepsData(index: number) {
    const row = this.drsList.at(index) as FormGroup;
    if (row) {
      row.get('depsData')?.setValue(null);
    }
  }

  validatePOD(index: number, type: 'FRONT' | 'BACK' = 'FRONT') {

    const row = this.drsList.at(index) as FormGroup;
    const docketNo = row.get('dockno')?.value;

    if (!docketNo) {
      console.error('Dock No not found for row', index);
      return;
    }

    const frontFiles = row.get('frontFiles')?.value || [];
    const backFiles = row.get('backFiles')?.value || [];

    // OPTIONAL: only front mandatory
    if (!frontFiles.length && type === 'FRONT') {
      return;
    }

    const formData = new FormData();
    formData.append('DocNo', docketNo);

    frontFiles.forEach((file: File) => {
      formData.append('PodFile', file);
    });

    // If backend needs back also
    backFiles.forEach((file: File) => {
      formData.append('PodFile', file);
    });

    this.validatingIndex = index;
    this.validatingType = type;
    this.deliveryUpdateService.CheckPODValidation(formData, this.docketService.loginUserList.UserId).subscribe({
      next: (response: any) => {
        this.validatingIndex = null;
        this.validatingType = null;
        if (response?.status) {
          row.patchValue({ podValidated: true });
        } else {
          this.sweetAlertService.error(response.message);
          this.removeFile(index, 'FRONT');
          this.removeFile(index, 'BACK');
        }
      },
      error: (error) => {
        this.validatingIndex = null;
        this.validatingType = null;
        this.sweetAlertService.error(
          error?.error?.message || `Error validating POD for Dock No ${docketNo}`
        );
        this.removeFile(index, 'FRONT');
        this.removeFile(index, 'BACK');
      }
    });
  }

  onCloseKMFocus() {
    const control = this.DRSSummaryForm.get('closeKM');

    control?.setValue(null);
  }

  validateCloseKM() {
    const control = this.DRSSummaryForm.get('closeKM');
    if (control?.value === null || control?.value === '') {
      control.setValue(0);
    }
    const loadingBy = this.DRSSummaryForm.get('LoadingBy')?.value;
    const startKM = Number(this.DRSInformation?.start_KM);
    const closeKMControl = this.DRSSummaryForm.get('closeKM');

    // DEFAULT MAX (always applicable)
    this.maxCloseKMValue = 900000;

    // Additional restriction only when NOT B / XX6
    if (loadingBy !== 'B' && loadingBy !== 'XX6') {
      const calculatedMax = startKM + 2000;
      this.maxCloseKMValue =
        calculatedMax > 900000 ? 900000 : calculatedMax;
    }

    closeKMControl?.setValidators([
      Validators.required,
      Validators.max(this.maxCloseKMValue)
    ]);

    closeKMControl?.updateValueAndValidity();
  }


  getInvalidPODRows(): number[] {
    const invalidIndexes: number[] = [];

    this.drsList.controls.forEach((row: any, index: number) => {
      const deliveredPkgs = Number(row.get('deliveredPkgs')?.value || 0);
      const frontFiles = row.get('frontFiles')?.value || [];
      const isChecked = row.get('isChecked')?.value;

      if (isChecked && deliveredPkgs > 0 && frontFiles.length === 0) {
        invalidIndexes.push(index);
      }
    });

    return invalidIndexes;
  }

  hasPODError(): boolean {
    let hasError = false;

    this.drsList.controls.forEach((row: any) => {
      const deliveredPkgs = Number(row.get('deliveredPkgs')?.value || 0);
      const frontFiles = row.get('frontFiles')?.value || [];
      const isChecked = row.get('isChecked')?.value;

      if (isChecked && deliveredPkgs > 0 && frontFiles.length === 0) {
        hasError = true;
        row.get('frontFiles')?.markAsTouched();
      }
    });

    return hasError;
  }


  deliveryUpdate() {
    const DepsList: any[] = [];
    this.drsList.controls.forEach(ctrl => {
      if (ctrl.value.depsData && ctrl.value.isChecked === true) {
        DepsList.push(ctrl.value.depsData);
      }
    });
    const DRSDocketsUpdateList = this.drsList.getRawValue()
      .filter((row: any) => row.isChecked === true)
      .map((row: any) => ({
      remark: row.remarks || '',
      isEnabledBadPodoption: row.isBadPod === true,
      autoNo: row.autoNo,
      dockno: row.dockno,
      isEnabled: row.isChecked === true,
      ratetype: row.ratetype,
      delydate: row.DELYDATE,   // already ISO
      pkgsdelivered: Number(row.deliveredPkgs) || 0,
      pkgs_Pending: Number(row.pkgs_Pending) || 0,
      newRate: Number(row.newRate) || 0,
      coddodno: Number(row.coddodno) || 0,
      delyperson: row.DELYPERSON || '',
      docksf: row.docksf || '',
      coddodcollected: Number(row.coddodcollected) || 0,
      cboEmail: row.cboEmail || '',
      coD_DOD: row.coD_DOD || '',
      cboMobileNo: row.cboMobileNo || '',
      cboReason: row.cboReason || '',
      payBasis: row.payBasis || '',
      coddodAmount: Number(row.coddodAmount) || 0,
      cboLateReason: "",
      DeliveredTo: row.DeliveredTo,
      DlyContactNo: row.DlyContactNo,
      DlyPerson: row.DlyPerson || '',
      hccAmt: row.hccAmt || 0,
      luVendorTyp: row.luVendorTyp || '',
      luVendorCode: row.luVendorCode || ''
    }));

    const formData = new FormData();
    formData.append("DRSDocketsUpdateList", JSON.stringify(DRSDocketsUpdateList));
    formData.append("DepsList", JSON.stringify(DepsList));
    formData.append("pdcno", this.DRSInformation.pdcno);
    formData.append("VendorName", this.DRSSummaryForm.value.vendorName);
    formData.append("MaxLimit", this.DRSInformation.maxLimit);
    formData.append("IsMathadi", this.DRSInformation.isMathadi);
    formData.append("RateType", this.DRSInformation.rateType);
    formData.append("Rate", this.DRSInformation.rate);
    formData.append("MathadiSlipNo", '0');
    formData.append("MathadiDate", this.DRSInformation.mathadiDate);
    formData.append("MathadiAmt", this.DRSInformation.mathadiAmt);
    formData.append("LoadingBy", this.DRSInformation.loadingBy);
    formData.append("VendorCode", this.DRSSummaryForm.value.vendorCode);
    formData.append("IsMonthly", this.DRSInformation.isMonthly);
    formData.append("LoadingCharge", this.DRSSummaryForm.value.LoadingCharge);
    formData.append("CloseKM", this.DRSSummaryForm.value.closeKM);
    formData.append("LocationCode", this.docketService.loginUserList.LocationCode);
    formData.append("BaseUserName", this.docketService.loginUserList.BaseUserName);
    formData.append("FinYear", this.docketService.loginUserList.FinYear);

    this.drsList.controls.forEach((ctrl: any) => {
      if (ctrl.value.isChecked === true) {
        ctrl.value.frontFiles.forEach((file: File) => {
          formData.append('Files', file, `${ctrl.value.dockno}_FRONT_${file.name}`);
        });

        ctrl.value.backFiles.forEach((file: File) => {
          formData.append('BackFiles', file, `${ctrl.value.dockno}_BACK_${file.name}`);
        });
      }
    });
    const podError = this.hasPODError();
    if (this.DRSSummaryForm.valid && !podError) {
      this.isSubmit = true;
      this.deliveryUpdateService.deliveryUpdate(formData).subscribe({
        next: (response: any) => {
          if (response && response.data && !response.data.isError) {
            // if (this.drsData) {
            // this.sweetAlertService.success('DRS update successfully!!');
            this.sweetAlertService.success(`<div style="text-align:center;">
                      <div class="fw-bold fs-3 mb-2">DRS Update Success</div>
                      <p class="fs-5 mb-1"><strong>DRSNO:</strong> ${this.DRSInformation?.pdcno}</p>
                   </div>`);
            this.dataEmitter.emit('submit');

            // Close modal if it's open
            if (this.modalRef) {
              this.modalRef.hide();
            }
            // } else {
            //   this.isRedirect = true;
            //   window.parent.location.href = `${this.env.liveUrl}Operation/UpdateDRSResult?DRSNO=${this.DRSInformation?.pdcno}&src=angular`;
            // }
          } else {
            this.sweetAlertService.error('You have some form errors. Please check below.');
          }
          this.isSubmit = false;
        }, error: (error) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.sweetAlertService.error(error?.error?.message);
          this.isSubmit = false;
          this.isRedirect = false;
        }
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.DRSSummaryForm.markAllAsTouched();

      // 🔹 Summary invalid
      const invalidSummary = Object.keys(this.DRSSummaryForm.controls).filter(
        key => this.DRSSummaryForm.get(key)?.invalid
      );
      console.log('❌ Invalid Summary Controls:', invalidSummary);

      // 🔹 drsList invalid controls
      this.drsList.controls.forEach((row: any, i: number) => {
        const invalidRow = Object.keys(row.controls).filter(
          key => row.get(key)?.invalid
        );

        if (invalidRow.length) {
          console.log(`❌ drsList[${i}] Invalid Fields:`, invalidRow);
        }
      });

      // 🔥 POD INVALID LOG
      const podInvalidRows = this.getInvalidPODRows();
      if (podInvalidRows.length) {
        console.log('❌ POD Front missing at rows:', podInvalidRows);
      }
    }
  }

}
