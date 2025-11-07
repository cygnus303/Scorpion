import { Component } from '@angular/core';
import { ChallanService } from 'app/shared/services/challan.service';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { Router } from '@angular/router';
import { DecryptService } from 'app/shared/services/decryptservice ';

@Component({
  selector: 'challan-filter',
  standalone: false,
  templateUrl: './challan-filter.component.html',
  styleUrl: './challan-filter.component.scss'
})
export class ChallanFilterComponent {
  public bookByData:any;
  public bookByTypeData=[
    {
      text:'Staff',
      value:'P'
    },
    {
      text:'BA',
      value:'B'
    }
  ]
  dateRange: [Date, Date] = [new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)];

constructor(
  public docketService:DocketService , 
  public commonService:CommonService,
  public THCMasterService:THCMasterService,
  public challanService:ChallanService,
  public generalMasterService:GeneralMasterService,
  private router:Router,
  private decryptService:DecryptService
){}

    ngOnInit(){
      this.challanService.SearchfilterForm()
      this.generalMasterService.getPaybsData();
      this.generalMasterService.getModeData();
      this.generalMasterService.getBusinessTypeData();
      this.generalMasterService.getLoadingByDetail();
      this.generalMasterService.getChargeTypeData();
      this.getBookedByData()
    }

    getBookedByData(){
      this.THCMasterService.getGetBookedBy(this.docketService.loginUserList.LocationCode,this.docketService.loginUserList.BaseUserName).subscribe({
      next: (response) => {
        if (response) {
          this.bookByData = response;
        }
      }
    });
    }

    onSearch(){
      this.docketService.loginUserList.Type = '2'
      this.docketService.loginUserList.fromdt = "01 Mar 2025",
      this.docketService.loginUserList.todt= "05 Nov 2025",
      this.docketService.loginUserList.dttyp= '3',
      this.docketService.loginUserList.paybas= this.challanService.filterForm.value.paybas,
      this.docketService.loginUserList.trn= this.challanService.filterForm.value.mode,
      this.docketService.loginUserList.bustyp= this.challanService.filterForm.value.businessType,
      this.docketService.loginUserList.docketList= "",
      this.docketService.loginUserList.loadingBy= this.challanService.filterForm.value.loadingBy,
      this.docketService.loginUserList.chrgType= this.challanService.filterForm.value.chargeType;
      this.docketService.loginUserList.odaType= "";
      this.docketService.loginUserList.flag= 2;
      this.docketService.loginUserList.LocationCode =  'ABA';
      this.docketService.loginUserList.BookedByType = this.challanService.filterForm.value.bookedType;
      this.docketService.loginUserList.BookedBy =  this.challanService.filterForm.value.bookedBy;
  

 const data = JSON.stringify(this.docketService.loginUserList);
  const encrypted = encodeURIComponent(btoa(data));
      this.router.navigate(
    ['/ChallanList'],
    { queryParams: { data: encrypted } }  // 🔹 Step 4
  );
    }
}
