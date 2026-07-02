import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DynamicDataService } from '../../shared/services/dynamic-data.service';
import { BasicDetailService } from '../../shared/services/basic-detail.service';
import { ExportService } from '../../shared/services/export.service';
import { Subject, of } from 'rxjs';
import { debounceTime, switchMap, tap, catchError, filter, distinctUntilChanged } from 'rxjs/operators';
import { LrPrintViewComponent } from './lr-print-view/lr-print-view.component';
import { LrLifecycleTrackerComponent } from './lr-lifecycle-tracker/lr-lifecycle-tracker.component';
import { DocketService } from 'app/shared/services/docket.service';
import { Router } from '@angular/router';
import { LiveRouteMapComponent } from './live-route-map/live-route-map.component';

@Component({
  selector: 'app-lr-track-trace-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BsDatepickerModule, PaginationComponent, NgSelectModule, LrPrintViewComponent, LrLifecycleTrackerComponent, LiveRouteMapComponent],
  templateUrl: './lr-track-trace-list.component.html',
  styleUrl: './lr-track-trace-list.component.scss'
})
export class LrTrackTraceListComponent implements OnInit, OnDestroy {
  @ViewChild('lrPrintView') lrPrintView!: LrPrintViewComponent;
  @ViewChild('lrLifecycleTracker') lrLifecycleTracker!: LrLifecycleTrackerComponent;
  @ViewChild('liveRouteMap') liveRouteMap!: LiveRouteMapComponent;

  private searchSubject = new Subject<string>();
  private fetchDataSubject = new Subject<any>();
  public originSearchInput$ = new Subject<string>();
  public destinationSearchInput$ = new Subject<string>();

  constructor(
    private dynamicDataService: DynamicDataService,
    private basicDetailService: BasicDetailService,
    private exportService: ExportService,
    public docketService: DocketService,
    private router: Router,
  ) { }
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

  public statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Booking', value: 'Booking' },
    { label: 'In Transit', value: 'InTransit' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Exception', value: 'Exception' }
  ];

  public statusCounts: any = {
    Total: 0,
    Booking: 0,
    InTransit: 0,
    Delivered: 0,
    Exception: 0
  };

  get totalLRsCount() { return this.statusCounts.Total || 0; }
  get bookedCount() { return this.statusCounts.Booking || 0; }
  get transitCount() { return this.statusCounts.InTransit || 0; }
  get deliveredCount() { return this.statusCounts.Delivered || 0; }
  get exceptionsCount() { return this.statusCounts.Exception || 0; }

  public originBranch: string | null = null;
  public destinationBranch: string | null = null;
  public originLocations: any[] = [];
  public destinationLocations: any[] = [];
  public isOriginLoading: boolean = false;
  public isDestinationLoading: boolean = false;

  public customerType: string | null = null;
  public customerTypeList: any[] = [{ custType: 'All' }];

  public allLRs: any[] = [];

  public filteredLRs: any[] = [];

  get pagedLRs(): any[] {
    // API already handles pagination, so we return the filtered list directly
    return this.filteredLRs;
  }

  public isLoading: boolean = false;
  public isExporting: boolean = false;

  exportData() {
    this.isExporting = true;
    let fromDate = "";
    let toDate = "";
    try {
      if (this.config.fromDateStr) {
        const d = new Date(this.config.fromDateStr);
        fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00`;
      }
      if (this.config.toDateStr) {
        const d = new Date(this.config.toDateStr);
        toDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00`;
      }
    } catch (e) {
      console.warn("Date formatting error", e);
    }

    const payload = {
      FilterJson: {
        ReportId: "666",
        FromDate: fromDate,
        ToDate: toDate,
        Status: this.config.statusFilter === 'All Status' || this.config.statusFilter === 'All' ? "ALL" : this.config.statusFilter,
        Lr_Number: this.config.searchText || "",
        Origin: this.originBranch === 'All' || !this.originBranch ? "" : this.originBranch,
        Destination: this.destinationBranch === 'All' || !this.destinationBranch ? "" : this.destinationBranch,
        CustType: this.customerType === 'All' || !this.customerType ? "" : this.customerType,
        LocCode: this.docketService.loginUserList.LocationCode || ''
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        this.isExporting = false;
        const data = res?.data || res || {};
        const Table1 = data.Table1 || [];

        if (Table1 && Table1.length > 0) {
          this.exportService.exportToCSV(Table1, 'LR_Track_Trace_Export');
        } else {
          console.warn("No data available to export");
        }
      },
      error: (err: any) => {
        this.isExporting = false;
        console.error('Error exporting data:', err);
      }
    });
  }

  getTrackTraceData() {
    let fromDate = "";
    let toDate = "";
    try {
      if (this.config.fromDateStr) {
        const d = new Date(this.config.fromDateStr);
        fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00`;
      }
      if (this.config.toDateStr) {
        const d = new Date(this.config.toDateStr);
        toDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00`;
      }
    } catch (e) {
      console.warn("Date formatting error", e);
    }

    const payload = {
      FilterJson: {
        ReportId: "370",
        FromDate: fromDate,
        ToDate: toDate,
        pageNumber: this.config.page,
        pageSize: this.config.pageSize,
        Status: this.config.statusFilter === 'All Status' || this.config.statusFilter === 'All' ? "ALL" : this.config.statusFilter,
        Lr_Number: this.config.searchText || "",
        Origin: this.originBranch === 'All' || !this.originBranch ? "" : this.originBranch,
        Destination: this.destinationBranch === 'All' || !this.destinationBranch ? "" : this.destinationBranch,
        CustType: this.customerType === 'All' || !this.customerType ? "" : this.customerType,
        LocCode: this.docketService.loginUserList.LocationCode || ''
      }
    };

    console.log("TrackTrace Payload:", payload);
    this.fetchDataSubject.next(payload);
  }

  loadCustomerTypes() {
    this.dynamicDataService.getCustomerTypes().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        this.customerTypeList = [{ custType: 'All' }, ...data];
      },
      error: (err) => console.error('Failed to load customer types', err)
    });
  }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.loadCustomerTypes();
    this.setupTypeaheads();

    this.searchSubject.pipe(debounceTime(600)).subscribe(() => {
      this.config.page = 1;
      this.searchLRs();
    });

    this.fetchDataSubject.pipe(
      tap(() => this.isLoading = true),
      switchMap(payload => this.dynamicDataService.getDynamicData(payload).pipe(
        catchError(err => {
          console.error('Error fetching LR track and trace data:', err);
          return of({ error: true }); // Keep the stream alive after an error
        })
      ))
    ).subscribe((res: any) => {
      this.isLoading = false;
      if (res && res.error) return; // Ignore processing if an error occurred

      const data = res?.data || res || {};
      const table1 = data.Table1 || [];
      const table2 = data.Table2 || [];
      const table3 = data.Table3 || [];

      if (table2.length > 0) {
        this.statusCounts = table2[0];
      } else {
        this.statusCounts = { Total: 0, Booking: 0, InTransit: 0, Delivered: 0, Exception: 0 };
      }

      if (table1.length > 0) {
        this.config.totalRecords = table1[0].TotalRecords || 0;
        this.config.totalPages = table1[0].TotalPages || 1;
      }

      this.allLRs = table3;
      this.applyLocalFilters();
    });

    this.searchLRs();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
    this.fetchDataSubject.complete();
    this.originSearchInput$.complete();
    this.destinationSearchInput$.complete();
  }

  setupTypeahead(
    input$: Subject<string>,
    setLoading: (isLoading: boolean) => void,
    setLocations: (locations: any[]) => void
  ) {
    input$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(res => {
        if (res !== null && res.length >= 3) {
          return true;
        }
        return false;
      }),
      tap(() => setLoading(true)),
      switchMap(term => this.basicDetailService.getGCDestinations(term).pipe(
        catchError(() => of([])),
        tap(() => setLoading(false))
      ))
    ).subscribe((res: any) => {
      setLocations(Array.isArray(res) ? res : (res?.data || []));
      setLoading(false);
    });
  }

  setupTypeaheads() {
    this.setupTypeahead(
      this.originSearchInput$,
      (loading) => this.isOriginLoading = loading,
      (data) => this.originLocations = data
    );
    this.setupTypeahead(
      this.destinationSearchInput$,
      (loading) => this.isDestinationLoading = loading,
      (data) => this.destinationLocations = data
    );
  }

  onOriginSelect(selected: any) {
    if (selected) {
      this.originLocations = [selected];
    } else {
      this.originLocations = [];
      this.originBranch = null;
    }
    this.searchLRs();
  }

  openAddLR() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '';
      this.docketService.loginUserList = user;
      localStorage.setItem("loginUserList", JSON.stringify(user));
    }
    this.router.navigate(['/docket'], { queryParams: { fromLR: 'true' } });
  }

  onDestinationSelect(selected: any) {
    if (selected) {
      this.destinationLocations = [selected];
    } else {
      this.destinationLocations = [];
      this.destinationBranch = null;
    }
    this.searchLRs();
  }

  onSearchTextChange(value: string) {
    this.searchSubject.next(value);
  }

  openPrintView(lr: any) {
    if (this.lrPrintView) {
      this.lrPrintView.showPopup({ LrNumber: lr.LrNumber });
    }
  }

  openTrackerView(lr: any) {
    if (this.lrLifecycleTracker) {
      this.lrLifecycleTracker.showPopup(lr);
    }
  }

  openMapView(lr: any) {
    debugger
    if (this.liveRouteMap) {
      this.liveRouteMap.showPopup(lr);
    }
  }

  parseDate(dateStr: string): Date {
    return dateStr ? new Date(dateStr) : new Date();
  }

  applyLocalFilters() {
    this.filteredLRs = [...this.allLRs];
  }

  searchLRs() {
    this.getTrackTraceData();
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.config.page = 1;
    this.searchLRs();
  }

  resetFilters() {
    this.config.searchText = '';
    this.config.fromDateStr = new Date();
    this.config.toDateStr = new Date();
    this.config.statusFilter = 'All';
    this.originBranch = null;
    this.destinationBranch = null;
    this.customerType = null;
    this.config.page = 1;
    this.searchLRs();
  }

  setPage(page: number) {
    this.config.page = page;
    this.searchLRs(); // Trigger API call for new page
  }

  // Badge Helper Methods
  getPayBasisClass(payBas: string): string {
    const p = (payBas || '').toUpperCase();
    if (p === 'PAID') return 'bg-success-subtle text-success border-success-subtle';
    if (p === 'TOPAY' || p === 'TO PAY') return 'bg-warning-subtle text-warning border-warning-subtle';
    if (p === 'TBB') return 'bg-danger-subtle text-danger border-danger-subtle';
    return 'bg-secondary-subtle text-dark border-secondary-subtle';
  }

  getModeClass(mode: string): string {
    const m = (mode || '').toUpperCase();
    if (m.includes('ROAD')) return 'bg-primary-subtle text-primary border-primary-subtle';
    if (m.includes('AIR')) return 'bg-info-subtle text-info border-info-subtle';
    if (m.includes('COLD')) return 'bg-info-subtle text-info border-info-subtle';
    return 'bg-light text-dark border-secondary-subtle';
  }

  getModeIcon(mode: string): string {
    const m = (mode || '').toUpperCase();
    if (m.includes('ROAD')) return '🚛';
    if (m.includes('AIR')) return '✈';
    if (m.includes('COLD')) return '❄';
    return '📦';
  }

  getServiceClass(service: string): string {
    const s = (service || '').toUpperCase();
    if (s === 'LTL') return 'bg-warning-subtle text-warning border-warning-subtle';
    if (s === 'FTL') return 'bg-primary-subtle text-primary border-primary-subtle';
    return 'bg-light text-dark border-secondary-subtle';
  }

  getCustTypeClass(cust: string): string {
    const c = (cust || '').toUpperCase();
    if (c === 'CORPORATE') return 'bg-success-subtle text-success border-success-subtle';
    if (c === 'GROUP') return 'bg-primary-subtle text-primary border-primary-subtle';
    if (c === 'ILS') return 'bg-danger-subtle text-danger border-danger-subtle';
    if (c === 'AGGREGATORS') return 'bg-warning-subtle text-warning border-warning-subtle';
    if (c === 'NON-CORP') return 'badge-non-corp border-secondary-subtle';
    return 'bg-light text-dark border-secondary-subtle';
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return 'bg-success-subtle text-success border-success-subtle';
    if (s.includes('TRANSIT')) return 'bg-warning-subtle text-warning border-warning-subtle';
    if (s.includes('BOOK')) return 'bg-primary-subtle text-primary border-primary-subtle';
    if (s.includes('EXCEPTION')) return 'bg-danger-subtle text-danger border-danger-subtle';
    return 'bg-secondary-subtle text-dark border-secondary-subtle';
  }

  getStatusIconClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return 'bg-success';
    if (s.includes('TRANSIT')) return 'bg-warning';
    if (s.includes('BOOK')) return 'bg-primary';
    if (s.includes('EXCEPTION')) return 'bg-danger';
    return 'bg-secondary';
  }

  getStatusText(status: string): string {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return 'Delivered';
    if (s.includes('TRANSIT')) return 'In Transit';
    if (s.includes('BOOK')) return 'Booked';
    if (s.includes('EXCEPTION')) return 'Exception';
    return status || 'Unknown';
  }
}


