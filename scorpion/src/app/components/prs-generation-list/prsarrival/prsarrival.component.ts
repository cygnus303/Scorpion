import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { DocketService } from 'app/shared/services/docket.service';
import { RouterModule } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { environment } from 'environments/environment';
import { PrsArrivalDetailsService } from 'app/shared/services/prs-arrival-details.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { VendorChargeHelperService } from 'app/shared/services/vendor-charge.service';

@Component({
  selector: 'app-prsarrival',
  standalone: true,
  imports: [CommonModule, RouterModule, NgSelectModule, ReactiveFormsModule, BsDatepickerModule, FormsModule],
  templateUrl: './prsarrival.component.html',
  styleUrl: './prsarrival.component.scss',
  providers: [BsModalService]
})
export class PRSArrivalComponent implements OnInit {
  public modalRef!: BsModalRef;
  public prsArrivalForm!: FormGroup;
  public PRSArrivalDetails: any;
  public dockList: any[] = [];
  public docketList: [] = [];
  public isLoading = false;
  public isSubmitting: boolean = false;
  env = environment;
  public isRedirect: boolean = false;
  public arrivalData: any = {
    pdcno: null,
    loadBy: null,
    chargeType: null
  };
  public rowVendorList: any[][] = [];

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(
    private modalService: BsModalService,
    public generalMasterService: GeneralMasterService,
    private THCMasterService: THCMasterService,
    private vendorChargeHelper: VendorChargeHelperService,
    private fb: FormBuilder,
    private sweetAlertService: SweetAlertService,
    public prsArrivalDetailsService: PrsArrivalDetailsService,
    public docketService: DocketService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.generalMasterService.getLoadingBy();
  }

  showPopup(data: any) {
    this.arrivalData = {
      pdcno: data.pdcno,
      loadBy: null,
      chargeType: null
    };
    this.getVendorType();
    this.generalMasterService.getChargeTypeData();
    this.refreshData()
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  getVendorType() {
    this.THCMasterService.getVendorType(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          const mTypeRow = response.data.find((x: any) => x.documentType === 'P');
          if (mTypeRow) {
            const vendorTypes = mTypeRow.unLoading_VendorType.split(',');
            this.generalMasterService.getLoadingByDetail(vendorTypes);
          }
        }
      }
    });
  }

  onLoadingByChange() {
    if (this.arrivalData.loadBy === 'XX5' || this.arrivalData.loadBy === 'XX9') {
      this.arrivalData.chargeType = null;
    }
    this.refreshData()
  }

  onDataSubmit(event: any) {
    this.dataEmitter.emit(event);
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  refreshData() {
    this.docketService.loginUserList.loadBy = this.arrivalData.loadBy;
    this.docketService.loginUserList.chargeType = this.arrivalData.chargeType;
    this.docketService.loginUserList.id = this.arrivalData.pdcno;
    this.buildForm();
    this.getDeliveryDetail();
  }

  get pdcControls() {
    return (this.prsArrivalForm.get('pdcDetails') as FormArray)?.controls || [];
  }

  getDeliveryDetail() {
    this.isLoading = true;

    const payload = {
      id: this.docketService.loginUserList.id,
      rateType: this.docketService.loginUserList.chargeType,
      unloadBy: this.docketService.loginUserList.loadBy,
      baseLocationCode: this.docketService.loginUserList.LocationCode
    };
    this.THCMasterService.getPRSArrivalDetails(payload).subscribe({
      next: (response: any) => {
        this.PRSArrivalDetails = response.pavm;
        this.docketList = response?.listPAVM || [];
        // Calculate total actuwt from PRSArrivalDetails array
        const totalActuwt = this.docketList?.reduce((sum: number, item: any) => sum + (item.actuwt || 0), 0) || 0;

        this.prsArrivalForm.patchValue({
          actuwt: totalActuwt || 0,
          LoadingBy: this.docketService.loginUserList.loadBy
        });
        this.docketList.forEach((item: any) => {
          item.rateType = this.docketService.loginUserList.chargeType || null;
        });
        const arr = this.prsArrivalForm.get('pdcDetails') as FormArray;
        if (arr) {
          arr.clear();
          this.docketList.forEach((item: any, index: number) => {
            const group = this.createPdcGroup(item);
            arr.push(group);

            const vendorTyp = group.value.luVendorTyp;
            if (vendorTyp) {
              this.vendorChargeHelper.fetchVendorListFor(vendorTyp, (list: any[]) => {
                this.rowVendorList[index] = list;
              });
            }
          });
        }
        this.prsArrivalDetailsService.getVendorsList(this.docketService.loginUserList.loadBy);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Delivery Detail API Error', err);
        this.isLoading = false;
      }
    });
  }

  clearNewRateOnFocus(index: number): void {
    if (this.prsArrivalForm.value.LoadingBy === 'XX5') {
      return;
    }

    const pdcArray = this.prsArrivalForm.get('pdcDetails') as FormArray;
    const control = pdcArray.at(index)?.get('newRate');
    const value = control?.value;

    if (value === 0 || value === '0') {
      setTimeout(() => {
        control?.setValue('');
      });
    }
  }

  resetNewRateOnBlur(index: number): void {
    if (this.prsArrivalForm.value.LoadingBy === 'XX5') {
      return;
    }

    const pdcArray = this.prsArrivalForm.get('pdcDetails') as FormArray;
    const control = pdcArray.at(index)?.get('newRate');
    const value = control?.value;

    if (value === null || value === '' || value === undefined) {
      control?.setValue(0);
    }
  }

  getLoadingCharge(event: any) {
    if (!event) {
      this.prsArrivalForm.patchValue({
        vendorName: null
      });
      return;
    }

    this.prsArrivalForm.patchValue({
      vendorName: event.text   // 👈 Vendor Name store
    });
    const data = {
      loadUnloadType: 'U',
      vendorCode: event.value,
      typeModule: this.docketService.loginUserList.Type === "2" ? "P" : "D",
      chargeType: this.docketService.loginUserList.chargeType,
      brdc: this.docketService.loginUserList.LocationCode,
      loadingBy: this.prsArrivalForm.value.LoadingBy,
    };
    if (['XX5'].includes(this.prsArrivalForm.get('LoadingBy')?.value)) {
      this.THCMasterService.getLoadingCharge(data).subscribe({
        next: (response: any) => {
          this.prsArrivalForm.patchValue({
            Rate: response.rate,
            ratetype: response.rateType
          });
          const pdcArray = this.prsArrivalForm.get('pdcDetails') as FormArray;
          pdcArray?.controls.forEach((item: any, index) => {
            pdcArray.controls[index].patchValue({
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

  buildForm() {
    this.prsArrivalForm = new FormGroup({
      arrivalDate: new FormControl(new Date()),
      actuwt: new FormControl(null),
      LoadingBy: new FormControl(null),
      LoadingCharge: new FormControl(0),
      Rate: new FormControl(null),
      closeKM: new FormControl(0),
      ratetype: new FormControl(null),
      vendorCode: new FormControl(null),
      vendorName: new FormControl(null),
      pdcDetails: new FormArray([])
    });

    this.prsArrivalForm.get('ratetype')?.valueChanges.subscribe(val => {
      const pdcArray = this.prsArrivalForm.get('pdcDetails') as FormArray;
      pdcArray?.controls.forEach((group: any) => {
        const rowVendorTyp = group.get('luVendorTyp')?.value;
        if (rowVendorTyp !== 'XX5' && rowVendorTyp !== 'XX9') {
          group.patchValue({ ratetype: val });
        }
      });
    });
  }

  private createPdcGroup(item: any): FormGroup {
    const group = new FormGroup({
      dockno: new FormControl(item.dockno || item.pdcno || ''),
      orgncd: new FormControl(item.orgncd || ''),
      destcd: new FormControl(item.destcd || ''),
      paybas: new FormControl(item.paybas || item.paybascd || ''),
      ratetype: new FormControl(item.rateType ?? null),
      actuwt: new FormControl(item.actuwt ?? 0),
      pkgsno: new FormControl(item.pkgsno ?? 0),
      chrgwt: new FormControl(item.chrgwt ?? 0),
      vendorcode: new FormControl(item.vendorcode || ''),
      vendorname: new FormControl(item.vendorname || ''),
      newRate: new FormControl(0),
      rateError: new FormControl(''),
      luVendorTyp: new FormControl(null),
      luVendorCode: new FormControl(null),
      totalLoadingCharge: new FormControl(''),
    });
    const initialVendorType = group.get('luVendorTyp')?.value;
    if (initialVendorType && initialVendorType !== 'XX9') {
      group.get('luVendorCode')?.setValidators([Validators.required]);
    } else if (!initialVendorType) {
      group.get('luVendorCode')?.setValidators([Validators.required]);
    }
    group.get('ratetype')?.valueChanges.subscribe(() => this.calculateCharge(group));
    group.get('newRate')?.valueChanges.subscribe(() => this.calculateCharge(group));
    return group;
  }

  onRowVendorTypeChange(event: any, index: number) {
    this.vendorChargeHelper.handleRowVendorTypeChange(
      event?.codeId || event,
      index,
      this.prsArrivalForm.get('pdcDetails') as FormArray,
      this.rowVendorList,
      undefined,
      undefined,
      undefined,
      undefined,
      'U'
    );

    const formArray = this.prsArrivalForm.get('pdcDetails') as FormArray;
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

  headerVendorList: any[] = [];
  onHeaderHccVendorTypeChange(event: any) {
    this.vendorChargeHelper.handleHeaderHccVendorTypeChange(
      event?.codeId || event,
      this.prsArrivalForm.get('pdcDetails') as FormArray,
      this.rowVendorList,
      (list: any[]) => this.headerVendorList = list,
      undefined,
      undefined,
      undefined,
      undefined,
      'U'
    );

    const type = event?.codeId || event;
    const formArray = this.prsArrivalForm.get('pdcDetails') as FormArray;
    formArray.controls.forEach((group: any) => {
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
    });
  }

  onHeaderVendorChange(event: any) {
    this.vendorChargeHelper.handleHeaderVendorChange(
      event?.value || event,
      this.prsArrivalForm.get('pdcDetails') as FormArray,
      'luVendorCode',
      'U',
      this.docketService.loginUserList.chargeType,
      'ratetype',
      'newRate',
      'luVendorTyp',
      this.prsArrivalForm,
      'ratetype'
    );
  }

  onRowVendorCodeChange(event: any, index: number) {
    this.vendorChargeHelper.handleRowVendorCodeChange(
      event?.value || event?.vendor_Code || event,
      index,
      this.prsArrivalForm.get('pdcDetails') as FormArray,
      'U',
      this.docketService.loginUserList.chargeType,
      'ratetype',
      'newRate'
    );
  }

  calculateCharge(group: FormGroup): void {
    const isValid = this.validateRate(group);
    if (!isValid) {
      group.get('totalLoadingCharge')?.setValue((0).toFixed(2), { emitEvent: false });
      this.updateTotalLoadingCharge();
      return;
    }
    const rateType = group.get('ratetype')?.value;
    const newRate = parseFloat(group.get('newRate')?.value || 0);
    const actuwt = parseFloat(group.get('actuwt')?.value || 0);
    const pkgsno = parseFloat(group.get('pkgsno')?.value || 0);
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
    this.updateTotalLoadingCharge();
  }

  validateRate(group: FormGroup): boolean {
    const loadingBy = this.prsArrivalForm.get('LoadingBy')?.value;

    // Skip validation if 'LoadingBy' is 'XX9'
    if (loadingBy === 'XX9') {
      group.get('rateError')?.setValue('');
      return true;
    }
    const rateType = group.get('ratetype')?.value;
    const rate = parseFloat(group.get('newRate')?.value || '0') || 0;
    const chrgwt = parseFloat(group.get('chrgwt')?.value || '0') || 0;
    const noofpkg = parseFloat(group.get('pkgsno')?.value || '0') || 0;

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

  updateTotalLoadingCharge(): void {
    const pdcArray = this.prsArrivalForm.get('pdcDetails') as FormArray;
    const total = pdcArray.controls.reduce((sum, ctrl) => {
      return sum + parseFloat(ctrl.get('totalLoadingCharge')?.value || 0);
    }, 0);

    this.prsArrivalForm.get('LoadingCharge')?.setValue(total.toFixed(2), { emitEvent: false });
  }

  onSubmit() {
    if (this.prsArrivalForm.valid) {
      const params = {
        baseLocationCode: this.docketService.loginUserList.LocationCode,
        BaseCompanyCode: this.docketService.loginUserList.Companycode,
        userid: this.docketService.loginUserList.UserId
      };

      const payload = {
        pavm: {
          ...this.PRSArrivalDetails,
          unloadBy: this.docketService.loginUserList.loadBy || '',
          rateType: this.docketService.loginUserList.chargeType,
          vendorCode_new: this.prsArrivalForm.value.vendorCode,
          vendorName_new: this.prsArrivalForm.value.vendorName,
          ratetype1: this.docketService.loginUserList.chargeType,
          monthlyRate: "",
          arrivalDT: this.prsArrivalForm.value.arrivalDate
            ? new Date(this.prsArrivalForm.value.arrivalDate).toISOString()
            : new Date().toISOString(),

          dockdt: this.PRSArrivalDetails?.dockdt,
          isEnabled: true,
          loadingCharge: this.prsArrivalForm.value.LoadingCharge
        },
        pdcDetail: this.docketList.map((item: any, index: number) => {
          const formItem = this.prsArrivalForm.value.pdcDetails[index];
          return {
            ...item,
            unloadBy: this.docketService.loginUserList.loadBy || '',
            rateType: formItem.ratetype,
            vendorCode_new: this.prsArrivalForm.value.vendorCode,
            vendorName_new: this.prsArrivalForm.value.vendorName,
            ratetype1: formItem.ratetype,
            monthlyRate: "",
            newRate: formItem.newRate,
            arrivalDT: this.prsArrivalForm.value.arrivalDate
              ? new Date(this.prsArrivalForm.value.arrivalDate).toISOString()
              : new Date().toISOString(),
            dockdt: item.dockdt,
            isEnabled: true,
            hccAmt: 0,
            luVendorCode: formItem.luVendorCode,
            luVendorTyp: formItem.luVendorTyp,
          };

        }),
      };
      this.isSubmitting = true;
      this.THCMasterService.prsArrival(params, payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.isRedirect = true;
            this.sweetAlertService.success(`<div style="text-align:center;">
                 <div class="fw-bold fs-3 mb-2">PRS Arrival Success</div>
                 <p class="fs-5 mb-1"><strong>PDC No:</strong> ${res.pdcNo}</p>
                 <p class="fs-5 mb-1"><strong>HC Number:</strong> ${res.hcNumber}</p>
              </div>`);
            this.dataEmitter.emit()
            this.modalRef.hide();
            this.isSubmitting = false;
          } else {
            this.sweetAlertService.error(res?.message);
            this.isSubmitting = false;
          }
        },
        error: (err) => {
          console.error("Error", err);
          this.isSubmitting = false;
          this.isRedirect = false;
        }
      });

    } else {
      this.prsArrivalForm.markAllAsTouched();
      const invalidControls: string[] = [];
      const controls = this.prsArrivalForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalidControls.push(name);
        }
      }

      const pdcDetails = this.prsArrivalForm.get('pdcDetails') as FormArray;
      if (pdcDetails) {
        pdcDetails.controls.forEach((group: any, index: number) => {
          if (group.invalid && group.controls) {
            for (const key in group.controls) {
              if (group.controls[key].invalid) {
                invalidControls.push(`pdcDetails[${index}].${key}`);
              }
            }
          }
        });
      }
      console.log('Invalid Controls on Submit:', invalidControls);
    }
  }
}
