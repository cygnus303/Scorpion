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
  public LsTransportModeData:PRSGeneralMasterResponse[]=[];
  public loadingBy:PRSGeneralMasterResponse[]=[];
  public reasonData:PRSGeneralMasterResponse[]=[];
  public deliveryProcessData:PRSGeneralMasterResponse[]=[];
  public damageData:PRSGeneralMasterResponse[]=[];
   public deliveredToData:PRSGeneralMasterResponse[]=[];
  public documentTypeList:PRSGeneralMasterResponse[]=[];
  public rateTypeList:PRSGeneralMasterResponse[]=[];
  public PayBsList:PRSGeneralMasterResponse[]=[];
  public serviceTypeList:PRSGeneralMasterResponse[]=[];
  public VendorRateList:PRSGeneralMasterResponse[]=[];
  public odaList:PRSGeneralMasterResponse[]=[];


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

  getRateTypeData() {
    this.THCMasterService.getGeneralMasterDetail('VCRATETYP').subscribe({
      next: (response) => {
        if (response.success) {
          this.rateTypeList = response.data;
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

  getLoadingBy(){
      this.THCMasterService.getGeneralMasterDetail('LOADBY').subscribe({
      next: (response) => {
        if (response.success) {
          this.loadingBy = response.data;
        }
      }
    });
  }

    getLoadingByDetail(vendorCode:any) {
    this.basicDetailService.getGeneralMasterList('LOADBY', '', vendorCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadingData = response.data;
        }
      },
    });
  }

   getChargeTypeData(){
    this.THCMasterService.getGeneralMasterDetail('HANDCHRG').subscribe({
      next: (response) => {
        if (response.success) {
          this.chargeTypeData = response.data;
        }
      },
    });
  }

  getLSModedata(){
    this.THCMasterService.getGeneralMasterDetail('RTMD').subscribe({
      next: (response) => {
        if (response.success) {
          this.LsTransportModeData = response.data;
        }
      },
    });
  }

   getDeliveryProcessData() {
    this.THCMasterService.getGeneralMasterDetail('DLYPRC').subscribe({
      next: (response) => {
        if (response.success) {
          this.deliveryProcessData = response.data;
        }
      }
    });
  }

    getReason(codeType:string){
    this.THCMasterService.getGeneralMasterDetail(codeType).subscribe({
      next: (response) => {
        if (response.success) {
          this.reasonData = response.data;
        }
      },
    });
  }

  getDamageData(){
    this.THCMasterService.getGeneralMasterDetail('DEPSTYP').subscribe({
      next: (response) => {
        if (response.success) {
          this.damageData = response.data;
        }
      },
    });
  }

   getDeliveredToData() {
    this.THCMasterService.getGeneralMasterDetail('DLYTO').subscribe({
      next: (response) => {
        if (response.success) {
          this.deliveredToData = response.data;
        }
      }
    });
  }
   getDocumentType(){
    this.THCMasterService.getGeneralMasterDetail('FMDOC').subscribe({
      next: (response) => {
        if (response.success) {
          this.documentTypeList = response.data;
        }
      },
    });
  }

    getPaybs(codeType: string) {
    this.THCMasterService.getGeneralMasterDetail(codeType).subscribe({ next: (response) => {
        if (response.success) {
          this.PayBsList = response.data;
        }
      }
    });
  }

  getServiceType(){
    this.THCMasterService.getGeneralMasterDetail('VENDCONTSVCTYP').subscribe({ next: (response) => {
        if (response.success) {
          this.serviceTypeList = response.data;
        }
      }
    });
  }

  getVendorRateType(){
     this.THCMasterService.getGeneralMasterDetail('VBRATETYPE').subscribe({ next: (response) => {
        if (response.success) {
          this.VendorRateList = response.data;
        }
      }
    });
  }

  getODADetail(){
     this.THCMasterService.getGeneralMasterDetail('VENDODA').subscribe({ next: (response) => {
        if (response.success) {
          this.odaList = response.data;
        }
      }
    });
  }

 
}
