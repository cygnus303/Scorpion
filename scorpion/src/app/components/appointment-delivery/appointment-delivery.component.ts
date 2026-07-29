import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import {Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { debounceTime } from 'rxjs/operators';
import { CommonService } from '../../shared/services/common.service';
import { ExportService } from '../../shared/services/export.service';
import { AppointmentDeliveryService } from 'app/shared/services/appointment-delivery.service';
import { DocketService } from 'app/shared/services/docket.service';
import { AddAppointment } from './add-appointment/add-appointment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RescheduleAppointment } from './reschedule-appointment/reschedule-appointment';
import { ViewAppointment } from './view-appointment/view-appointment';

@Component({
  selector: 'app-appointment-delivery',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NgSelectModule, 
    BsDatepickerModule, 
    PaginationComponent,AddAppointment,RescheduleAppointment,ViewAppointment
  ],
  templateUrl: './appointment-delivery.component.html',
  styleUrl: './appointment-delivery.component.scss',
  providers:[BsModalService],
})
export class AppointmentDeliveryComponent implements OnInit, OnDestroy {
  public activeTab: 'APMT' | 'CSD' | 'MSD' = 'APMT';
  public appointments: any[] = [];
  public summaryCounts: any = {};
  public totalItems: number = 0;
  public isLoading: boolean = false;
  public isExportLoading: boolean = false;
  @ViewChild('addAppointmentModal') addAppointmentModal!: AddAppointment;
  @ViewChild('rescheduleModal') rescheduleModal!: RescheduleAppointment;
  @ViewChild('viewAppointmentModal') viewAppointmentModal!: ViewAppointment;
  private appointmentDeliveryService = inject(AppointmentDeliveryService);
  public commonService = inject(CommonService);
  private exportService = inject(ExportService);
  public docketService = inject(DocketService);
  public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    searchText: ''
  };
  private appointmentSubscription?: Subscription;
  public pagination = {
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  };
  
  formatListDate(d: string): string {
    if (!d || !d.includes('-')) return d || '-';
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.substring(0, 2)} ${m[+d.substring(3, 5) - 1]} ${d.substring(6, 10)}`;
  }

  ngOnInit(): void {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }

    this.fetchData();
  }



  setTab(tab: 'APMT' | 'CSD' | 'MSD') {
    this.activeTab = tab;
    this.pagination.page = 1;
    this.fetchData();
  }

  setPage(event: any) {
    this.pagination.page = event;
    this.fetchData();
  }

  ngOnDestroy(): void {
    if (this.appointmentSubscription) { this.appointmentSubscription.unsubscribe(); }
  }

  formatToISODate(dateStr: string | Date): string {
    if (!dateStr) return new Date().toISOString();
    if (dateStr instanceof Date) return dateStr.toISOString();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const date = new Date(Date.UTC(+parts[2], +parts[1] - 1, +parts[0]));
      return date.toISOString();
    }
    return new Date(dateStr).toISOString();
  }

  fetchData() {
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
    
    const payload = {
      type: this.activeTab,
      formDate: this.formatToISODate(this.config.fromDateStr),
      toDate: this.formatToISODate(this.config.toDateStr),
      searchText: this.config.searchText || '',
      userId: this.docketService.loginUserList.UserId.toString(),
      pageno: this.pagination.page,
      pageSize: this.pagination.pageSize
    };

    this.isLoading = true;

    this.appointmentSubscription = this.appointmentDeliveryService.getDeliveryAppointmentData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.success && response.data) {
          if (response.data.summary) {
            this.summaryCounts = response.data.summary;
          }
          if (response.data.pagination) {
            this.pagination.totalRecords = response.data.pagination.totalRecords || 0;
            this.pagination.totalPages = Math.ceil(this.pagination.totalRecords / this.pagination.pageSize);
            this.totalItems = this.pagination.totalRecords;
          }
          if (response.data.data && Array.isArray(response.data.data)) {
            this.appointments = response.data.data || [];
          } else {
            this.appointments = [];
          }
        } else {
          this.appointments = [];
          this.totalItems = 0;
          this.pagination.totalRecords = 0;
          this.pagination.totalPages = 0;
          if (response && Array.isArray(response.data)) {
            this.appointments = response.data;
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.appointments = [];
        this.totalItems = 0;
        this.pagination.totalRecords = 0;
        this.pagination.totalPages = 0;
        this.summaryCounts = {};
        console.error('Error fetching delivery appointment data:', err);
      }
    });
  }

  exportToExcel() {
    const payload = {
      type: this.activeTab,
      formDate: this.formatToISODate(this.config.fromDateStr),
      toDate: this.formatToISODate(this.config.toDateStr),
      searchText: this.config.searchText || '',
      userId: this.docketService.loginUserList.UserId.toString(),
      pageno: this.pagination.page,
      pageSize: this.pagination.pageSize
    };

    this.isExportLoading = true;
    this.appointmentDeliveryService.getDeliveryAppointmentDataExcel(payload).subscribe({
      next: (response: any) => {
        this.isExportLoading = false;
        if (response && response.success && response.data) {
          this.exportService.exportToExcel(response.data);
        }
      },
      error: (err: any) => {
        this.isExportLoading = false;
        console.error('Error exporting delivery appointment data:', err);
      }
    });
  }

  openAddModal() {
    this.addAppointmentModal.openModal(this.activeTab);
  }

  openViewModal(data: any) {
    this.viewAppointmentModal.openModal(this.activeTab, data);
  }

  openRescheduleModal(data: any) {
    this.rescheduleModal.openModal(this.activeTab, data);
  }

  // openUpdateModal(data: any) {
  //   this.updateModal.openModal(this.activeTab, data);
  // }

  formatDate(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    const parts = dateTimeStr.split(' ');
    return parts[0] || '';
  }

  formatTime(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    const parts = dateTimeStr.split(' ');
    if (parts.length >= 2) {
      return parts.slice(1).join(' ').replace(/\s*[–—-]\s*/g, ' — ');
    }
    return '';
  }

  splitOrgDest(orgDest: string): { org: string; dest: string } {
    if (!orgDest) return { org: '', dest: '' };
    const parts = orgDest.split(/\s*→\s*|\s*->\s*/);
    return {
      org: parts[0] || orgDest,
      dest: parts[1] || ''
    };
  }
}
