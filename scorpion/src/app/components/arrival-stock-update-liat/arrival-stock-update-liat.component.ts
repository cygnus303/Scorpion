import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { BranchWiseLoadingUnloading } from 'app/shared/models/thc-master.model';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-arrival-stock-update-liat',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule,SharedModule],
  templateUrl: './arrival-stock-update-liat.component.html',
  styleUrl: './arrival-stock-update-liat.component.scss'
})
export class ArrivalStockUpdateLiatComponent {
deliveryProcess =[{text:'DELIVERY THROUGH DRS', value:'1'},{text:'DELIVERY ON ARRIVAL', value:'2'}];
public arrivalForm!:FormGroup;
public arrivalDetail:any;
public branchWiseLoadingUnloadingList:BranchWiseLoadingUnloading[]=[];

public Reasonlist=[
{
  text:"Late Dept. of Vehicle", 
  Value :"P84"
},{
  text:"Vehicle break down", 
  value : "P88"
}
]
public Seallist=[
{
  text:'Ok',
  value:'Ok'
},
  {
  text:'Broken',
  value:'Broken'
},  
{
  text:'Unsealed',
  value:'Unsealed'
}
]
 constructor(
  public docketService: DocketService, 
  public commonService: CommonService,
  public stockUpdateService:StockUpdateService,
  public THCService:THCMasterService,
  public generalMasterService:GeneralMasterService
) { }

  ngOnInit(){
   const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.loginUserList.LocationCode =  'PIM';
      this.docketService.loginUserList.loadBy = "B";
      this.docketService.loginUserList.chargeType='1';
      this.docketService.loginUserList.id='VH/BWH/2526/002424';
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.buildForm();
    this.getArrival();
  }


  buildForm(){
    this.arrivalForm=new FormGroup({
      ISN:new FormControl(''),
      s2id_Status:new FormControl(''),
      AD:new FormControl(this.getCurrentDateTime()),
      CLOSEKM:new FormControl(''),
      IR:new FormControl(''),
      Unloder:new FormControl(''),
      LAR:new FormControl(''),
      VendorCode:new FormControl(''),
      Rate:new FormControl(''),
      LoadingCharge:new FormControl('')
    })
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

getArrival(){
  const params={
    id:this.docketService.loginUserList.id,
    loadBy:this.docketService.loginUserList.loadBy,
    chargeType:this.docketService.loginUserList.chargeType,
    BaseLocationCode:this.docketService.loginUserList.LocationCode,
    BaseUserName:this.docketService.loginUserList.BaseUserName
  }
  this.stockUpdateService.getArrivalDetail(params).subscribe({
     next: (response) => {
       this.arrivalDetail=response;
       this.arrivalForm.patchValue({
        Unloder:this.arrivalDetail.unloder
       });
      this.generalMasterService.getLoadingByDetail(this.arrivalDetail.loadingBy)

      },
  })
}

getLoadingCharge(event: any) {
  const data = {
    loadUnloadType: 'U',
    vendorCode: event,
    typeModule: this.docketService.loginUserList.Type === "2" ? "P" : "D",
    chargeType: this.docketService.loginUserList.chargeType,
    brdc: this.docketService.loginUserList.LocationCode,
    loadingBy: this.arrivalDetail.loadingBy,
  };
// if(['XX5'].includes(this.DRSSummaryForm.get('LoadingBy')?.value)){
  this.THCService.getLoadingCharge(data).subscribe({
    next: (response: any) => {
    this.arrivalForm.patchValue({
        Rate:response.rate
      });
      
    },
    error: (err) => {
      console.error('Error fetching loading charge:', err);
    }
  });
// }
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
}
