import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { LoadingSheetApiService } from 'app/shared/services/loading-sheet-api.service';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { environment } from 'environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { HCCDetailsComponent } from '../prs-generation-list/hcc-details/hcc-details.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { LSUpdatePopupComponent } from './lsupdate-popup/lsupdate-popup.component';
import Swal from 'sweetalert2';
import { HccViewComponent } from '../hcc-view/hcc-view.component';

@Component({
  selector: 'app-loading-sheet-layout',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, HCCDetailsComponent, LSUpdatePopupComponent, HccViewComponent],
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
  @ViewChild('HccViewComponent') HccViewComponent!: HccViewComponent;
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
    fromDateStr: new Date(),
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
    private exportService: ExportService,
    private sweetAlertService: SweetAlertService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }

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

  onDataUpdate() {
    this.apiCache.clear();
    this.fetchData();
  }

  private apiCache = new Map<string, any>();


  fetchLoadingSheetList() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }

    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: this.docketService.loginUserList.LocationCode,
      statusFilter: this.config.statusFilter,
      lsType: this.config.lsType,
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      searchText: this.config.searchText || null,
      isDownload: false
    };

    const cacheKey = JSON.stringify(payload);
    if (this.apiCache.has(cacheKey)) {
      this.handleApiResponse(this.apiCache.get(cacheKey));
      return;
    }

    this.isLoading = true;

    this.listSubscription = this.loadingSheetApiService.getLoadingSheetListing(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.apiCache.set(cacheKey, response);
        this.handleApiResponse(response);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching Loading Sheet List', err);
        this.loadingSheetData = [];
      }
    });
  }

  private handleApiResponse(response: any) {
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
  }

  downloadXLS() {
    if (this.isCSVLoading) return;
    this.isCSVLoading = true;

    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: this.docketService.loginUserList.LocationCode,
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
    const url = `${this.env.liveUrl}ViewPrint/ViewLS?ChallanNo=${lsNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  openHccView(data: any, chargeType: string) {
    this.HccViewComponent.showPopup(data, chargeType, 'M');
  }

  openMfNoView(mfNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewMF?MFNO=${mfNo}&src=angular`;
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

  cancelLoadingSheet(lsNo: string) {
    Swal.fire({
      title: `Cancel Loading Sheet ${lsNo}`,
      html: `
        <div class="text-start">
          <p>Are you sure you want to cancel this Loading Sheet?</p>
          <label for="remark" class="form-label">Remark:</label>
          <textarea id="remark" class="form-control-textarea" placeholder="Enter cancellation remark..." rows="3" ></textarea>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel!',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      width: '450px',
      customClass: {
        popup: 'glassy-info-popup',
        title: 'glassy-info-title',
        htmlContainer: 'glassy-info-body',
        confirmButton: 'glassy-info-btn',
        cancelButton: 'glassy-info-btn',
        icon: 'glassy-info-icon'
      },
      preConfirm: () => {
        const remark = (document.getElementById('remark') as HTMLTextAreaElement).value;
        if (!remark || remark.trim() === '') {
          Swal.showValidationMessage('Please enter a remark');
          return false;
        }
        return remark.trim();
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const payload = {
          lSclnList: [
            {
              lsNo: lsNo,
              remark: result.value,
              isChecked: true
            }
          ],
          baseUserName: this.docketService.loginUserList?.BaseUserName
        };

        this.loadingSheetApiService.loadingSheetCancellationSubmit(payload).subscribe({
          next: (response: any) => {
            if (response) {
              this.sweetAlertService.success(`Loading Sheet ${response.lsNo} ${response.message}`);
              this.onDataUpdate(); // Refresh the list
            } else {
              this.sweetAlertService.error('Failed to cancel Loading Sheet');
            }
          },
          error: (err: any) => {
            console.error('Error cancelling Loading Sheet', err);
            this.sweetAlertService.error('Error occurred while cancelling Loading Sheet');
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    this.fetchSubject.complete();
  }
}
