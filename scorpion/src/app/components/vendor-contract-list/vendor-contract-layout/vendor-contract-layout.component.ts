import { Component } from '@angular/core';
import { VendorContractProfileComponent } from '../vendor-contract-profile/vendor-contract-profile.component';
import { VendorContractChargesComponent } from '../vendor-contract-charges/vendor-contract-charges.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';

@Component({
  selector: 'app-vendor-contract-layout',
  standalone: true,
  imports: [CommonModule, VendorContractProfileComponent, VendorContractChargesComponent],
  templateUrl: './vendor-contract-layout.component.html',
  styleUrl: './vendor-contract-layout.component.scss'
})
export class VendorContractLayoutComponent {
  selectedTab: string = 'profile';
  constructor(public router: Router,public vendorContractService:VendorContractService) { }
  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  goBack() {
    this.router.navigate(['/Master/VendorContractTypeWise']);
  }

  onContinue(){
    if(this.vendorContractService.vendorProfileForm.valid){
      this.selectedTab = 'charges';
    }else {
      this.vendorContractService.vendorProfileForm.markAllAsTouched();
    }
  }

  onBack(){
    this.selectedTab = 'profile';
  }
  
}
