import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DynamicDataService } from '../../shared/services/dynamic-data.service';
import { ExportService } from '../../shared/services/export.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LrPrintViewComponent } from './lr-print-view/lr-print-view.component';

@Component({
  selector: 'app-lr-track-trace-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BsDatepickerModule, PaginationComponent, NgSelectModule, LrPrintViewComponent],
  templateUrl: './lr-track-trace-list.component.html',
  styleUrl: './lr-track-trace-list.component.scss'
})
export class LrTrackTraceListComponent implements OnInit, OnDestroy {
  @ViewChild('lrPrintView') lrPrintView!: LrPrintViewComponent;

  private searchSubject = new Subject<string>();

  constructor(private dynamicDataService: DynamicDataService, private exportService: ExportService) { }
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

  public originBranch: string = 'All';
  public destinationBranch: string = 'All';
  public customerType: string = 'All';

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
      if (this.config.fromDateStr) fromDate = new Date(this.config.fromDateStr).toISOString();
      if (this.config.toDateStr) toDate = new Date(this.config.toDateStr).toISOString();
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
        IsExportDownload: 0
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        this.isExporting = false;
        const data = res?.data || res || {};
        const table3 = data.Table3 || [];
        
        if (table3 && table3.length > 0) {
          this.exportService.exportToCSV(table3, 'LR_Track_Trace_Export');
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
      if (this.config.fromDateStr) fromDate = new Date(this.config.fromDateStr).toISOString();
      if (this.config.toDateStr) toDate = new Date(this.config.toDateStr).toISOString();
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
        IsExportDownload:1
      }
    };

    console.log("TrackTrace Payload:", payload);

    this.isLoading = true;

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
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
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching LR track and trace data:', err);
      }
    });
  }

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(600)).subscribe(() => {
      this.config.page = 1;
      this.searchLRs();
    });
    this.searchLRs(); 
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  onSearchTextChange(value: string) {
    this.searchSubject.next(value);
  }

  openPrintView(lr: any) {
    if (this.lrPrintView) {
      this.lrPrintView.showPopup({ LrNumber: lr.LrNumber });
    }
  }

  parseDate(dateStr: string): Date {
    return dateStr ? new Date(dateStr) : new Date();
  }

  applyLocalFilters() {
    this.filteredLRs = this.allLRs.filter(lr => {
      if (this.originBranch && this.originBranch !== 'All') {
        if (lr.ORGNCD !== this.originBranch) {
          return false;
        }
      }
      if (this.destinationBranch && this.destinationBranch !== 'All') {
        if (lr.DESTCD !== this.destinationBranch) {
          return false;
        }
      }
      if (this.customerType && this.customerType !== 'All') {
        if (lr.CustType !== this.customerType) {
          return false;
        }
      }
      return true;
    });
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
    this.originBranch = 'All';
    this.destinationBranch = 'All';
    this.customerType = 'All';
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


