import { Injectable } from '@angular/core';
import { generalMasterResponse } from '../models/general-master.model';
import { THCMasterService } from './thc-master.service';
import { PRSGeneralMasterResponse } from '../models/thc-master.model';
import { BasicDetailService } from './basic-detail.service';


@Injectable({
  providedIn: 'root'
})
export class GeneralMasterService {
  public PayBsData:PRSGeneralMasterResponse[]=[];
  public modeData:PRSGeneralMasterResponse[]=[];
  public businessTypedata:PRSGeneralMasterResponse[]=[];
  public loadingData:PRSGeneralMasterResponse[]=[];
  public chargeTypeData:PRSGeneralMasterResponse[]=[];

 constructor(
     public THCMasterService: THCMasterService, private basicDetailService: BasicDetailService,
    ) { }

  getPaybsData() {
    this.THCMasterService.getGeneralMasterDetail('PAYTYP').subscribe({
      next: (response) => {
        if (response.success) {
          this.PayBsData = response.data;
        }
      }
    });
  }

    getModeData() {
    this.THCMasterService.getGeneralMasterDetail('TRN').subscribe({
      next: (response) => {
        if (response.success) {
          this.modeData = response.data;
        }
      }
    });
  }

   getBusinessTypeData() {
    this.THCMasterService.getGeneralMasterDetail('BUT').subscribe({
      next: (response) => {
        if (response.success) {
          this.businessTypedata = response.data;
        }
      }
    });
  }

  getLoadingByDetail(){
      this.THCMasterService.getGeneralMasterDetail('LOADBY').subscribe({
      next: (response) => {
        if (response.success) {
          this.loadingData = response.data;
        }
      }
    });
  }

  //   getLoadingByDetail(vendorCode:any) {
  //   this.basicDetailService.getGeneralMasterList('LOADBY', '', vendorCode).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         this.loadingData = response.data;
  //       }
  //     },
  //   });
  // }

   getChargeTypeData(){
    this.THCMasterService.getGeneralMasterDetail('HANDCHRG').subscribe({
      next: (response) => {
        if (response.success) {
          this.chargeTypeData = response.data;
        }
      },
    });
  }

 
}
