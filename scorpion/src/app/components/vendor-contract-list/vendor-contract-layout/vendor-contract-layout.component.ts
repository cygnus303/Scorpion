import { Component } from '@angular/core';
import { VendorContractProfileComponent } from '../vendor-contract-profile/vendor-contract-profile.component';
import { VendorContractChargesComponent } from '../vendor-contract-charges/vendor-contract-charges.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';
import { DocketService } from 'app/shared/services/docket.service';
import { MasterService } from 'app/shared/services/master.service';

@Component({
  selector: 'app-vendor-contract-layout',
  standalone: true,
  imports: [CommonModule, VendorContractProfileComponent, VendorContractChargesComponent],
  templateUrl: './vendor-contract-layout.component.html',
  styleUrl: './vendor-contract-layout.component.scss'
})
export class VendorContractLayoutComponent {
  selectedTab: string = 'profile';
  constructor(public router: Router,public vendorContractService:VendorContractService,public docketService:DocketService,public masterService: MasterService) {
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
          Start_Dt: form.Start_Dt,
          CompWitness: form.CompWitness || '',
          ContractDt: form.ContractDt,
          CONTRACTCD: form.CONTRACTCD || '',
          VendorPerDesg: form.VendorPerDesg || '',
          Payment_loc: form.Payment_loc || '',
          VendorContractCat: form.VendorContractCat,
          VendorCode: form.VendorCode || '',
          TDSAppl_YN: form.TDSAppl_YN || '',
          Security_deposit_date: form.Security_deposit_date,
          UpdateDt: new Date(),
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
          // Status: form.Status || '',
          VendorCity: form.VendorCity || '',
          EntryDt: new Date(),
          Security_deposit_Amt: form.Security_deposit_Amt || 0,
          Payment_Basis: form.Payment_Basis || '',
          Default_Charge: form.Default_Charge || 0,
          CompEmpName: form.CompEmpName || '',
          VendorName: form.VendorName || '',
          VendorCategory: form.VendorCategory,
          UpdateBy: this.docketService.loginUserList?.UserId,
          Monthly_Phone_Charges: form.Monthly_Phone_Charges || 0,
          Valid_uptodt: form.Valid_uptodt,
          MetrixType: form.MetrixType || '',
          ContractType: form.ContractType || '',
          Flag: 'I',
          contract_YN: 'Y',
          VendorTypeName: form.VendorTypeName || '',
          FTLFixAmount: form.FTLFixAmount || 0,
          Local_Feeder_Rate_Type: form.Local_Feeder_Rate_Type || '',
          Local_Feeder_Rate: form.Local_Feeder_Rate || 0,
          ODAPickupApply: form.ODAPickupApply || false,
          ODAPickupStartKM: form.ODAPickupStartKM || 0,
          ODAPickupRateType: form.ODAPickupRateType || '',
          ODAPickupRate: form.ODAPickupRate || 0,
          ODADeliveryApply: form.ODADeliveryApply || false,
          ODADeliveryStartKM: form.ODADeliveryStartKM || 0,
          ODADeliveryRateType: form.ODADeliveryRateType || '',
          ODADeliveryRate: form.ODADeliveryRate || 0,
          Document: form.Document || '',
          CopyVendor: form.CopyVendor || ''

        },

        listWVCRM: this.vendorContractService.routeBasedContracts.value
      }
    };

    if (this.vendorContractService.vendorProfileForm.valid) {
      this.masterService.AddEditVendorContract(payload).subscribe({
        next: (response: any) => {
          debugger
        }
      });
      console.log(this.vendorContractService.vendorProfileForm.value)
    } else {
      this.vendorContractService.vendorProfileForm.markAllAsTouched();
    }
  }
  
}
