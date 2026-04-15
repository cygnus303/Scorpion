import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { PrsArrivalDetailsService } from 'app/shared/services/prs-arrival-details.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { environment } from 'environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-prs-arrival-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NgSelectModule, ReactiveFormsModule, BsDatepickerModule],
  templateUrl: './prs-arrival-details.component.html',
  styleUrl: './prs-arrival-details.component.scss'
})
export class PRSArrivalDetailsComponent {
  public prsArrivalForm!: FormGroup;
  public PRSArrivalDetails: any;
  public dockList: any[] = [];
  public docketList: [] = [];
  public isLoading = false;
  public isSubmitting: boolean = false;
  env = environment;
  public isRedirect: boolean = false;




  constructor(
    public docketService: DocketService,
    public generalMasterService: GeneralMasterService,
    private THCService: THCMasterService,
    public prsArrivalDetailsService: PrsArrivalDetailsService,
    private sweetAlertService: SweetAlertService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode =  'PIM';
      // this.docketService.loginUserList.loadBy = "B";
      // this.docketService.loginUserList.chargeType='1';
      // this.docketService.loginUserList.id='PS/PIM/2526/002515';
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.buildForm();
    this.getDeliveryDetail();
    this.generalMasterService.getLoadingBy();
    this.generalMasterService.getChargeTypeData();
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
    this.THCService.getPRSArrivalDetails(payload).subscribe({
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
          this.docketList.forEach((item: any) => arr.push(this.createPdcGroup(item)));
        }
        this.prsArrivalDetailsService.getVendorsList(this.docketService.loginUserList.loadBy);
      },
      complete: () => {
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
      this.THCService.getLoadingCharge(data).subscribe({
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
      LoadingBy: new FormControl(null, [Validators.required]),
      LoadingCharge: new FormControl(0),
      Rate: new FormControl(null),
      closeKM: new FormControl(0),
      ratetype: new FormControl(null),
      vendorCode: new FormControl(null, this.docketService.loginUserList.loadBy === 'XX9' ? null : Validators.required),
      vendorName: new FormControl(null),
      pdcDetails: new FormArray([])
    })
  }

  private createPdcGroup(item: any): FormGroup {
    const group = new FormGroup({
      dockno: new FormControl(item.dockno || item.pdcno || ''),
      orgncd: new FormControl(item.orgncd || ''),
      destcd: new FormControl(item.destcd || ''),
      paybas: new FormControl(item.paybascd || ''),
      ratetype: new FormControl(item.rateType ?? null),
      actuwt: new FormControl(item.actuwt ?? 0),
      pkgsno: new FormControl(item.pkgsno ?? 0),
      chrgwt: new FormControl(item.chrgwt ?? 0),
      vendorcode: new FormControl(item.vendorcode || ''),
      vendorname: new FormControl(item.vendorname || ''),
      newRate: new FormControl(0),
      rateError: new FormControl(''),
      totalLoadingCharge: new FormControl(''),
    });
    group.get('ratetype')?.valueChanges.subscribe(() => this.calculateCharge(group));
    group.get('newRate')?.valueChanges.subscribe(() => this.calculateCharge(group));
    return group;
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
          unloadBy: this.docketService.loginUserList.loadBy,
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
            unloadBy: this.docketService.loginUserList.loadBy,
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
            isEnabled: true
          };

        }),

      };

      console.log("FINAL PAYLOAD", payload);
      this.isSubmitting = true;
     this.THCService.prsArrival(params, payload).pipe(finalize(() => {this.isSubmitting = false;})).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.isRedirect = true;
        window.parent.location.href = `${this.env.liveUrl}Operation/PRSArrivalDone?PDCNo=${res.pdcNo}&Tot_Charge=${res.totCharge}&HcNumber=${res.hcNumber}&TranXaction=Done&src=angular`;
      } else {
        this.sweetAlertService.error(res?.message);
      }
    },
    error: (err) => {
      console.error("Error", err);
      this.isRedirect = false;
    }
  });

    } else {
      this.prsArrivalForm.markAllAsTouched();
    }
  }
}
