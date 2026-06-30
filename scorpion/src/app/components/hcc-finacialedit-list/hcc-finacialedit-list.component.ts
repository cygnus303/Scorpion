import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HCCviewComponent } from './hccview/hccview.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { HCCDetailsComponent } from '../prs-generation-list/hcc-details/hcc-details.component';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import { environment } from 'environments/environment';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { MenuAccessService } from 'app/shared/services/menu-access.service';

@Component({
  selector: 'app-hcc-finacialedit-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, HCCDetailsComponent, HCCviewComponent],
  providers: [BsModalService],
  templateUrl: './hcc-finacialedit-list.component.html',
  styleUrl: './hcc-finacialedit-list.component.scss',
})
export class HccFinacialeditListComponent implements OnInit, OnDestroy {
  @ViewChild('HCCviewComponent') HCCviewComponent!: HCCviewComponent;
  @ViewChild('HCCDetailsComponent') HCCDetailsComponent!: HCCDetailsComponent;

  public env = environment;
  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();
  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;

  public hccData: any[] = [];
  public summaryData: any = {
    TotalHCC: 0,
    Generated: 0,
    Billed: 0,
    Cancelled: 0,
    Finalised: 0,
    RequestGenerated: 0,
    Paid: 0
  };

  public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    statusFilter: 'All',
    page: 1,
    pageSize: 10,
    hccType:'All',
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

  HCCTypeList = [
    { label: 'All Status', value: 'All' },
    { label: 'Loading HCC', value: 'L' },
    { label: 'Unloading HCC', value: 'U' },
  ];

  constructor(
    private thcMasterService: THCMasterService,
    public docketService: DocketService,
    public exportService: ExportService,
    private sweetAlertService: SweetAlertService,
     public menuAccessService: MenuAccessService
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
      this.fetchHCCList();
    });

    this.fetchData();

    this.menuAccessService.loadMenuPermissions('HCC1');
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  refreshData() {
    this.fetchData();
  }

  
  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  setPage(p: number) {
    if (this.config.page === p) return;
    this.config.page = p;
    this.fetchHCCList();
  }

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  fetchHCCList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.isLoading = true;

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    };

    const locationCode = this.docketService.loginUserList?.LocationCode;
    const hccLocations = (locationCode && locationCode !== 'HQTR') ? [locationCode] : [];

    let hccTypes: string[] = [];
    if (this.config.hccType === 'L') {
      hccTypes = ['L'];
    } else if (this.config.hccType === 'U') {
      hccTypes = ['U'];
    }

    const payload = {
      FilterJson: {
        FromDate: formatDate(new Date(this.config.fromDateStr)),
        ToDate: formatDate(new Date(this.config.toDateStr)),
        HCCLocation: hccLocations,
        HCCType: [this.config.hccType],
        VendorType: [],
        VendorCode: [],
        HCCStatus: [this.config.statusFilter],
        SearchText: this.config.searchText || ''
      },
      PageNo: this.config.page,
      PageSize: this.config.pageSize
    };

    this.listSubscription = this.thcMasterService.getHCCList(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.data) {
          this.hccData = response.data;

          if (response.summary && response.summary.length > 0) {
            this.summaryData = response.summary[0];
          } else {
            this.summaryData = {
              TotalHCC: 0,
              Generated: 0,
              Billed: 0,
              Cancelled: 0,
              Finalised: 0,
              RequestGenerated: 0,
              Paid: 0
            };
          }

          const totalRecords = (response.data.length > 0) ? response.data[0].TotalRecords : 0;
          this.config.totalRecords = totalRecords;
          this.config.totalPages = Math.ceil(totalRecords / this.config.pageSize) || 1;
        } else {
          this.hccData = [];
          this.config.totalRecords = 0;
          this.config.totalPages = 1;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching HCC List', err);
        this.hccData = [];
        this.config.totalRecords = 0;
        this.config.totalPages = 1;
      }
    });
  }

  downloadXLS() {
    this.isCSVLoading = true;

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    };

    const locationCode = this.docketService.loginUserList?.LocationCode;
    const hccLocations = (locationCode && locationCode !== 'HQTR') ? [locationCode] : [];

    let hccTypes: string[] = [];
    if (this.config.hccType === 'Loading') {
      hccTypes = ['L'];
    } else if (this.config.hccType === 'Unloading') {
      hccTypes = ['U'];
    }

    const payload = {
      FilterJson: {
        FromDate: formatDate(new Date(this.config.fromDateStr)),
        ToDate: formatDate(new Date(this.config.toDateStr)),
        HCCLocation: hccLocations,
        HCCType: hccTypes,
        VendorType: [],
        VendorCode: [],
        HCCStatus: [],
        SearchText: this.config.searchText || ''
      },
      PageNo: 1,
      PageSize: 100000
    };

    this.thcMasterService.getHCCList(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response && response.data) {
          this.exportService.exportToCSV(response.data, `HCC_Financial_Edit_List`);
        }
      },
      error: (err: any) => {
        this.isCSVLoading = false;
        console.error('Error downloading CSV', err);
      }
    });
  }

  openHCCview(row: any) {
    this.HCCviewComponent.showPopup(row);
  }

  openPrint(hccNo: string) {
    if (!hccNo) return;
    const url = `${this.env.liveUrl}ViewPrint/LoadingUnloadingViewPrint?LsNO=${hccNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

  openView(docNo: string) {
    if (!docNo) return;
    const url = `${this.env.liveUrl}ViewPrint/LoadingUnloadingBillView?BillNo=${docNo}&Type=8&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

  openEditModal(row?: any) {
    if (row) {
      this.HCCDetailsComponent.showPopup(row, 'H');
    } else {
      this.HCCDetailsComponent.showPopup('', 'H');
    }
  }

  ngOnDestroy() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.fetchSubject.complete();
  }

   onCancel(row: any) {
    this.sweetAlertService.cancel(`Are you sure you want to cancel HCC ${row.HCNumber}?`, () => {
      this.hCCCancellation(row);
    });
  }

  hCCCancellation(row: any) {
    const payload = {
      "baseUserName": this.docketService.loginUserList.BaseUserName,
      "documentNo": row.DocumentNo,
      "hcNumber": row.HCNumber
    }
    this.thcMasterService.getHCCCancel(payload).subscribe({
      next: (response: any) => {
        if (response.Status === 1) {
          this.sweetAlertService.success(response.Msg);
          this.fetchHCCList();
        }
        else {
          this.sweetAlertService.error(response.Msg);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching HCC List', err);
      }
    });
  }

  openHCCModal(hccNo: string,documentNo:string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewHCC?DocumentNo=${documentNo}&HCNo=${hccNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }
}
