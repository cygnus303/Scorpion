import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import { StockupdatePopupComponent } from './stockupdate-popup/stockupdate-popup.component';

@Component({
  selector: 'app-stock-update-layout',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent,StockupdatePopupComponent],
  templateUrl: './stock-update-layout.component.html',
  styleUrl: './stock-update-layout.component.scss'
})
export class StockUpdateLayoutComponent {
  public env = environment;
  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;
  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();
  @ViewChild('StockupdatePopupComponent') StockupdatePopupComponent!: StockupdatePopupComponent;

  public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: '',
    statusFilter: 'All'
  };

  public stockUpdateData: any[] = [];
  public summaryData: any = {
    totalStockUpdate: 0,
    ltlManifest: 0,
    ftlManifest: 0
  };

  constructor(
    private stockUpdateService: StockUpdateService,
    private docketService: DocketService,
    private exportService: ExportService
  ) { 
       const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

  ngOnInit() {
    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchStockUpdateList();
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
    this.fetchStockUpdateList();
  }

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  private apiCache = new Map<string, any>();

  fetchStockUpdateList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }

    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: this.docketService.loginUserList.LocationCode || null,
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      searchText: this.config.searchText||'',
      isDownload: 0,
      statusFilter:this.config.statusFilter
    };

    // const cacheKey = JSON.stringify(payload);
    // if (this.apiCache.has(cacheKey)) {
    //   this.handleApiResponse(this.apiCache.get(cacheKey));
    //   return;
    // }

    this.isLoading = true;
    this.listSubscription = this.stockUpdateService.getStockUpdateListing(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        // this.apiCache.set(cacheKey, response);
        this.handleApiResponse(response);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching Stock Update List', err);
        this.stockUpdateData = [];
      }
    });
  }

  private handleApiResponse(response: any) {
    if (response && response.data) {
      this.stockUpdateData = response.data;
      if (response.pagination) {
        this.config.totalRecords = response.pagination.totalRecords || this.stockUpdateData.length;
        this.config.totalPages = response.pagination.totalPages || 1;
        this.config.page = response.pagination.currentPage || 1;
      }
      if (response.summary) {
        this.summaryData = response.summary;
      }
    } else {
      this.stockUpdateData = [];
      this.config.totalRecords = 0;
      this.config.totalPages = 1;
    }
  }

  ngOnDestroy() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.fetchSubject.complete();
  }

  onDataUpdate() {
    this.apiCache.clear();
    this.fetchData();
  }

  openView(thcNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/UnLoadingSheet_ViewPrint?LSNo=${thcNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  openStockUpdate(row: any) {
    console.log('Navigating to Stock Update Detail for:', row.thcNo);
    // Usually this would navigate to a route like:
    // this.router.navigate(['Operation/StockUpdateDetail'], { queryParams: { id: row.thcNo } });
    this.StockupdatePopupComponent.showPopup(row);
  }
    

  downloadXLS() {
    if (this.isCSVLoading) return;
    this.isCSVLoading = true;

    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: this.docketService.loginUserList.LocationCode || null,
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      searchText: this.config.searchText || '',
      isDownload: 1,
      statusFilter:this.config.statusFilter
    };

    this.stockUpdateService.getStockUpdateListing(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response && response.data && response.data.length > 0) {
          this.exportService.exportToCSV(response.data, `Stock_Update_Listing`);
        }
      },
      error: () => {
        this.isCSVLoading = false;
      }
    });
  }
}
