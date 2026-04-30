import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { NgSelectModule } from "@ng-select/ng-select";
import { AddPfmPopupComponent } from './add-pfm-popup/add-pfm-popup.component';
import { PFMNumberGeneratedComponent } from './pfm-number-generated/pfm-number-generated.component';
import { ForwardPFMComponent } from "./forward-pfm/forward-pfm.component";
import { AcknowledgePFMComponent } from "./acknowledge-pfm/acknowledge-pfm.component";
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { ViewPfmComponent } from './view-pfm/view-pfm.component';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { EditForwardedPFMComponent } from './edit-forwarded-pfm/edit-forwarded-pfm.component';
import { ExportService } from 'app/shared/services/export.service';
import { MenuAccessService } from 'app/shared/services/menu-access.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-pfm-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, AddPfmPopupComponent, PFMNumberGeneratedComponent, BsDatepickerModule, ForwardPFMComponent, AcknowledgePFMComponent, ViewPfmComponent, PaginationComponent, EditForwardedPFMComponent],
  templateUrl: './pfm-list.component.html',
  styleUrl: './pfm-list.component.scss',
  providers: [PFMapiService]
})
export class PFMListComponent implements OnInit, OnDestroy {
  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();
  @ViewChild('AddPfmPopupComponent') AddPfmPopupComponent!: AddPfmPopupComponent;
  @ViewChild('PFMNumberGeneratedComponent') PFMNumberGeneratedComponent!: PFMNumberGeneratedComponent;
  @ViewChild('ForwardPFMComponent') ForwardPFMComponent!: ForwardPFMComponent;
  @ViewChild('AcknowledgePFMComponent') AcknowledgePFMComponent!: AcknowledgePFMComponent;
  @ViewChild('ViewPfmComponent') ViewPfmComponent!: ViewPfmComponent;
  @ViewChild('EditForwardedPFMComponent') EditForwardedPFMComponent!: EditForwardedPFMComponent;

  public rows: any[] = [];
  public filteredRows: any[] = [];
  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;
  public searchKeyword: string = '';
  public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    statusFilter: 'All',
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1
  };

  public summaryData = {
    total_LRs: 0,
    pending: 0,
    generated: 0,
    forwarded: 0,
    acknowledged: 0
  };

  private cachedSummary: any = null;

  statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Pending', label: 'Pending', color: 'pending', bg: 'var(--orange)', count: 0 },
    { value: 'Pending for Acknowledged', label: 'Pending for Acknowledged', color: 'pending', bg: 'var(--orange)', count: 0 },
    { value: 'Generated', label: 'Generated', color: 'generated', bg: 'var(--teal)', count: 0 },
    { value: 'Forwarded', label: 'Forwarded', color: 'forwarded', bg: 'var(--accent-hover)', count: 0 },
    { value: 'Acknowledged', label: 'Acknowledged', color: 'acknowledged', bg: 'var(--green)', count: 0 }
  ];

  statusMap: any = {
    'Pending': ['s-pending', '● Pending'],
    'Pending for Acknowledged': ['s-pending', '● Pending for Acknowledged'],
    'Generated At': ['s-generated', '◈ Generated'],
    'Forwarded': ['s-forwarded', '↗ Forwarded'],
    'Acknowledged': ['s-ack', '✓ Acknowledged'],
    'Received By': ['s-ack', '✓ Acknowledged']
  };

  constructor(public PFMapiService: PFMapiService, public docketService: DocketService, public exportService: ExportService, public menuAccessService: MenuAccessService,
     public sweetAlertService: SweetAlertService) {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

  get isHQTR(): boolean {
    return this.docketService.loginUserList?.LocationCode === 'HQTR';
  }

  get isPFMListing(): boolean {
    return this.isHQTR || (this.config.statusFilter !== 'All' && this.config.statusFilter !== 'Pending');
  }

  ngOnInit() {
    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.PODForwardingList();
    });

    this.fetchData();
    this.getUserModulePermissions();

    if (this.isHQTR) {
      this.statusList = [
        { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
        { value: 'Pending for Acknowledged', label: 'Pending for Ack.', color: 'pending', bg: 'var(--orange)', count: 0 },
        { value: 'Acknowledged', label: 'Acknowledged', color: 'acknowledged', bg: 'var(--green)', count: 0 }
      ];
    }

    // Clear cache whenever filters change except status
    this.cachedSummary = null;
  }

  getUserModulePermissions() {
    // if (this.docketService.loginUserList.menuId) {
    this.menuAccessService.loadPermissions(7637, this.docketService.loginUserList.UserId).subscribe();
    // }
  }

  fetchLRsData() {
    this.config = {
      fromDateStr: new Date(),
      toDateStr: new Date(),
      statusFilter: 'All',
      page: 1,
      pageSize: 10,
      totalRecords: 0,
      totalPages: 1
    };
    this.fetchData();
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  setPage(p: number) {
    if (this.config.page === p) return;
    this.config.page = p;
    this.PODForwardingList();
  }

  extractOrigin(fromTo: string): string {
    if (!fromTo) return '—';
    return fromTo.split(':')[0]?.trim() || '—';
  }

  extractDestination(fromTo: string): string {
    if (!fromTo) return '—';
    const parts = fromTo.split(':');
    return parts.length > 1 ? parts[1].trim() : '—';
  }

  extractBranch(loc: string): string {
    if (!loc) return '—';
    const parts = loc.split('-');
    const target = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    return target.split(':')[0].trim() || '—';
  }

  getStatusBadge(status: string) {
    if (!status) return ['s-pending', '● Unknown'];
    return this.statusMap[status] || ['s-pending', '● ' + status];
  }

  PODForwardingList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.isLoading = true;

    if (this.isHQTR) {
      // HQTR API payload
      const hqtrPayload = {
        fromdate: new Date(this.config.fromDateStr).toISOString(),
        todate: new Date(this.config.toDateStr).toISOString(),
        pageNumber: this.config.page,
        pageSize: this.config.pageSize,
        isDownload: 0,
        statusFilter: this.config.statusFilter || 'All',
        lrFilter: this.searchKeyword || null
      };

      this.listSubscription = this.PFMapiService.PFMListForHQTR(hqtrPayload).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.handleHQTRResponse(response);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error fetching HQTR PFM List', err);
          this.rows = [];
          this.filteredRows = [];
        }
      });
    } else {
      // Branch login API payload
      const branchPayload = {
        fromDate: new Date(this.config.fromDateStr).toISOString(),
        toDate: new Date(this.config.toDateStr).toISOString(),
        locCode: this.docketService.loginUserList.LocationCode,
        statusFilter: this.config.statusFilter || 'All',
        page: this.config.page,
        pageSize: this.config.pageSize,
        isDownload: 0,
        lrFilter: this.searchKeyword
      };

      this.listSubscription = this.PFMapiService.PODForwardingList(branchPayload).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.handleBranchResponse(response);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error fetching Branch PFM List', err);
          this.rows = [];
          this.filteredRows = [];
        }
      });
    }
  }

  handleHQTRResponse(response: any) {
    let items = [];
    if (response && response.data) {
      items = response.data;
      if (response.pagination) {
        this.config.totalRecords = response.pagination.totalRecords || items.length;
        this.config.totalPages = response.pagination.totalPages || 1;
        this.config.page = response.pagination.currentPage || 1;
        this.config.pageSize = response.pagination.pageSize || 10;
      } else {
        this.config.totalRecords = items.length;
        this.config.totalPages = Math.ceil(this.config.totalRecords / this.config.pageSize) || 1;
      }
    } else {
      items = [];
      this.config.totalRecords = 0;
      this.config.totalPages = 1;
    }
    items.forEach((item: any) => item.checked = false);

    this.rows = items;
    this.filteredRows = [...this.rows];

    if (response && response.summary) {
      const summary = {
        total_LRs: response.summary.total_LRs || 0,
        pending: response.summary.pending_for_Acknowledged || 0,
        generated: 0,
        forwarded: 0,
        acknowledged: response.summary.acknowledged || 0
      };

      if (this.config.statusFilter === 'All') {
        this.cachedSummary = summary;
      }
      this.summaryData = this.cachedSummary || summary;
    }
  }

  handleBranchResponse(response: any) {
    let items = [];
    if (response && response.data) {
      items = response.data;
      if (response.pagination) {
        this.config.totalRecords = response.pagination.totalRecords || items.length;
        this.config.totalPages = response.pagination.totalPages || 1;
        this.config.page = response.pagination.currentPage || 1;
        this.config.pageSize = response.pagination.pageSize || 10;
      } else {
        this.config.totalRecords = items.length;
        this.config.totalPages = Math.ceil(this.config.totalRecords / this.config.pageSize) || 1;
      }
    } else {
      items = [];
      this.config.totalRecords = 0;
      this.config.totalPages = 1;
    }
    items.forEach((item: any) => item.checked = false);

    this.rows = items;
    this.filteredRows = [...this.rows];

    if (response && response.totalData) {
      if (this.config.statusFilter === 'All') {
        this.cachedSummary = response.totalData;
      }
      this.summaryData = this.cachedSummary || response.totalData;
    }
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  downloadLRWiseCSV() {
    this.isCSVLoading = true;
    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      location: this.docketService.loginUserList.LocationCode,
      status: this.config.statusFilter || 'All',
    };
    if(this.config.statusFilter === 'Pending'){
      const branchPayload = {
        fromDate: new Date(this.config.fromDateStr).toISOString(),
        toDate: new Date(this.config.toDateStr).toISOString(),
        locCode: this.docketService.loginUserList.LocationCode,
        statusFilter: this.config.statusFilter || 'All',
        page: this.config.page,
        pageSize: this.config.pageSize,
        isDownload: 1,
      };

      this.listSubscription = this.PFMapiService.PODForwardingList(branchPayload).subscribe({
        next: (response: any) => {
          this.isCSVLoading = false;
          const csvData = this.formatLRWiseData(response.data);
          const fileName = `LR_Wise_Report`;
          this.exportService.exportToCSV(csvData, fileName);
        }
      });
    }else{
      this.PFMapiService.GetFMForwardReport(payload).subscribe({
        next: (response: any) => {
          this.isCSVLoading = false;
          this.exportService.exportToCSV(response, 'LR_Wise_List');
        }
      });
    }
  }

   formatLRWiseData(data: any[]): any[] {
    return data.map(item => ({
      'Docket No': item.dockNo || '',
      'Docket date': item.dockDt ? this.formatDate(item.dockDt) : '',
      'Delivery Location': this.extractDestination(item.orgn_Dest) || '',
      'PFM No': item.fM_No || '',
      'PFM Date': item.fM_Date ? this.formatDate(item.fM_Date) : '',
      'Status': item.displayStatus || item.fM_Status || '',
      'Since Days': item.daysSince || 0,
      'Courier Name': item.courier_Company_Name || '',
      'Courier date': item.courier_Way_Bill_Date ? this.formatDate(item.courier_Way_Bill_Date) : '',
      'PFM Generated By': item.pfM_Generated_By || '',
      'PFM Generated Date': item.fM_Date ? this.formatDate(item.fM_Date) : '',
      'PFM Forwarded BY': item.forward_By || '',
      'PFM Forward Date': item.forwardDate ? this.formatDate(item.forwardDate) : '',
      'PFM Acknowledge By': item.fM_Ack_By || '',
      'PFM Ack date': item.fM_Ack_Date ? this.formatDate(item.fM_Ack_Date) : ''
    }));
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  downloadPFMWiseCSV() {
    this.isCSVLoading = true;
    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      location: this.docketService.loginUserList.LocationCode,
      status: this.config.statusFilter || 'All',
    };
    this.PFMapiService.GetPFMReport(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        this.exportService.exportToCSV(response, 'PFM_Wise_List');
      }
    });
  }

  ngOnDestroy() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.fetchSubject.complete();
  }

  get canAddPFM(): boolean {
    const selected = this.filteredRows.filter(r => r.checked);
    return selected.length > 0 && selected.every(r => r.displayStatus === 'Pending');
  }

  get canForwardPFM(): boolean {
    const selected = this.filteredRows.filter(r => r.checked);
    return selected.length > 0 && selected.every(r => ['Generated At', 'Generated'].includes(r.displayStatus));
  }

  get canAcknowledgePFM(): boolean {
    const selected = this.filteredRows.filter(r => r.checked);
    return selected.length > 0 && selected.every(r => r.displayStatus === 'Forwarded' || r.fM_Status === 'Forwarded');
  }

  openAddPFM() {
    const selectedData = this.filteredRows.filter(r => r.checked);
    this.PFMNumberGeneratedComponent.showPopup(selectedData);
  }

  openForwardPFM() {
    const selectedData = this.filteredRows.filter(r => r.checked);
    this.ForwardPFMComponent.showPopup(selectedData);
  }

  openAcknowledgePFM() {
    const selectedData = this.filteredRows.filter(r => r.checked);
    this.AcknowledgePFMComponent.showPopup(selectedData);
  }

  openViewPFM(data: any) {
    this.ViewPfmComponent.showPopup(data);
  }

  openEditForwardedPFM(data: any) {
    this.EditForwardedPFMComponent.showPopup(data);
  }

  cancelPFM(row: any) {
    this.sweetAlertService.confirm('Are you sure you want to cancel this PFM and release all its LRs?', 'Cancel PFM').then((res) => {
      if (res.isConfirmed) {
        const payload = {
          fM_No: row.fM_No,
          cancel_By: this.docketService.loginUserList.UserId,
          cancel_Date: new Date().toISOString()
        };
        this.PFMapiService.CancelPFM(payload).subscribe({
          next: () => {
            this.sweetAlertService.success('PFM cancelled successfully!');
            this.fetchData();
          },
          error: (err) => this.sweetAlertService.error(err)
        });
      }
    });
  }

  isAllSelected(): boolean {
    const selectableRows = this.filteredRows.filter(r => r.displayStatus !== 'Acknowledged');
    if (selectableRows.length === 0) return false;
    return selectableRows.every(r => r.checked);
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.filteredRows.forEach(r => {
      if (r.displayStatus !== 'Acknowledged') {
        r.checked = isChecked;
      }
    });
  }

  onRowSelect(row: any) {
    if (['Generated At', 'Generated', 'Forwarded'].includes(row.displayStatus) && row.fM_No) {
      this.filteredRows.forEach(r => {
        if (r.fM_No === row.fM_No && r.displayStatus !== 'Acknowledged') {
          r.checked = row.checked;
        }
      });
    }
  }

}