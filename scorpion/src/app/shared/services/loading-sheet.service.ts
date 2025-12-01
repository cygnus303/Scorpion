import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DocketService } from './docket.service';
import { LoadingSheetApiService } from './loading-sheet-api.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingSheetService {
 public LSForm!:FormGroup;

  constructor(public docketService:DocketService,public loadingSheetApiService: LoadingSheetApiService) { }


  buildForm(){
    const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - 29);

    this.LSForm=new FormGroup({
      lsNO:new FormControl(''),
      lsDate:new FormControl(this.formatDate(today)),
      manualLsNO:new FormControl('N/A'),
      loadingBy:new FormControl(null,[Validators.required]),
      nextStopLocation:new FormControl(null,[Validators.required]),
      rateType:new FormControl(null),
      mF_TransportMode:new FormControl('S',[Validators.required]),
      rdVehicle:new FormControl('Own'),
      sealNo:new FormControl(''),
      vehno:new FormControl(null),
      preparedBy:new FormControl(''),
      UserName:new FormControl(this.docketService.baseUsername),
      lsType:new FormControl(null),
      reportrange:new FormControl([fromDate, today]),
      transportMode:new FormControl(null),
      destinationList:new FormControl(''),
      docketNoList:new FormControl(''),
      vendorCode:new FormControl(null),
      vendorName:new FormControl(''),
      loadingCharge:new FormControl(0),
      isMathadi:new FormControl(false),
      mathadiSlipNo:new FormControl(''),
      mathadiDate:new FormControl(this.formatDate(today)),
      mathadiAmt:new FormControl(0),
      docketList: new FormArray([]),
      LoadingByUser:new FormControl(''),
      LoadingSupervisor:new FormControl(''),
      NEXTLOC:new FormControl(''),
      VehicleType:new FormControl(''),
      isMonthly:new FormControl(this.docketService.loginUserList.Type === 'LS' ? true: false)
    })
  }

  setDocketList(list: any[]) {
  const fa = this.LSForm.get('docketList') as FormArray;
  fa.clear(); // Old data remove
  list.forEach(item => {
    fa.push(new FormGroup({
       dockno:new FormControl(item.dockno),
       docksf:new FormControl(item.docksf),
       pkgsno:new FormControl(item.pkgsno),
       actuwt:new FormControl(item.actuwt),
       docketDate:new FormControl(item.docketDate),
       orgCode:new FormControl(item.orgCode),
       packagesLB:new FormControl(item.packagesLB),
       weightLB:new FormControl(item.weightLB),
       reDestCode:new FormControl(item.reDestCode),
       PackageLB:new FormControl(item.packagesLB),
       WeightsLB:new FormControl(item.weightLB),
       fromTo:new FormControl(item.fromTo),
       isChecked:new FormControl(item.isChecked),
       newRate:new FormControl(item.newRate),
       ratetype:new FormControl(item.ratetype),
       message:new FormControl(item.message),
       errorMassage:new FormControl(item.errorMassage),
    }));
  });
}

get docketFormArray() {
  return this.LSForm.get('docketList') as FormArray;
}


  formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' }); // November
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

  prepareLoadingSheet() {
    debugger
    const { reportrange, docketList, ...formValuesWithoutRange } = this.LSForm.value;
    const selected = (this.docketFormArray?.controls ?? []).filter(ctrl => ctrl.get('isChecked')?.value).map(ctrl => (ctrl as FormGroup).getRawValue());
    const payload = {
      vm: {
        ...formValuesWithoutRange,
        lsDate:new Date(this.LSForm.value.lsDate).toISOString(),
        mathadiDate:new Date(this.LSForm.value.mathadiDate).toISOString(),
        vendorCode:this.LSForm.value.vendorCode ? this.LSForm.value.vendorCode :'',
        vehno:this.LSForm.value.vehno ? this.LSForm.value.vehno :'',
        lsType:this.LSForm.value.lsType ? this.LSForm.value.lsType :'',
        fromDate:reportrange[0].toISOString(),
        toDate:reportrange[1].toISOString(),
        baseUserName: this.docketService.loginUserList.BaseUserName,
        baseFinYear: this.docketService.loginUserList.FinYear,
        baseLocationCode: this.docketService.loginUserList.LocationCode,
        baseCompanyCode: this.docketService.loginUserList.Companycode,
        location: this.docketService.loginUserList.LocationCode,
        Type:this.docketService.loginUserList.Type
      },
      docketList: selected,
      internalDocumentList:[
        {
            "imNo": "",
            "isChecked": true,
            "packages": 0,
            "weight": 0
        }
      ],
    };
    if ((payload.vm.loadingBy == "A" || payload.vm.loadingBy == "XX5" || payload.vm.loadingBy == "XX8" || payload.vm.loadingBy == "M") && payload.vm.loadingCharge == 0) {
      this.loadingSheetApiService.prepareLoadingSheet(payload).subscribe({
        next: (response) => {
          console.log(response)
        }
      });
    }
  }
}
