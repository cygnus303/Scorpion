import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { CommonService } from 'app/shared/services/common.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-followup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BsDatepickerModule, PaginationComponent],
  templateUrl: './payment-followup.component.html',
  styleUrl: './payment-followup.component.scss'
})
export class PaymentFollowupComponent implements OnInit {
  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();
  public isLoading: boolean = false;
  public summaryData: any;

  public paymentList: any = [];
  public config = {
    fromDateStr:  new Date(), 
    toDateStr:  new Date(),
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

  constructor(
    public dynamicDataService: DynamicDataService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getPaymentFollowupData();
    });

    this.fetchData();
  }

  getPaymentFollowupData() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }

    const payload = {
      FilterJson: {
        "ReportId": "13",
        "VendorCode": "V0100",
        "FromDate": this.commonService.formatDateToISO(this.config.fromDateStr),
        "ToDate": this.commonService.formatDateToISO(this.config.toDateStr),
        "PageNo": this.config.page,
        "PageSize": this.config.pageSize,
        "IsDownload": "0",
        "SearchText": this.config.searchText
      }
    };
    

    this.isLoading = true;

    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.paymentList = response.Table2 || response.Table || [];
          if (response.Table1 && response.Table1.length > 0) {
            this.summaryData = response.Table1[0];
          } else {
             if(response.Table && !response.Table2) {
                 this.paymentList = response.Table;
             }
          }
          if (response.Table3) {
            this.config.totalRecords = response.Table3[0].TotalRecords || this.paymentList.length;
            this.config.totalPages = response.Table3[0].TotalPages || 1;
            this.config.page = response.Table3[0].PageNo || 1;
            this.config.pageSize = response.Table3[0].PageSize || 10;
          } else if(response.Table2 && response.Table2.length > 0) {
            this.config.totalRecords = response.Table2[0].TotalRecords || this.paymentList.length;
          }
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.isLoading = false;
      }
    });
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  setPage(p: number) {
    if (this.config.page === p) return;
    this.config.page = p;
    this.getPaymentFollowupData();
  }

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }
}
