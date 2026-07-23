import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.scss'
})
export class VendorDashboardComponent {
  
  constructor(private router: Router) {}

  onVendorFilterChange() {
    console.log('Filter changed');
  }

  resetVendorDashboardFilter() {
    console.log('Filter reset');
  }

  openPrsListing() {
    this.router.navigate(['/Vendor/unbilled-detail'], { queryParams: { type: 'PRS', source: 'dashboard' } });
  }

  openVendorUnbilledThcListing() {
    this.router.navigate(['/Vendor/unbilled-detail'], { queryParams: { type: 'THC', source: 'dashboard' } });
  }

  openVendorUnbilledDrsListing() {
    this.router.navigate(['/Vendor/unbilled-detail'], { queryParams: { type: 'DRS', source: 'dashboard' } });
  }

  openVendorUnbilledHccListing() {
    this.router.navigate(['/Vendor/unbilled-detail'], { queryParams: { type: 'HCC', source: 'dashboard' } });
  }

  openVendorServiceBillsListing() {
    console.log('Open Service Bills Listing');
  }

  openProvisionalBillsListing() {
    this.router.navigate(['/Vendor/provisional-bills'], { queryParams: { source: 'dashboard' } });
  }

  openSubmittedBillsListing() {
    console.log('Open Submitted Bills Listing');
  }

  openPendingApprovalListing() {
    console.log('Open Pending Approval Listing');
  }

  openPendingAccountsListing() {
    console.log('Open Pending Accounts Listing');
  }

  openVendorPendingPaymentListing() {
    console.log('Open Pending Payment Listing');
  }

  openVendorPaymentProcessedListing() {
    console.log('Open Payment Processed Listing');
  }

  openVendorDebitNoteListing() {
    console.log('Open Debit Note Listing');
  }
}
