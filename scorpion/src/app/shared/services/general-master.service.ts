import { Injectable } from '@angular/core';
import { generalMasterResponse } from '../models/general-master.model';
import { BasicDetailService } from './basic-detail.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralMasterService {
 public transportModeData: generalMasterResponse[] = [];
  public pickUpData: generalMasterResponse[] = [];
  public contentsData: generalMasterResponse[] = [];
  public serviceData: generalMasterResponse[] = [];
  public packagingTypeData : generalMasterResponse[] = [];
  public typeofMovementList : generalMasterResponse[] = [];
  public businessTypeList : generalMasterResponse[] = [];
  public exemptServicesList : generalMasterResponse[] = [];
 constructor(
     private basicDetailService: BasicDetailService) { }

  
  getTransportModeData(codeId:any) {
    this.basicDetailService.getGeneralMasterList('TRN', '',codeId).subscribe({ next: (response) => {
        if (response.success) {
          this.transportModeData = response.data;
        }
      },
    });
  }

  getPickUpData(codeId:any) {
    this.basicDetailService.getGeneralMasterList('PKPDL', '',codeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.pickUpData = response.data;
        }
      },
    });
  }

  getContentsData(){
     this.basicDetailService.getGeneralMasterList('PROD', '','').subscribe({next: (response) => {
        if (response.success) {
          this.contentsData = response.data;
        }
      },
    });
  }

  getServiceTypeData(codeId:any) {
    this.basicDetailService.getGeneralMasterList('SVCTYP', '',codeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.serviceData = response.data;
        }
      },
    });
  }

  getPackagingTypeData() {
    this.basicDetailService.getGeneralMasterList('PKGS', '','').subscribe({
      next: (response) => {
        if (response.success) {
          this.packagingTypeData = response.data;
        }
      },
    });
  }

   getTypeofMovementData(){
    this.basicDetailService.getGeneralMasterList('FTLTYP ','','').subscribe({next: (response) => {
        if (response.success) {
          this.typeofMovementList = response.data;
        }
      },
    });
  }

  getbusinessTypeData(){
    this.basicDetailService.getGeneralMasterList('BUT ','','').subscribe({next: (response) => {
        if (response.success) {
          this.businessTypeList = response.data;
        }
      },
    });
  }

   getexemptServicesData(){
    this.basicDetailService.getGeneralMasterList('EXMPTSRV ','','').subscribe({next: (response) => {
        if (response.success) {
          this.exemptServicesList = response.data;
        }
      },
    });
  }
}
