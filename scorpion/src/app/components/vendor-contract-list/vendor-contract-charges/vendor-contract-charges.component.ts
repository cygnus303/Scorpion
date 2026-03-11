import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { LoadingSheetApiService } from 'app/shared/services/loading-sheet-api.service';
import { MasterService } from 'app/shared/services/master.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';
import { SharedModule } from 'app/shared/shared/shared.module';

@Component({
  selector: 'app-vendor-contract-charges',
  standalone: true,
  imports: [CommonModule ,FormsModule ,ReactiveFormsModule,NgSelectModule,SharedModule],
  templateUrl: './vendor-contract-charges.component.html',
  styleUrl: './vendor-contract-charges.component.scss'
})
export class VendorContractChargesComponent {
 public PayBsList:any[]=[];
public routeFile: File | null = null;
public distanceFile: File | null = null;
public bookingFile: File | null = null;
public deliveryFile: File | null = null;
  public modeList = [
  { text: 'Air', value: 'A' },
  { text: 'Train', value: 'R' },
  { text: 'Road', value: 'S' }
];

constructor(
  public vendorContractService:VendorContractService,
  public docketService:DocketService,
  public generalMasterService:GeneralMasterService,
  public loadingSheetApiService:LoadingSheetApiService,
  public THCMasterService:THCMasterService,
  private route: ActivatedRoute,
  public masterService:MasterService,
  private sweetAlertService:SweetAlertService
  
){}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.vendorContractService.vendorProfileForm.patchValue({
        VendorName: params['Vendorname'],
        VendorTypeName: params['Text'],
        VendorType: params['VedorType'],
        VendorCode: params['vendorCode'],
        MetrixType:params['matrix'],
        ContractType:params['ContractType'],
        ContractId:params['ContractId']
      })
      if (params['VedorType'] === '04') {
        this.getPaybs();
        this.vendorContractService.addCnoteBasedContract();
        this.vendorContractService.addCnoteDeliveryCharges();
        this.generalMasterService.getModeData();
        this.generalMasterService.getServiceType();
        this.generalMasterService.getVendorRateType();
        this.generalMasterService.getODADetail();
        this.vendorContractService.getCityList();
      }
       if (params['VedorType'] === 'XX1') {
        this.vendorContractService.addRouteContract();
        this.vendorContractService.addDistanceContract();
        this.vendorContractService.getVehicleType('O');
        this.docketService.getTypeofMovementData();
        this.generalMasterService.getRateTypeData();
      }
    });
  }

  onModeChange(index: number) {
    const row = this.vendorContractService.routeBasedContracts.at(index);
    row.get('routeCode')?.reset();
    row.get('ftL_Type')?.reset();
  }

  getPaybs() {
    this.THCMasterService.getGeneralMasterDetail('PAYTYP').subscribe({ next: (response) => {
        if (response.success) {
          this.PayBsList = [
          {
            codeId: 'P00',
            codeDesc: 'All'
          },
          ...response.data
        ];
        }
      }
    });
  }


uploadDistanceFile(event:any) {
 const file = event.target.files?.[0];
  if (!file) return;

  const allowedExtensions = ['xls','xlsx'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!allowedExtensions.includes(fileExtension || '')) {
    this.sweetAlertService.error('Invalid file format. Please upload only Excel file.');
    event.target.value = '';
    this.distanceFile = null;
    return;
  }

  this.distanceFile = file;

  const formData = new FormData();
  if (this.distanceFile) {
   formData.append('uploadFile', this.distanceFile);
}

  this.masterService.uploadDistance(formData).subscribe({
    next: (response:any) => {
      this.sweetAlertService.success('Excel Uploaded and Parsed Successfully');
        if (response?.status === 'success' && response?.data?.length) {
        response?.data.forEach((item:any)=>{
          this.vendorContractService.addDistanceContract();
          const index = this.vendorContractService.distanceBasedContracts.length - 1;
          this.vendorContractService.distanceBasedContracts.at(index).patchValue({...item });
        });
      }
    },
    error: (error:any) => {
      this.sweetAlertService.error(error?.error?.Error?.Message || 'Upload Failed');
    }
  });
}

uploadBookingFile(event: any) {

  const file = event.target.files?.[0];
  if (!file) return;

  const allowedExtensions = ['xls','xlsx'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!allowedExtensions.includes(fileExtension || '')) {
    this.sweetAlertService.error('Invalid file format. Please upload only Excel file.');
    event.target.value = '';
    this.bookingFile = null;
    return;
  }

  this.bookingFile = file;

  const formData = new FormData();
  if(this.bookingFile){
    formData.append('uploadFile', this.bookingFile);
  }

  this.masterService.uploadBookingExcel(formData).subscribe({

    next: (response:any) => {
      this.sweetAlertService.success('Excel Uploaded and Parsed Successfully');

      if (response?.status === 'success' && response?.data?.length) {

        response?.data.forEach((item:any)=>{
          this.vendorContractService.addCnoteBasedContract();
          const index = this.vendorContractService.cnoteBasedContracts.length - 1;
          this.vendorContractService.cnoteBasedContracts.at(index).patchValue({...item });
        });
      }
    },

    error: (error:any) => {
      this.sweetAlertService.error(error?.error?.Error?.Message || 'Upload Failed');
    }
  });
}
 

uploadDeliveryCharge(event:any){
    const file = event.target.files?.[0];
  if (!file) return;

  const allowedExtensions = ['xls','xlsx'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!allowedExtensions.includes(fileExtension || '')) {
    this.sweetAlertService.error('Invalid file format. Please upload only Excel file.');
    event.target.value = '';
    this.deliveryFile = null;
    return;
  }

  this.deliveryFile = file;

  const formData = new FormData();
  if (this.deliveryFile) {
   formData.append('uploadFile', this.deliveryFile);
}

  this.masterService.uploadDeliveryCharges(formData).subscribe({
    next: (response:any) => {
      this.sweetAlertService.success('Excel Uploaded and Parsed Successfully');

    if (response?.status === 'success' && response?.data?.length) {
       response?.data.forEach((item:any)=>{
          this.vendorContractService.addCnoteDeliveryCharges();
          const index = this.vendorContractService.cnoteDeliveryCharges.length - 1;
          this.vendorContractService.cnoteDeliveryCharges.at(index).patchValue({...item });
        });
      }
    },
    error: (error:any) => {
      this.sweetAlertService.error(error?.error?.Error?.Message || 'Upload Failed');
    }
  });
}

uploadRouteFile(event:any){
  const file = event.target.files?.[0];
  if (!file) return;

  const allowedExtensions = ['xls','xlsx'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!allowedExtensions.includes(fileExtension || '')) {
    this.sweetAlertService.error('Invalid file format. Please upload only Excel file.');
    event.target.value = '';
    this.routeFile = null;
    return;
  }

  this.routeFile = file;

  const formData = new FormData();
  if (this.routeFile) {
   formData.append('uploadFile', this.routeFile);
}

  this.masterService.uploadRouteExcel(formData).subscribe({
    next: (response) => {
      const data = response.data;

      if(data && data.length){

        data.forEach((item:any)=>{
          this.vendorContractService.addRouteBasedContract();
          const index = this.vendorContractService.routeBasedContracts.length - 1;
          this.vendorContractService.routeBasedContracts.at(index).patchValue({...item });
        });
      }
    },
    error: (error:any) => {
      this.sweetAlertService.error(error?.error?.Error?.Message || 'Upload Failed');
    }
  });
}
  
}
