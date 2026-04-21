import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import { PRSArrivalComponent } from './prsarrival/prsarrival.component';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';

import { Router } from '@angular/router';
import { HCCDetailsComponent } from './hcc-details/hcc-details.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'environments/environment';
import { PRSDRSEditComponent } from './prsdrs-edit/prsdrs-edit.component';

@Component({
  selector: 'app-prs-generation-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, PRSArrivalComponent, HCCDetailsComponent, PRSDRSEditComponent],
  templateUrl: './prs-generation-list.component.html',
  styleUrl: './prs-generation-list.component.scss',
  providers: [PFMapiService, BsModalService]
})
export class PRSGenerationListComponent implements OnInit, OnDestroy {
  @ViewChild('PRSArrivalComponent') PRSArrivalComponent!: PRSArrivalComponent;
  @ViewChild('HCCDetailsComponent') HCCDetailsComponent!: HCCDetailsComponent;
  public  env = environment;
  @ViewChild('PRSDRSEditComponent') PRSDRSEditComponent!: PRSDRSEditComponent;

  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();
  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;

  public summaryData: any = {
    total_PRS: 0,
    pending_for_Arrival: 0,
    prs_Billed: 0,
    hcc_Generated: 0,
    cancelled: 0,
    total_PRS_Arrived: 0
  };

  statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Generated', value: 'Generated' },
    { label: 'Arrived', value: 'Arrived' },
    { label: 'Billed', value: 'Billed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'HCC Generated', value: 'HCC Generated' }
  ];

  public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    statusFilter: 'All',
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

  public prsData: any[] = [];

  constructor(
    public PFMapiService: PFMapiService,
    public docketService: DocketService,
    public exportService: ExportService,
    private sweetAlertService: SweetAlertService,
    private prsdrsApiService: PRSDRSApiService,
    private router: Router
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }

    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchPRSList();
    });

    this.fetchData();
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  setPage(p: number) {
    if (this.config.page === p) return;
    this.config.page = p;
    this.fetchPRSList();
  }

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  fetchPRSList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.isLoading = true;
    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: this.docketService.loginUserList.LocationCode || null,
      statusFilter: this.config.statusFilter || 'All',
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      isDownload: 0,
      searchText: this.config.searchText || null
    };

    this.listSubscription = this.PFMapiService.GetPrsList(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.data) {
          this.prsData = response.data;

          if (response.pagination) {
            this.config.totalRecords = response.pagination.totalRecords || this.prsData.length;
            this.config.totalPages = response.pagination.totalPages || 1;
            this.config.page = response.pagination.currentPage || 1;
            this.config.pageSize = response.pagination.pageSize || 50;
          }

          if (response.summary) {
            this.summaryData = response.summary;
          }
        } else {
          this.prsData = [];
          this.config.totalRecords = 0;
          this.config.totalPages = 1;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching PRS List', err);
        this.prsData = [];
      }
    });
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  downloadCSV() {
    this.isCSVLoading = true;
    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: this.docketService.loginUserList.LocationCode || null,
      statusFilter: this.config.statusFilter || 'All',
      pageNumber: this.config.page,
      pageSize: this.config.pageSize, // High page size or handling from backend for CSV.
      isDownload: 1,
      searchText: this.config.searchText || null
    };

    this.listSubscription = this.PFMapiService.GetPrsList(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response && response.data) {
          this.exportService.exportToCSV(response.data, `PRS_List`);
        }
      },
      error: (err: any) => {
        this.isCSVLoading = false;
        console.error('Error downloading CSV', err);
      }
    });
  }

  ngOnDestroy() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.fetchSubject.complete();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Generated': return 's-gen';
      case 'Billed': return 's-billed';
      case 'HCC Generated': return 's-hcc';
      case 'Cancelled': return 's-canc';
      default: return '';
    }
  }

  isHccValid(hcc: string): boolean {
    return hcc !== 'NO HCC';
  }

  openAddPRSDRS() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '2';
      this.docketService.loginUserList = user;
      localStorage.setItem("loginUserList", JSON.stringify(user));
    }
    this.router.navigate(['Operation/ChallanList'], { queryParams: { fromPRS: 'true' } });
  }

  openPRSArrival(row: any) {
    this.PRSArrivalComponent.showPopup(row);
  }

  openHHCDetails(data: any) {
    this.HCCDetailsComponent.showPopup(data, 'P');
  }

  openPRSDRSEdit(data: any, flag: string) {
    this.PRSDRSEditComponent.showPopup(data, flag);
  }

  onCancel(prsNo: string) {
    this.sweetAlertService.cancel(`Are You Sure You Want to Cancel ${prsNo}?`, () => {
      this.onCancelDrs(prsNo);
    });
  }

  onCancelDrs(prsNo: string) {
    const payload = {
      baseUserName: this.docketService.loginUserList?.BaseUserName,
      filterType: "P",
      pdcno: prsNo
    }
    this.prsdrsApiService.onCancelDRS(payload).subscribe({
        next: (response: any) => {
         if(response) {
          this.sweetAlertService.success(`PRS ${prsNo} has been cancelled successfully.`);
          this.fetchData();
         }
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

   openHCCModal(hccNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/LoadingUnloadingViewPrint?LsNO=${hccNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

    openView(pdcNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewPrint?DocumentNo=${pdcNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }
}
