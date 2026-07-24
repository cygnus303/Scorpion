import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { UnbilledDetailComponent } from '../unbilled-detail/unbilled-detail.component';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule,NgSelectModule,ReactiveFormsModule,BsDatepickerModule,UnbilledDetailComponent],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.scss'
})
export class VendorDashboardComponent implements OnInit {
  private listSubscription?: Subscription;
  public vendorList: any[] = [];
  public vendorSearchInput$ = new Subject<string>();
  public isVendorLoading: boolean = false;
  @ViewChild(UnbilledDetailComponent) unbilledDetailComponent!: UnbilledDetailComponent;

  public filterForm!: FormGroup;
  public showUnbilledDetail: boolean = false;
  
  constructor(
    private router: Router, 
    private dynamicDataService: DynamicDataService,
    private fb: FormBuilder
  ) {
    this.buildForm();
  }

  buildForm(){
this.filterForm = this.fb.group({
      fromDateStr: [new Date()],
      toDateStr: [new Date()],
      Vendor: [null]
    });
  }

  ngOnInit() {
    this.vendorSearchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      if (term && term.trim().length >= 3) {
        this.isVendorLoading = true;
        this.getVendorList(term.trim());
      } else {
        this.isVendorLoading = false;
      }
    });

    this.filterForm.valueChanges.subscribe(val => {
      this.onVendorFilterChange();
    });
  }

  onVendorFilterChange() {
    console.log('Filter changed', this.filterForm.value);
  }

  resetVendorDashboardFilter() {
   this.buildForm();
  }

  openVendorUnbilledListing(type:string) {
    this.showUnbilledDetail = true;
    this.unbilledDetailComponent.showPopup(this.filterForm.value, type,'dashboard');
  }

  closeUnbilledListing() {
    this.showUnbilledDetail = false;
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

  getVendorList(searchTerm: string) {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    const payload = {
      FilterJson: {
        "ReportId": "05",
        "Search": searchTerm
      }
    };

    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        this.isVendorLoading = false;
        if (res && res.Table1 && res.Table1.length > 0) {
          this.vendorList = res.Table1;
        } else {
          this.vendorList = [];
        }
      },
      error: (err: any) => {
        this.isVendorLoading = false;
        this.vendorList = [];
      }
    });
  }
}
