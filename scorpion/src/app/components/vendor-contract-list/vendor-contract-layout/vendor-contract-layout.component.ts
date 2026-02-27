import { Component } from '@angular/core';
import { VendorContractProfileComponent } from '../vendor-contract-profile/vendor-contract-profile.component';
import { VendorContractChargesComponent } from '../vendor-contract-charges/vendor-contract-charges.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendor-contract-layout',
  standalone: true,
  imports: [CommonModule,VendorContractProfileComponent,VendorContractChargesComponent],
  templateUrl: './vendor-contract-layout.component.html',
  styleUrl: './vendor-contract-layout.component.scss'
})
export class VendorContractLayoutComponent {
selectedTab: string = 'profile';

selectTab(tab: string) {
  this.selectedTab = tab;
}

// goBack() {
//   this.router.navigate(['/Master/VendorContract']);
// }
}
