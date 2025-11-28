import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChallanService } from 'app/shared/services/challan.service';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { LoadingSheetService } from 'app/shared/services/loading-sheet.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-loading-sheet',
  standalone: true,
  imports: [CommonModule,RouterModule,ReactiveFormsModule,NgSelectModule,BsDatepickerModule],
  templateUrl: './loading-sheet.component.html',
  styleUrls: ['./loading-sheet.component.scss']
})
export class LoadingSheetComponent {
  public loadingName:string='';
  constructor(
    public loadingSheetService:LoadingSheetService,
    public generalMasterService:GeneralMasterService,
    public docketService:DocketService,
    public commonService:CommonService,
    public challanService:ChallanService 
  ){}
LoadingSheetList = [
  {
    "CnoteNo": "62970933",
    "ManualCnoteNo": "62970933",
    "BkgDate": "31 Oct 25",
    "TransMode": "ROAD CARGO",
    "BkgLoc": "PIM",
    "DelyLoc": "CNI",
    "CityFromTo": "PIMPLAS - CHENNAI",
    "CommDelyDate": "03 Nov 2025",
    "Rate": "PER KG",
    "Pkgs_LB": 10,
    "Wt_LB": 120
  },
  {
    "CnoteNo": "62970934",
    "ManualCnoteNo": "62970934",
    "BkgDate": "31 Oct 25",
    "TransMode": "ROAD CARGO",
    "BkgLoc": "PIM",
    "DelyLoc": "AMD",
    "CityFromTo": "PIMPLAS - AHMEDABAD",
    "CommDelyDate": "03 Nov 2025",
    "Rate": "PER KG",
    "Pkgs_LB": 10,
    "Wt_LB": 140
  },
  {
    "CnoteNo": "62970935",
    "ManualCnoteNo": "62970935",
    "BkgDate": "31 Oct 25",
    "TransMode": "ROAD CARGO",
    "BkgLoc": "PIM",
    "DelyLoc": "KUMR",
    "CityFromTo": "PIMPLAS - BAMUNIMAIDAN",
    "CommDelyDate": "09 Nov 2025",
    "Rate": "PER KG",
    "Pkgs_LB": 30,
    "Wt_LB": 22
  },
  {
    "CnoteNo": "62970936",
    "ManualCnoteNo": "62970936",
    "BkgDate": "06 Nov 25",
    "TransMode": "ROAD CARGO",
    "BkgLoc": "PIM",
    "DelyLoc": "AMD",
    "CityFromTo": "PIMPLAS - AHMEDABAD",
    "CommDelyDate": "10 Nov 2025",
    "Rate": "PER KG",
    "Pkgs_LB": 8,
    "Wt_LB": 265
  },
  {
    "CnoteNo": "62970937",
    "ManualCnoteNo": "62970937",
    "BkgDate": "06 Nov 25",
    "TransMode": "ROAD CARGO",
    "BkgLoc": "PIM",
    "DelyLoc": "AMD",
    "CityFromTo": "PIMPLAS - AHMEDABAD",
    "CommDelyDate": "10 Nov 2025",
    "Rate": "PER KG",
    "Pkgs_LB": 2,
    "Wt_LB": 120
  },
  {
    "CnoteNo": "62970938",
    "ManualCnoteNo": "62970938",
    "BkgDate": "06 Nov 25",
    "TransMode": "ROAD CARGO",
    "BkgLoc": "PIM",
    "DelyLoc": "JAI",
    "CityFromTo": "PIMPLAS - JAIPUR",
    "CommDelyDate": "10 Nov 2025",
    "Rate": "PER KG",
    "Pkgs_LB": 2,
    "Wt_LB": 20
  }
]

ngOnInit(){
      this.docketService.loginUserList.LocationCode =  'PIM';
    this.loadingSheetService.buildForm();
    // this.generalMasterService.getLoadingByDetail();
    this.generalMasterService.getModeData();
    this.docketService.getServiceTypeData(1);
    this.generalMasterService.getChargeTypeData();
  }
  
  getvendoCodeData(event:any){
    this.loadingName=event?.codeDesc
    this.challanService.branchWiseLoadingUnloading(event?.codeId)
  }
}
