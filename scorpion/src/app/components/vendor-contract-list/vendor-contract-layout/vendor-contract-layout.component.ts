import { Component } from '@angular/core';
import { VendorContractProfileComponent } from '../vendor-contract-profile/vendor-contract-profile.component';
import { VendorContractChargesComponent } from '../vendor-contract-charges/vendor-contract-charges.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-vendor-contract-layout',
  standalone: true,
  imports: [CommonModule, VendorContractProfileComponent, VendorContractChargesComponent],
  templateUrl: './vendor-contract-layout.component.html',
  styleUrl: './vendor-contract-layout.component.scss'
})
export class VendorContractLayoutComponent {
  selectedTab: string = 'profile';
  constructor(public router: Router,public vendorContractService:VendorContractService,public docketService:DocketService,) {
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
    if (this.vendorContractService.vendorProfileForm.valid) {
      this.selectedTab = 'charges';
    } else {
      this.vendorContractService.vendorProfileForm.markAllAsTouched();
      this.selectedTab = 'profile';
    }
  } else {
    this.selectedTab = tab;
  }
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
