import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgSelectModule } from "@ng-select/ng-select";
import { AddPfmPopupComponent } from './add-pfm-popup/add-pfm-popup.component';
import { PFMNumberGeneratedComponent } from './pfm-number-generated/pfm-number-generated.component';
import { ForwardPFMComponent } from "./forward-pfm/forward-pfm.component";
import { AcknowledgePFMComponent } from "./acknowledge-pfm/acknowledge-pfm.component";
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { ViewPfmComponent } from './view-pfm/view-pfm.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pfm-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, AddPfmPopupComponent, PFMNumberGeneratedComponent, ForwardPFMComponent, AcknowledgePFMComponent, ViewPfmComponent],
  templateUrl: './pfm-list.component.html',
  styleUrl: './pfm-list.component.scss',
  providers: [PFMapiService]
})
export class PFMListComponent implements OnInit, OnDestroy {
  public listSubscription?: Subscription;
  @ViewChild('AddPfmPopupComponent') AddPfmPopupComponent!: AddPfmPopupComponent;
  @ViewChild('PFMNumberGeneratedComponent') PFMNumberGeneratedComponent!: PFMNumberGeneratedComponent;
  @ViewChild('ForwardPFMComponent') ForwardPFMComponent!: ForwardPFMComponent;
  @ViewChild('AcknowledgePFMComponent') AcknowledgePFMComponent!: AcknowledgePFMComponent;
  @ViewChild('ViewPfmComponent') ViewPfmComponent!: ViewPfmComponent;

  public rows: any[] = [];
  public filteredRows: any[] = [];
  public isLoading: boolean = false;
  public config = {
    fromDateStr: '',
    toDateStr: '',
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

  constructor(public PFMapiService: PFMapiService) { }

  ngOnInit() {
    this.setDateDefaults();
    this.PODForwardingList();
  }

  setDateDefaults() {
    const today = new Date();
    this.config.toDateStr = today.toISOString().split('T')[0];

    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    this.config.fromDateStr = lastMonth.toISOString().split('T')[0];
  }

  fetchData() {
    this.config.page = 1;
    this.PODForwardingList();
  }

  setPage(p: any, event?: Event) {
    if (typeof p === 'string') return;
    if (event) event.preventDefault();
    if (p < 1 || p > this.config.totalPages) return;
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

  extractBranch(orgnDest: string): string {
    if (!orgnDest) return '—';
    return orgnDest.split('-')[0]?.split(':')[0]?.trim() || '—';
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
      locCode: null,
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
  }

  get visiblePages(): (number | string)[] {
    const total = this.config.totalPages;
    const current = this.config.page;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 4) pages.push('...');

      const start = Math.max(2, current - 2);
      const end = Math.min(total - 1, current + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 3) pages.push('...');
      pages.push(total);
    }
    return pages;
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