import { Injectable } from '@angular/core';
import { BasicDetailService } from './basic-detail.service';
import { generalMasterResponse } from '../models/general-master.model';
import { CityResponse, VendeorsResponse } from '../models/thc-master.model';
import { THCMasterService } from './thc-master.service';
import { DocketService } from './docket.service';
import { SweetAlertService } from './sweet-alert.service';
import { DeliveryAgentService } from './delivery-agent.service';

@Injectable({
  providedIn: 'root'
})
export class ChallanService {
public vendtyData:generalMasterResponse[]=[]
public vendorsList:VendeorsResponse[]=[]
public cityList:CityResponse[]=[];
public routeModeList:generalMasterResponse[]=[];
  constructor(private basicDetailService: BasicDetailService,private tHCMasterService:THCMasterService,private docketService:DocketService) { }

    getVendtyData() {
    this.basicDetailService.getGeneralMasterList('VENDTY', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.vendtyData = response.data;
        }
      },
    });
  }

   getVendorsList(event:any) {
    const data = {
     vendorType:event.codeId,
     branchCode:this.docketService.loginUserList.LocationCode,
     userName: this.docketService.loginUserList.BaseUserName,
     documentType:this.docketService.loginUserList.Type
    }
    this.tHCMasterService.getVendorsList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.vendorsList = response.data;
        }
      },
    });
  }

  getCityList() {
    this.tHCMasterService.getCityList().subscribe({
      next: (response) => {
        if (response) {
          this.cityList = response;
        }
      },
    });
  }

  getRouteMode(){
    this.basicDetailService.getGeneralMasterList('RTMD', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.routeModeList = response.data;
        }
      },
    });
  }
}
