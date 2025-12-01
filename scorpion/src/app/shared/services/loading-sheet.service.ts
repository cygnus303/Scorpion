import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DocketService } from './docket.service';
import { LoadingSheetApiService } from './loading-sheet-api.service';
import { SweetAlertService } from './sweet-alert.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoadingSheetService {
 public LSForm!:FormGroup;
  env = environment;
  constructor(public docketService:DocketService,public loadingSheetApiService: LoadingSheetApiService, public sweetAlertService:SweetAlertService) { }


  buildForm(){
    const Type = this.docketService.loginUserList.Type === 'LS'
    const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - 29);

    this.LSForm=new FormGroup({
      lsNO:new FormControl(''),
      lsDate:new FormControl(this.formatDate(today)),
      manualLsNO:new FormControl('N/A'),
      loadingBy:new FormControl(null, Type ? Validators.required : null),
      nextStopLocation:new FormControl(null,Type ? Validators.required : null),
      rateType:new FormControl(null),
      mF_TransportMode:new FormControl('S',Type ? Validators.required : null),
      rdVehicle:new FormControl('Own'),
      loadedRateType:new FormControl('1'),
      sealNo:new FormControl(''),
      vehno:new FormControl(null),
      preparedBy:new FormControl(''),
      UserName:new FormControl(this.docketService.baseUsername),
      lsType:new FormControl(null),
      reportrange:new FormControl([fromDate, today]),
      transportMode:new FormControl(null),
      destinationList:new FormControl(''),
      docketNoList:new FormControl(''),
      vendorCode:new FormControl(null,Type ? Validators.required : null),
      vendorName:new FormControl(''),
      loadingCharge:new FormControl(0,Type ? [Validators.required, Validators.min(0.01)] : null),
      isMathadi:new FormControl(false),
      mathadiSlipNo:new FormControl(''),
      mathadiDate:new FormControl(this.formatDate(today)),
      mathadiAmt:new FormControl(0),
      docketList: new FormArray([]),
      loadingByUser:new FormControl(),
      LoadingSupervisor:new FormControl(),
      NEXTLOC:new FormControl(''),
      VehicleType:new FormControl(''),
      isMonthly:new FormControl(this.docketService.loginUserList.Type === 'LS' ? true: false)
    })
  }

  setDocketList(list: any[]) {
  const fa = this.LSForm.get('docketList') as FormArray;
  fa.clear();

  list.forEach(item => {

    const group = new FormGroup({
      id:new FormControl(item.id),
       docketNo:new FormControl(item.docketNo),
       dockno:new FormControl(item.dockno),
       docksf:new FormControl(item.docksf),
       manual_dockno:new FormControl(item.manual_dockno),
       pkgsno:new FormControl(item.pkgsno),
       actuwt:new FormControl(item.actuwt),
       transMode:new FormControl(item.transMode),
       docketDate:new FormControl(item.docketDate),
       orgCode:new FormControl(item.orgCode),
       commited_DelyDate:new FormControl(item.commited_DelyDate),
       packagesLB:new FormControl(item.packagesLB),
       weightLB:new FormControl(item.weightLB),
       reDestCode:new FormControl(item.reDestCode),
       PackageLB:new FormControl(item.packagesLB),
       WeightsLB:new FormControl(item.weightLB),
       fromTo:new FormControl(item.fromTo),
       isChecked:new FormControl(item.isChecked),
       handlingCharge:new FormControl(item.handlingCharge),
       isCP:new FormControl(item.isCP),
       rate:new FormControl(item.rate),
       maxLimit:new FormControl(item.maxLimit),
       isMonthly:new FormControl(item.isMonthly),
       newRate:new FormControl(item.newRate),
       ratetype:new FormControl(item.ratetype),
       cnt:new FormControl(item.cnt),
       eWayBillNo:new FormControl(item.eWayBillNo),
       message:new FormControl(item.message),
       errorMassage:new FormControl(item.errorMassage),
       isRemoved:new FormControl(item.isRemoved),
       pickup_Dely:new FormControl(item.pickup_Dely),
       charge: new FormControl(0),
       rateError:new FormControl('')
    });

    group.get('newRate')?.valueChanges.subscribe(() => this.loadingRateCalc(group));
    group.get('ratetype')?.valueChanges.subscribe(() => this.loadingRateCalc(group));
    fa.push(group);
  });
}

get docketFormArray() {
  return this.LSForm.get('docketList') as FormArray;
}

loadingRateCalc(group: any) {

  const isChecked = group.get('isChecked')?.value;

  if (!isChecked) {
    group.get('rateError')?.setValue("");
    group.get('charge')?.setValue(0);
    return;
  }

  const rateType = group.get('ratetype')?.value;
  const newRate = Number(group.get('newRate')?.value || 0);
  const weightLB = Number(group.get('actuwt')?.value || 0);
  const packagesLB = Number(group.get('packagesLB')?.value || 0);

  let charge = 0;

  if (rateType === "1" || rateType === "2") {
    charge = weightLB;
  } else if (rateType === "3") {
    charge = packagesLB;
  } else if (rateType === "4") {
    charge = 1;
  }

  // Max limit check
  if (this.LSForm.value.loadingBy !== "XX9") {
    let maxLimitCalculation = 0;

    if (rateType === "4") {
      maxLimitCalculation = newRate / weightLB;
    } else if (rateType === "3") {
      maxLimitCalculation = (newRate * packagesLB) / weightLB;
    } else {
      maxLimitCalculation = newRate;
    }

    // if (maxLimitCalculation > 5.0) {
    //   group.get('rateError')?.setValue("Rate Amount Is High Please Check");
    //   group.get('newRate')?.setValue("0.00");
    //   group.get('charge')?.setValue(0);
    //   return;
    // }
  }

  group.get('rateError')?.setValue("");
  group.get('charge')?.setValue(charge * newRate);

  this.calculateTotal();
}

calculateTotal() {
  let total = 0;

  this.docketFormArray.controls.forEach((g: any) => {
    if (g.get('isChecked')?.value) {
      total += Number(g.get('charge')?.value || 0);
    }
  });

  this.LSForm.get('loadingCharge')
    ?.setValue(total.toFixed(2));
}

  formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' }); // November
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

  prepareLoadingSheet() {
    if (this.LSForm.valid) {
      const { reportrange, docketList, ...formValuesWithoutRange } = this.LSForm.value;
      const selected = (this.docketFormArray?.controls ?? []).filter(ctrl => ctrl.get('isChecked')?.value).map(ctrl => (ctrl as FormGroup).getRawValue());
      const payload = {
        vm: {
          ...formValuesWithoutRange,
          lsDate:new Date(this.LSForm.value.lsDate).toISOString() === "0000-12-31T18:06:32.000Z" ? new Date(): new Date(this.LSForm.value.lsDate).toISOString(),
          mathadiDate: new Date(this.LSForm.value.mathadiDate).toISOString(),
          vendorCode: this.LSForm.value.vendorCode ? this.LSForm.value.vendorCode : '',
          vehno: this.LSForm.value.vehno ? this.LSForm.value.vehno : '',
          lsType: this.LSForm.value.lsType ? this.LSForm.value.lsType : '',
          loadingBy: this.LSForm.value.loadingBy ? this.LSForm.value.loadingBy :'',
          nextStopLocation: this.LSForm.value.nextStopLocation ? this.LSForm.value.nextStopLocation :'',
          rateType: this.LSForm.value.rateType ? this.LSForm.value.rateType :'',
          fromDate: reportrange[0].toISOString(),
          toDate: reportrange[1].toISOString(),
          baseUserName: this.docketService.loginUserList.BaseUserName,
          baseFinYear: this.docketService.loginUserList.FinYear,
          baseLocationCode: this.docketService.loginUserList.LocationCode,
          baseCompanyCode: this.docketService.loginUserList.Companycode,
          location: this.docketService.loginUserList.LocationCode,
          Type: this.docketService.loginUserList.Type,
        },
        docketList: selected,
        internalDocumentList: [
          {
            "imNo": "",
            "isChecked": true,
            "packages": 0,
            "weight": 0
          }
        ],
      };
      this.loadingSheetApiService.prepareLoadingSheet(payload).subscribe({
        next: (response: any) => {
          if (response.success) {
            window.parent.location.href = `${this.env.liveUrl}Operation/LoadingSheetResult?Code=${response.code}&HCNumber=${response.hcNumber}&Type=${response.type}&src=angular`;
          }
        }
      });
    }else{
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.LSForm.markAllAsTouched();
    }
  }
}
