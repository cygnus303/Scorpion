import { Component } from '@angular/core';
import { VendorContractProfileComponent } from '../vendor-contract-profile/vendor-contract-profile.component';
import { VendorContractChargesComponent } from '../vendor-contract-charges/vendor-contract-charges.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';
import { DocketService } from 'app/shared/services/docket.service';
import { MasterService } from 'app/shared/services/master.service';
import { environment } from 'environments/environment';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-vendor-contract-layout',
  standalone: true,
  imports: [CommonModule, VendorContractProfileComponent, VendorContractChargesComponent],
  templateUrl: './vendor-contract-layout.component.html',
  styleUrl: './vendor-contract-layout.component.scss'
})
export class VendorContractLayoutComponent {
  env = environment;
  selectedTab: string = 'profile';
  public isSubmitting:boolean=false;
  public isRedirect:boolean = false;
  constructor(public router: Router,public vendorContractService:VendorContractService,public docketService:DocketService,public masterService: MasterService ,public sweetAlertService:SweetAlertService,) {
  }

    ngOnInit() {
     const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.loginUserList.LocationCode =  'PIM';
      // this.docketService.loginUserList.loadBy = "B";
      // this.docketService.loginUserList.chargeType='1';
      // this.docketService.loginUserList.drsId='DS/PIM/2526/002766';
      this.docketService.loginUserList.Type = 'A';
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

selectTab(tab: string) {
  if (tab === 'charges') {
    if (this.validateProfileFields()) {
      this.selectedTab = 'charges';
    } else {
      this.selectedTab = 'profile';
    }
  } else {
    this.selectedTab = tab;
  }
}

  goBack() {
    this.router.navigate(['/Master/VendorContractTypeWise']);
  }

onContinue() {
  if (this.validateProfileFields()) {
    this.selectedTab = 'charges';
  }
}

  validateProfileFields(): boolean {
    const form = this.vendorContractService.vendorProfileForm;
    const requiredFields = ['ContractDt', 'Start_Dt', 'Valid_uptodt', 'Security_deposit_date', 'VendorCategory', 'VendorContractCat'];
    let isValid = true;
    requiredFields.forEach(field => {
      const control = form.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        isValid = false;
      }
    });
    return isValid;
  }

  onBack(){
    this.selectedTab = 'profile';
  }

  onSubmit() {
   
    const form = this.vendorContractService.vendorProfileForm.value;
    const payload = {
      WVCSV1VM: {
        WVCSV1: {
          Contract_loccode: form.Contract_loccode || '',
          Start_Dt: form.Start_Dt ? new Date(form.Start_Dt).toISOString() : '',
          CompWitness: form.CompWitness || '',
          ContractDt: form.ContractDt ? new Date(form.ContractDt).toISOString() : '',
          CONTRACTCD: form.CONTRACTCD || '',
          VendorPerDesg: form.VendorPerDesg || '',
          Payment_loc: form.Payment_loc || '',
          VendorContractCat: form.VendorContractCat,
          VendorCode: form.VendorCode || '',
          TDSAppl_YN: form.TDSAppl_YN || '',
          Security_deposit_date: form.Security_deposit_date ? new Date(form.Security_deposit_date).toISOString() : '',
          UpdateDt: new Date().toISOString(),
          VendorWitness: form.VendorWitness || '',
          Vendor_Address: form.Vendor_Address || '',
          CompEmpDesg: form.CompEmpDesg || '',
          VendorPin: form.VendorPin || '',
          Security_deposit_chq: form.Security_deposit_chq || '',
          VendorPerName: form.VendorPerName || '',
          EntryBy: this.docketService.loginUserList?.UserId,
          TDS_Rate: form.TDS_Rate || 0,
          Vendor_Type: form.VendorType || '',
          Payment_interval: form.Payment_interval || '',
          Status: form.Status || '', ///
          VendorCity: form.VendorCity || '',
          EntryDt: new Date().toISOString(),
          Security_deposit_Amt: form.Security_deposit_Amt || 0,
          Payment_Basis: form.Payment_Basis || '',
          Default_Charge: form.Default_Charge || 0,
          CompEmpName: form.CompEmpName || '',
          VendorName: form.VendorName || '',
          VendorCategory: form.VendorCategory,
          UpdateBy: this.docketService.loginUserList?.UserId,
          Monthly_Phone_Charges: form.Monthly_Phone_Charges || 0,
          Valid_uptodt: form.Valid_uptodt ? new Date(form.Valid_uptodt).toISOString() : '',
          MetrixType: form.MetrixType || '',
          ContractType: form.ContractType || '',
          Flag: this.docketService.loginUserList.Type === 'A'?'Add':'Edit' ,///
          contract_YN: 'Y',//
          VendorTypeName: form.VendorTypeName || '',
          FTLFixAmount: form.FTLFixAmount || 0,//
          Local_Feeder_Rate_Type: form.Local_Feeder_Rate_Type || '',//
          Local_Feeder_Rate: form.Local_Feeder_Rate || 0,//
          ODAPickupApply: form.ODAPickupApply || false,//
          ODAPickupStartKM: form.ODAPickupStartKM || 0,//
          ODAPickupRateType: form.ODAPickupRateType || '',//
          ODAPickupRate: form.ODAPickupRate || 0,//
          ODADeliveryApply: form.ODADeliveryApply || false,//
          ODADeliveryStartKM: form.ODADeliveryStartKM || 0,//
          ODADeliveryRateType: form.ODADeliveryRateType || '',//
          ODADeliveryRate: form.ODADeliveryRate || 0,//
          Document: form.Document || '',//
          CopyVendor: form.CopyVendor || ''//
        },
      }
    };
    const formData = new FormData();
    this.appendObjectToFormData(formData, payload.WVCSV1VM.WVCSV1, "WVCSV1VM.WVCSV1");
    formData.append("WVCSV1VM.ContractID", this.vendorContractService.vendorProfileForm.value.ContractId || '');
    formData.append("EntryBy", this.docketService.loginUserList?.UserId);
    formData.append('Attachments',this.vendorContractService.selectedFile)
    formData.append("Flag", this.docketService.loginUserList.Type === 'A'?'Add':'Edit');

    const routeContracts = this.vendorContractService.routeBasedContracts.value;
    const distanceContracts = this.vendorContractService.distanceBasedContracts.value;
    const cnoteBasedContracts = this.vendorContractService.cnoteBasedContracts.value;
    const cnoteDeliveryCharges = this.vendorContractService.cnoteDeliveryCharges.value;
    
    const hasRouteData = routeContracts.some((contract: any) => 
      contract.transMode || contract.routeCode || contract.ftL_Type || 
      contract.min_Charge || contract.max_Charge || contract.chg_Rate
    );
    
    const hasDistanceData = distanceContracts.some((contract: any) => 
      contract.ftL_Type || contract.vehicle_Type || contract.vehicle_Number ||
      contract.min_Amt_Committed || contract.committed_Km || contract.chg_Per_Add_Km
    );

    const hascnoteBasedContracts = cnoteBasedContracts.some((contract: any) =>      
      contract.city || contract.location || contract.payBas || contract.transMode
    );

    const hasCnoteDeliveryCharges = cnoteDeliveryCharges.some((contract: any) =>      
      contract.location || contract.city || contract.payBas || contract.transMode
    );
    
    if (hasRouteData) {
      formData.append("WVCSV1VM.listWVCRM", JSON.stringify(routeContracts));
      formData.append("RouteBasedContract", JSON.stringify(routeContracts));
    }
    if (hasDistanceData) {
      formData.append("WVCSV1VM.listWVCDM", JSON.stringify(distanceContracts));
      formData.append("DistanceBasedContract", JSON.stringify(distanceContracts));
    }
    if (hascnoteBasedContracts) {
      formData.append("WVCSV1VM.listWVCDoBCM", JSON.stringify(cnoteBasedContracts));
      formData.append("DocketBasedContractBC", JSON.stringify(cnoteBasedContracts));
      formData.append("DocketBasedContractBCfranchise", JSON.stringify(cnoteBasedContracts));
    }
    if (hasCnoteDeliveryCharges) {
      formData.append("WVCSV1VM.listWVCDoDCM", JSON.stringify(cnoteDeliveryCharges));
      formData.append("DocketBasedContractDC", JSON.stringify(cnoteDeliveryCharges));
      formData.append("DocketBasedContractDCfranchise", JSON.stringify(cnoteDeliveryCharges));
    }

    if (this.vendorContractService.vendorProfileForm.valid) {
      this.isSubmitting = true;
      this.masterService.AddEditVendorContract(formData).subscribe({
        next: (response: any) => {
          if (response) {
            this.isRedirect = true;
            window.parent.location.href = `${this.env.liveUrl}Master/VendorContractDone?ContractCode=${response.contractCode}&type=${response.type}&TranXaction=${response.tranXaction}&src=angular`;
          } else {
            this.sweetAlertService.error('You have some form errors. Please check below.');
            this.isSubmitting = false;
          }
        }, error: (error) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.sweetAlertService.error(error?.error?.message);
          this.isSubmitting = false;
          this.isRedirect = false;
        }
      });
    } else {
      this.vendorContractService.vendorProfileForm.markAllAsTouched();
    }
  }
  
  appendObjectToFormData(formData: FormData, obj: any, parentKey: string = "") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const formKey = parentKey ? `${parentKey}.${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          this.appendObjectToFormData(formData, value, formKey);
        } else {
          formData.append(formKey, value !== null && value !== undefined ? String(value) : "");
        }
      }
    }
  }
}
