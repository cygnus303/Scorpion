import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonModule } from '@angular/common';
import { BillReceiptComponent } from './bill-receipt/bill-receipt.component';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { CommonService } from 'app/shared/services/common.service';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-bill-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, PaginationComponent,BillReceiptComponent],
  templateUrl: './bill-collection.component.html',
  styleUrl: './bill-collection.component.scss'
})
export class BillCollectionComponent implements OnInit {
  @ViewChild('BillReceiptComponent') BillReceiptComponent!: BillReceiptComponent;
  public isLoading: boolean = false;
  public listSubscription!:Subscription;
  private fetchSubject = new Subject<void>();
  public billList: any[] = [];
  public billingPartyData: any[] = [];
  public notFoundTextValue: string = 'No matches found';
  
  public config = {
    FromDt: new Date(),
    ToDt: new Date(),
    Status: 'ALL',
    PageNo: 1,
    PageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    billNo: '',
    SearchText: '',
    Party_code: null
  };

  constructor(
    private dynamicDataService: DynamicDataService,
    private commonService:CommonService,
    private basicDetailService: BasicDetailService,
    public docketService: DocketService
  ){}

  ngOnInit() {
     this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
       this.getBillingList();
        });
    
        this.fetchData();
  }

  fetchData() {
    this.config.PageNo = 1;
    this.fetchSubject.next();
  }

  setPage(event: any) {
    this.config.PageNo = event;
    this.getBillingList();
  }

  getBillingPartyData(event: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 3) {
      this.billingPartyData = [];
      this.notFoundTextValue = 'Enter at least 3 characters';
      return;
    }
    const payload = {
      searchTerm: searchText,
      paybs: 'P02', 
      location: this.docketService.loginUserList?.LocationCode || this.docketService.Location || 'BWH'
    }
    this.notFoundTextValue = 'Searching...';
    this.basicDetailService.getBillingParty(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.billingPartyData = response.data;
          this.notFoundTextValue = 'No matches found';
        } else {
          this.billingPartyData = [];
          this.notFoundTextValue = 'No matches found';
        }
      },
      error: () => {
        this.billingPartyData = [];
        this.notFoundTextValue = 'No matches found';
      }
    });
  }

  resetBillingPartyDropdown() {
    this.billingPartyData = [];
  }

    statusList = [
    { label: 'All Status', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Pending Approval', value: 'PendingApproval' },

  ];

  getBillingList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }

    const payload = {
      "FilterJson": {
       "ReportId" : "371",
        "Fromdt" : this.commonService.formatDateToISO(this.config.FromDt),
        "Todt" : this.commonService.formatDateToISO(this.config.ToDt),
        "Billtype" : "All",
        "Status":this.config.Status,
        "Party_code" :this.config.Party_code,
        "billno" : this.config.billNo,
        "PageNo" : this.config.PageNo,
        "PageSize" : this.config.PageSize,
        "IsDownload" : "0",
        "SearchText" : this.config.SearchText
      }
    }
    this.isLoading = true;
    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoading = false;
      if (response && response.Table1) {
        this.billList = response.Table1;
        if (this.billList.length > 0) {
          this.config.totalRecords = this.billList[0].TotalCount;
          this.config.totalPages = Math.ceil(this.config.totalRecords / this.config.PageSize);
        } else {
          this.config.totalRecords = 0;
          this.config.totalPages = 1;
        }
      } else {
        this.billList = [];
        this.config.totalRecords = 0;
        this.config.totalPages = 1;
      }
    }, () => {
      this.isLoading = false;
      this.billList = [];
    });
  }

  getCalculatedStatus(item: any): string {
    if (item.PENDAMT == null) return '-';
    if (item.PENDAMT === item.BILLAMT) return 'Pending for Collection';
    if (item.PENDAMT > 0 && item.PENDAMT < item.BILLAMT) return 'Partially Collected';
    if (item.PENDAMT === 0) return 'Collected';
    return 'Pending for Collection';
  }

  getStatusStyles(item: any) {
    const status = this.getCalculatedStatus(item);
    if (status === 'Pending for Collection') {
      return { 'background': '#ffecb3', 'color': '#ff8f00', 'border': '1px solid #ffe082', 'padding': '4px 10px', 'border-radius': '12px' };
    } else if (status === 'Partially Collected') {
      return { 'background': '#e3f2fd', 'color': '#1565c0', 'border': '1px solid #90caf9', 'padding': '4px 10px', 'border-radius': '12px' };
    } else if (status === 'Collected') {
      return { 'background': '#e8f5e9', 'color': '#2e7d32', 'border': '1px solid #a5d6a7', 'padding': '4px 10px', 'border-radius': '12px' };
    }
    return {};
  }


  openPopup() {
    this.BillReceiptComponent.showPopup();
  }
}
