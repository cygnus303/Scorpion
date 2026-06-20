import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-lr-track-trace-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BsDatepickerModule, PaginationComponent, NgSelectModule],
  templateUrl: './lr-track-trace-list.component.html',
  styleUrl: './lr-track-trace-list.component.scss'
})
export class LrTrackTraceListComponent implements OnInit {
  public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    statusFilter: 'All',
    page: 1,
    pageSize: 6,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

  public statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Booked', value: 'Booked' },
    { label: 'In Transit', value: 'In Transit' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Exceptions', value: 'Exceptions' }
  ];

  get totalLRsCount() { return this.allLRs.length; }
  get bookedCount() { return this.allLRs.filter(lr => lr.status === 'Booked').length; }
  get transitCount() { return this.allLRs.filter(lr => lr.status === 'In Transit').length; }
  get deliveredCount() { return this.allLRs.filter(lr => lr.status === 'Delivered').length; }
  get exceptionsCount() { return this.allLRs.filter(lr => lr.status === 'Exceptions').length; }

  public originBranch: string = 'All';
  public destinationBranch: string = 'All';
  public customerType: string = 'All';

  public allLRs = [
    {
      lrNumber: 'LR-2604-00841',
      lrDate: '13 Apr 2026',
      lrTime: '09:14 AM',
      edd: '17 Apr 2026',
      add: null,
      addStatus: null,
      status: 'In Transit',
      origin: 'BOM',
      dest: 'DEL',
      fromCity: 'Mumbai',
      toCity: 'New Delhi',
      payBasis: 'PAID',
      mode: 'Road',
      service: 'LTL',
      custType: 'Corporate',
      customerName: 'Reliance Ind. Ltd',
      hasMap: true
    },
    {
      lrNumber: 'LR-2604-00842',
      lrDate: '11 Apr 2026',
      lrTime: '09:45 AM',
      edd: '14 Apr 2026',
      add: '13 Apr 2026',
      addStatus: 'Early',
      status: 'Delivered',
      origin: 'MAA',
      dest: 'BLR',
      fromCity: 'Chennai',
      toCity: 'Bangalore',
      payBasis: 'TOPAY',
      mode: 'Air',
      service: 'FTL',
      custType: 'Group',
      customerName: 'TVS Motors',
      hasMap: false
    },
    {
      lrNumber: 'LR-2604-00843',
      lrDate: '15 Apr 2026',
      lrTime: '10:02 AM',
      edd: '15 Apr 2026',
      add: null,
      addStatus: null,
      status: 'In Transit',
      origin: 'HYD',
      dest: 'PNQ',
      fromCity: 'Hyderabad',
      toCity: 'Pune',
      payBasis: 'TBB',
      mode: 'Cold Chain',
      service: 'LTL',
      custType: 'ILS',
      customerName: 'Biocon Ltd',
      hasMap: true
    },
    {
      lrNumber: 'LR-2604-00844',
      lrDate: '13 Apr 2026',
      lrTime: '10:30 AM',
      edd: '16 Apr 2026',
      add: null,
      addStatus: null,
      status: 'Booked',
      origin: 'DEL',
      dest: 'AMD',
      fromCity: 'Delhi',
      toCity: 'Ahmedabad',
      payBasis: 'PAID',
      mode: 'Road',
      service: 'FTL',
      custType: 'Non-Corp',
      customerName: 'Rajan Traders',
      hasMap: false
    },
    {
      lrNumber: 'LR-2604-00845',
      lrDate: '13 Apr 2026',
      lrTime: '11:15 AM',
      edd: 'Delayed',
      add: null,
      addStatus: null,
      status: 'Exceptions',
      origin: 'BLR',
      dest: 'CCU',
      fromCity: 'Bangalore',
      toCity: 'Kolkata',
      payBasis: 'TOPAY',
      mode: 'Sample',
      service: 'LTL',
      custType: 'Aggregators',
      customerName: 'Dunzo Supply Co',
      hasMap: true
    },
    {
      lrNumber: 'LR-2604-00846',
      lrDate: '15 Apr 2026',
      lrTime: '11:50 AM',
      edd: '12 Apr 2026',
      add: '12 Apr 2026',
      addStatus: 'On Time',
      status: 'Delivered',
      origin: 'PNQ',
      dest: 'BOM',
      fromCity: 'Pune',
      toCity: 'Mumbai',
      payBasis: 'PAID',
      mode: 'Road',
      service: 'LTL',
      custType: 'Corporate',
      customerName: 'Tata Steel Ltd',
      hasMap: false
    }
  ];

  public filteredLRs: any[] = [];

  get pagedLRs(): any[] {
    const startIndex = (this.config.page - 1) * this.config.pageSize;
    const endIndex = startIndex + this.config.pageSize;
    return this.filteredLRs.slice(startIndex, endIndex);
  }

  ngOnInit() {
    this.searchLRs();
  }

  public parseDate(dateStr: string): Date {
    return dateStr ? new Date(dateStr) : new Date();
  }

  public searchLRs() {
    this.filteredLRs = this.allLRs.filter(lr => {
      // Search Text
      if (this.config.searchText) {
        const srch = this.config.searchText.toLowerCase();
        if (!lr.lrNumber.toLowerCase().includes(srch) && !lr.customerName.toLowerCase().includes(srch)) {
          return false;
        }
      }
      // Status
      if (this.config.statusFilter && this.config.statusFilter !== 'All') {
        if (lr.status !== this.config.statusFilter) {
          return false;
        }
      }
      // Origin
      if (this.originBranch && this.originBranch !== 'All') {
        if (lr.origin !== this.originBranch) {
          return false;
        }
      }
      // Destination
      if (this.destinationBranch && this.destinationBranch !== 'All') {
        if (lr.dest !== this.destinationBranch) {
          return false;
        }
      }
      // Customer Type
      if (this.customerType && this.customerType !== 'All') {
        if (lr.custType !== this.customerType) {
          return false;
        }
      }
      return true;
    });

    this.config.totalRecords = this.filteredLRs.length;
    this.config.totalPages = Math.ceil(this.filteredLRs.length / this.config.pageSize) || 1;
  }

  public filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.config.page = 1;
    this.searchLRs();
  }

  public resetFilters() {
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

  public setPage(page: number) {
    this.config.page = page;
  }
}


