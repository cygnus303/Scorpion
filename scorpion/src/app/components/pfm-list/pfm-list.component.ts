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
  public config = {
    fromDateStr: new Date(new Date().setDate(new Date().getDate() - 7)),
    toDateStr: new Date(),
    statusFilter: 'All',
    page: 1,
    pageSize: 15,
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

  statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Pending', label: 'Pending', color: 'pending', bg: 'var(--orange)', count: 0 },
    { value: 'Generated At', label: 'Generated', color: 'generated', bg: 'var(--teal)', count: 0 },
    { value: 'Forwarded', label: 'Forwarded', color: 'forwarded', bg: 'var(--accent-hover)', count: 0 },
    { value: 'Acknowledged', label: 'Acknowledged', color: 'acknowledged', bg: 'var(--green)', count: 0 }
  ];

  statusMap: any = {
    'Pending': ['s-pending', '● Pending'],
    'Generated At': ['s-generated', '◈ Generated'],
    'Forwarded': ['s-forwarded', '↗ Forwarded'],
    'Acknowledged': ['s-ack', '✓ Acknowledged'],
    'Received By': ['s-ack', '✓ Acknowledged']
  };

  constructor(public PFMapiService: PFMapiService, public docketService: DocketService) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM';
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }

    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.PODForwardingList();
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
    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: this.docketService.loginUserList.LocationCode,
      statusFilter: this.config.statusFilter || 'All',
      page: this.config.page,
      pageSize: this.config.pageSize
    };

    this.listSubscription = this.PFMapiService.PODForwardingList(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        let items = [];
        if (response && response.data) {
          items = response.data;
          if (response.pagination) {
            this.config.totalRecords = response.pagination.totalRecords || items.length;
            this.config.totalPages = response.pagination.totalPages || 1;
            this.config.page = response.pagination.currentPage || 1;
            this.config.pageSize = response.pagination.pageSize || 15;
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
          this.summaryData = response.totalData;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching PFM List', err);
        this.rows = [];
        this.filteredRows = [];
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
    return selected.length > 0 && selected.every(r => r.displayStatus === 'Forwarded');
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

  openViewPFM() {
    const selectedData = this.filteredRows.filter(r => r.checked);
    this.ViewPfmComponent.showPopup(selectedData);
  }

  openEditForwardedPFM(data: any) {
    this.EditForwardedPFMComponent.showPopup(data);
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
    if (['Generated At', 'Generated', 'Forwarded'].includes(row.displayStatus) && row.fM_No && row.checked) {
      this.filteredRows.forEach(r => {
        if (r.fM_No === row.fM_No && r.displayStatus !== 'Acknowledged') {
          r.checked = true;
        }
      });
    }
  }
}