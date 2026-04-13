import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { LoadingSheetApiService } from 'app/shared/services/loading-sheet-api.service';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import { environment } from 'environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { HCCDetailsComponent } from '../prs-generation-list/hcc-details/hcc-details.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { LSUpdatePopupComponent } from './lsupdate-popup/lsupdate-popup.component';

@Component({
  selector: 'app-loading-sheet-layout',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent,HCCDetailsComponent,LSUpdatePopupComponent],
  templateUrl: './loading-sheet-layout.component.html',
  styleUrl: './loading-sheet-layout.component.scss',
  providers: [BsModalService]
})
export class LoadingSheetLayoutComponent implements OnInit, OnDestroy {
  public env = environment;
  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;
  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();
  @ViewChild('HCCDetailsComponent') HCCDetailsComponent!: HCCDetailsComponent;
  @ViewChild('LSUpdatePopupComponent') LSUpdatePopupComponent!: LSUpdatePopupComponent;

  public loadingSheetData: any[] = [];
  public summaryData: any = {
    totalLS: 0,
    generated: 0,
    mfGenerated: 0,
    hccGenerated: 0,
    cancelled: 0
  };

  statusList = [
    { value: 'all', label: 'All Status' },
    { value: 'Generated', label: 'Generated' },
    { value: 'MF Generated', label: 'MF Generated' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'HCC Generated', label: 'HCC Generated' },
  ];

  lsTypeList = [
    { value: 'all', label: 'All Types' },
    { value: 'LTL', label: 'LTL' },
    { value: 'FTL', label: 'FTL' }
  ];

  public config = {
    fromDateStr: new Date(new Date().setDate(new Date().getDate() - 7)),
    toDateStr: new Date(),
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: '',
    statusFilter: 'all',
    lsType: 'all'
  };

  constructor(
    private loadingSheetApiService: LoadingSheetApiService,
    private docketService: DocketService,
    private exportService: ExportService
  ) { }

  ngOnInit() {
    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchLoadingSheetList();
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
    this.fetchLoadingSheetList();
  }

  onSearchChange() {
    this.fetchData();
  }

  onODAChange() {
    this.fetchData();
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Generated': return 's-gen';
      case 'MF Generated': return 's-billed';
      case 'HCC Generated': return 's-hcc';
      case 'Cancelled': return 's-canc';
      default: return '';
    }
  }


  fetchLoadingSheetList() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    this.isLoading = true;

    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: null,
      statusFilter: this.config.statusFilter,
      lsType: this.config.lsType,
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      searchText: this.config.searchText || null,
      isDownload: false
    };

    this.listSubscription = this.loadingSheetApiService.getLoadingSheetListing(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.data) {
          this.loadingSheetData = response.data;
          if (response.pagination) {
            this.config.totalRecords = response.pagination.totalRecords;
            this.config.totalPages = response.pagination.totalPages;
          }
          if (response.summary) {
            this.summaryData = response.summary;
          }
        } else {
          this.loadingSheetData = [];
          this.config.totalRecords = 0;
          this.config.totalPages = 1;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching Loading Sheet List', err);
        this.loadingSheetData = [];
      }
    });
  }

  downloadXLS() {
    if (this.isCSVLoading) return;
    this.isCSVLoading = true;

    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: null,
      statusFilter: this.config.statusFilter,
      lsType: this.config.lsType,
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      searchText: this.config.searchText || null,
      isDownload: true
    };

    this.loadingSheetApiService.getLoadingSheetListing(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response && response.data) {
          const exportData = response.data.map((item: any) => ({
            'LS No.': item.lsNo,
            'LS Date': new Date(item.lsDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            'LS Type': item.lsType,
            'Total Dockets': item.totalDockets,
            'MF No.': item.mfNo || '-',
            'Loading HCC No.': item.loadingHCCNo || '-',
            'Unloading HCC No.': item.unloadingHCCNo || '-',
            'Status': item.status
          }));
          this.exportService.exportToExcel(exportData, `Loading_Sheet_Listing`);
        }
      },
      error: () => {
        this.isCSVLoading = false;
      }
    });
  }

   openHHCDetails(data: any) {
    this.HCCDetailsComponent.showPopup(data, 'M');
  }

     openLSUpdatePopup(data: any, type: string) {
    this.LSUpdatePopupComponent.openModal(data, type);
  }

  openView(lsNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/LSViewPrint?ChallanNo=${lsNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  openMfNoView(mfNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/Menifest_ViewPrint?MFNO=${mfNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  openLoadingUnloadingView(data: string) {
    const url = `${this.env.liveUrl}Tracking/TripAllView?LsNO=${data}&VPType=LoadingUnloading`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  ngOnDestroy() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    this.fetchSubject.complete();
  }
}
