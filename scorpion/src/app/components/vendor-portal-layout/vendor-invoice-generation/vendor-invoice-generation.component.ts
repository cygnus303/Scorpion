import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-invoice-generation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-invoice-generation.component.html',
  styleUrl: './vendor-invoice-generation.component.scss'
})
export class VendorInvoiceGenerationComponent {

  constructor(private router: Router) {}

onVendorFilterChange() {
    console.log('Filter changed');
  }

  resetVendorDashboardFilter() {
    console.log('Filter reset');
  }

  openPrsListing() {
    this.router.navigate(['/Vendor/unbilled-detail'], { queryParams: { type: 'PRS', source: 'invoice-generation' } });
  }

  openVendorUnbilledThcListing() {
    this.router.navigate(['/Vendor/unbilled-detail'], { queryParams: { type: 'THC', source: 'invoice-generation' } });
  }

  openVendorUnbilledDrsListing() {
    this.router.navigate(['/Vendor/unbilled-detail'], { queryParams: { type: 'DRS', source: 'invoice-generation' } });
  }

  openVendorUnbilledHccListing() {
    this.router.navigate(['/Vendor/unbilled-detail'], { queryParams: { type: 'HCC', source: 'invoice-generation' } });
  }

  openVendorServiceBillsListing() {
    console.log('Open Service Bills Listing');
  }

  openProvisionalBillsListing() {
    this.router.navigate(['/Vendor/provisional-bills'], { queryParams: { source: 'invoice-generation' } });
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
