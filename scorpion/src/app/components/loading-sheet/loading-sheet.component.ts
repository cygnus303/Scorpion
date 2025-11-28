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
