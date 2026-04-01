import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-drs-generation-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, ReactiveFormsModule],
  templateUrl: './drs-generation-list.component.html',
  styleUrl: './drs-generation-list.component.scss'
})
export class DrsGenerationListComponent {
  public DRSFilterForm !:FormGroup;
  public pagination={
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  };
  public DRSData:any[]=[];
  public isLoading: boolean = false;
  private listSubscription?: Subscription;
  public summaryData:any;
  public isdownload: boolean = false;


  statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Generated', label: 'Generated', color: 'generated', bg: 'var(--teal)', count: 0 },
    { value: 'Updated', label: 'Updated', color: 'updated', bg: 'var(--orange)', count: 0 },
    { value: 'Billed', label: 'Billed', color: 'billed', bg: 'var(--accent-hover)', count: 0 },
    { value: 'Cancelled', label: 'Cancelled', color: 'cancelled', bg: 'var(--red)', count: 0 },
    { value: 'HCC Generated', label: 'HCC Generated', color: 'hcc-generated', bg: 'var(--green)', count: 0 },

  ];

  odaTypeList = [
    { value: '', label: 'All' },
    { value: 'ODA', label: 'ODA' },
    { value: 'Non ODA', label: 'Non ODA' }
  ];

  // public DRSData = [
  //     {
  //       DRSNo: 'DRS/2526/00101',
  //       date: '21-Mar-26',
  //       ODAType: 'ODA',
  //       totalDockets:22,
  //       DeliveryDocket:38,
  //       vendorType: 'Transporter',
  //       vendorName: 'Fast Freight Carriers',
  //       vendorBillNo: '—',
  //       loadingHccNo: 'NO HCC',
  //       unloadingHccNo: 'NO HCC',
  //       status: 'Generated',
  //       vendorClass: 'v-purple'
  //     },
  //     {
  //       DRSNo: 'DRS/2526/00102',
  //       date: '21-Mar-26',
  //       ODAType: 'ODA',
  //       totalDockets:22,
  //       DeliveryDocket:38,
  //       vendorType: 'Agent',
  //       vendorName: 'Blue Dart Express',
  //       vendorBillNo: 'VB/2526/00202',
  //       loadingHccNo: 'NO HCC',
  //       unloadingHccNo: 'NO HCC',
  //       status: 'Billed',
  //       vendorClass: 'v-blue'
  //     },
  //     {
  //       DRSNo: 'DRS/2526/00103',
  //       date: '21-Mar-26',
  //       ODAType: 'Non ODA',
  //       totalDockets:22,
  //       DeliveryDocket:38,
  //       vendorType: 'Own Vehicle',
  //       vendorName: 'Mahindra Logistics',
  //       vendorBillNo: '—',
  //       loadingHccNo: 'NO HCC',
  //       unloadingHccNo: 'NO HCC',
  //       status: 'Generated',
  //       vendorClass: 'v-pink'
  //     },
  //     {
  //       DRSNo: 'DRS/2526/00104',
  //       date: '21-Mar-26',
  //       ODAType: 'Non ODA',
  //       totalDockets:22,
  //       DeliveryDocket:38,
  //       vendorType: 'Transporter',
  //       vendorName: 'Gati Kintetsu Express',
  //       vendorBillNo: 'VB/2526/00204',
  //       loadingHccNo: 'HCC/2526/00441',
  //       unloadingHccNo: 'HCC/2526/00451',
  //       status: 'HCC Generated',
  //       vendorClass: 'v-purple'
  //     },
  //     {
  //       DRSNo: 'DRS/2526/00105',
  //       date: '21-Mar-26',
  //       ODAType: 'ODA',
  //       totalDockets:22,
  //       DeliveryDocket:38,
  //       vendorType: 'Agent',
  //       vendorName: 'DTDC Courier',
  //       vendorBillNo: '—',
  //       loadingHccNo: 'NO HCC',
  //       unloadingHccNo: 'NO HCC',
  //       status: 'Cancelled',
  //       vendorClass: 'v-blue'
  //     },
  //     {
  //       DRSNo: 'DRS/2526/00106',
  //       date: '21-Mar-26',
  //       ODAType: 'Non ODA',
  //       totalDockets:22,
  //       DeliveryDocket:38,
  //       vendorType: 'Transporter',
  //       vendorName: 'TCI Express Ltd.',
  //       vendorBillNo: 'VB/2526/00206',
  //       loadingHccNo: 'NO HCC',
  //       unloadingHccNo: 'NO HCC',
  //       status: 'Billed',
  //       vendorClass: 'v-purple'
  //     },
  //     {
  //       DRSNo: 'DRS/2526/00107',
  //       date: '21-Mar-26',
  //       ODAType: 'ODA',
  //       totalDockets:22,
  //       DeliveryDocket:38,
  //       vendorType: 'Agent',
  //       vendorName: 'Xpressbees Logistics',
  //       vendorBillNo: 'VB/2526/00207',
  //       loadingHccNo: 'HCC/2526/00442',
  //       unloadingHccNo: 'HCC/2526/00452',
  //       status: 'HCC Generated',
  //       vendorClass: 'v-blue'
  //     },
  //     {
  //       DRSNo: 'DRS/2526/00108',
  //       date: '21-Mar-26',
  //       ODAType: 'Non ODA',
  //       totalDockets:22,
  //       DeliveryDocket:38,
  //       vendorType: 'Own Vehicle',
  //       vendorName: 'SpotOn Logistics',
  //       vendorBillNo: '—',
  //       loadingHccNo: 'NO HCC',
  //       unloadingHccNo: 'NO HCC',
  //       status: 'Cancelled',
  //       vendorClass: 'v-pink'
  //     }
  // ];

  constructor(
    private prsdrsApiService: PRSDRSApiService,
    private fb: FormBuilder,
    private exportService: ExportService,
    private dockerService: DocketService
  ) { }

  ngOnInit() {
    this.buildFilterForm();
    this.fetchData();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Generated': return 's-gen';
      case 'Billed': return 's-billed';
      case 'HCC Generated': return 's-hcc';
      case 'Cancelled': return 's-canc';
      default: return '';
    }
  }

  getODAClass(status: string): string {
    switch (status) {
      case 'ODA': return 's-gen';
      case 'Non ODA': return 's-hcc';
      default: return '';
    }
  }

  buildFilterForm(){
    this.DRSFilterForm = this.fb.group({
      fromDate: [new Date(new Date().setDate(new Date().getDate() - 7))],
      toDate: [new Date()],
      statusFilter: ['All'],
      odaType: [''],
      searchText: ['']
    });

    this.DRSFilterForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.fetchData();
    });
  }

  filterByStatus(status: string) {
    this.DRSFilterForm.patchValue({ statusFilter: status },{ emitEvent: false });
    this.fetchData();
  }

  fetchData() {
  this.pagination.page = 1;
  this.getDRSdetail();
  }

  refreshFilter(){
this.buildFilterForm();
this.fetchData()
  }

  setPage(p: number) {
    if (this.pagination.page === p) return;
    this.pagination.page = p;
    this.getDRSdetail();
  }

  onFilterChange() {
    this.pagination.page = 1;
    this.getDRSdetail();
  }

  formatDate(date: any): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

  getDRSdetail(){
     if (this.listSubscription) {
    this.listSubscription.unsubscribe(); // 🔥 cancel previous API
  }
    const payload={
      "fromDate":  this.formatDate(this.DRSFilterForm.value.fromDate),
      "toDate": this.formatDate(this.DRSFilterForm.value.toDate),
      "locCode":null,
      "statusFilter": this.DRSFilterForm.value.statusFilter,
      "pageNumber": this.pagination.page,
      "pageSize": this.pagination.pageSize,
      "isDownload":false,
      "odaType": this.DRSFilterForm.value.odaType,
      "searchText": this.DRSFilterForm.value.searchText
}
    this.isLoading = true;

    this.listSubscription = this.prsdrsApiService.getDRSList(payload).subscribe({
    next: (response: any) => {
      this.DRSData = response.data;
      this.pagination.totalRecords = response.pagination.totalRecords;
      this.pagination.totalPages = response.pagination.totalPages;
      this.summaryData=response.summary;
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
    }
  });
  }

    downloadList() {
    this.isdownload = true;
    const payload = {
      "fromDate":  this.formatDate(this.DRSFilterForm.value.fromDate),
      "toDate": this.formatDate(this.DRSFilterForm.value.toDate),
      "locCode":null,
      "statusFilter": this.DRSFilterForm.value.statusFilter,
      "pageNumber": this.pagination.page,
      "pageSize": this.pagination.pageSize,
      "isDownload":true,
      "odaType": this.DRSFilterForm.value.odaType,
      "searchText": this.DRSFilterForm.value.searchText
    };
    this.listSubscription = this.prsdrsApiService.getDRSList(payload).subscribe({
      next: (response: any) => {
        this.isdownload= false;
        if (response && response.data) {
          this.exportService.exportToExcel(response.data, `DRS_Export`);
        }
      },
      error: (err: any) => {
        this.isdownload= false;
        console.error('Error downloading Excel', err);
      }
    });
  }
}
