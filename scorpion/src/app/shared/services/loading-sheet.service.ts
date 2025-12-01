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
      LsNO:new FormControl(''),
      LsDate:new FormControl(this.formatDate(today)),
      ManualLsNO:new FormControl('N/A'),
      LoadingBy:new FormControl(null,[Validators.required]),
      NextStopLocation:new FormControl(null,[Validators.required]),
      RateType:new FormControl(null),
      MF_TransportMode:new FormControl('S',[Validators.required]),
      rdVehicle:new FormControl('Own'),
      SealNo:new FormControl(''),
      VEHNO:new FormControl(null),
      PreparedBy:new FormControl(''),
      UserName:new FormControl(this.docketService.baseUsername),
      LSType:new FormControl(null),
      reportrange:new FormControl([fromDate, today]),
      TransportMode:new FormControl(null),
      DestinationList:new FormControl(''),
      DocketNoList:new FormControl(''),
      VendorCode:new FormControl(null),
      VendorName:new FormControl(''),
      LoadingCharge:new FormControl(0),
      IsMathadi:new FormControl(''),
      MathadiSlipNo:new FormControl(''),
      MathadiDate:new FormControl(''),
      MathadiAmt:new FormControl(''),
      docketList: new FormArray([]),
    })
  }

  setDocketList(list: any[]) {
  const fa = this.LSForm.get('docketList') as FormArray;
  fa.clear(); // Old data remove
  list.forEach(item => {
    fa.push(new FormGroup({
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
    const { reportrange,docketList, ...formValuesWithoutRange } = this.LSForm.value;
    const payload = {
      vm: {
        ...formValuesWithoutRange,
        LsDate:new Date(this.LSForm.value.LsDate).toISOString(),
        fromDate:reportrange[0].toISOString(),
        toDate:reportrange[1].toISOString(),
        baseUserName: this.docketService.loginUserList.BaseUserName,
        baseFinYear: this.docketService.loginUserList.FinYear,
        baseLocationCode: this.docketService.loginUserList.LocationCode,
        baseCompanyCode: this.docketService.loginUserList.Companycode,
        location: this.docketService.loginUserList.LocationCode,

      },
      docketList: []
    };

    this.loadingSheetApiService.prepareLoadingSheet(payload).subscribe({
      next: (response) => {
        console.log(response)
      }
    });
  }
}
