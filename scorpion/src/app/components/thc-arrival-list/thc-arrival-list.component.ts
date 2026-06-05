import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { environment } from 'environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ThcArrivalPopupComponent } from '../thc-arrival-popup/thc-arrival-popup.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, Subscription } from 'rxjs';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';

@Component({
  selector: 'app-thc-arrival-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, BsDatepickerModule, PaginationComponent, ThcArrivalPopupComponent],
  providers: [BsModalService],
  templateUrl: './thc-arrival-list.component.html',
  styleUrl: './thc-arrival-list.component.scss'
})
export class ThcArrivalListComponent {
  public isLoading: boolean = false;
  public env = environment;
  public THCArrivalFilterForm!: FormGroup;
  private listSubscription?: Subscription;
  public summaryData:any;
  public isdownload : boolean = false;
  @ViewChild('ThcArrivalPopupComponent') ThcArrivalPopupComponent!: ThcArrivalPopupComponent;

  public arrivalData:any;
  statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Pending For Arrival', label: 'Pending For Arrival', color: 'pending-for-arrival', bg: 'var(--teal)', count: 0 },
    { value: 'Arrival Completed', label: 'Arrival Completed', color: 'arrival-completed', bg: 'var(--orange)', count: 0 },
    { value: 'HCC Generated', label: 'HCC Generated', color: 'hcc-generated', bg: 'var(--green)', count: 0 },
  ];
  public pagination = {
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  };

  constructor(
    private fb: FormBuilder,
    public PRSDRSApiService:PRSDRSApiService,
    private docketService:DocketService,
    private exportService:ExportService
  ) { }

  ngOnInit() {
    this.buildFilterForm()
    this.fetchData()
  }

  buildFilterForm() {
    this.THCArrivalFilterForm = this.fb.group({
      fromDate: [new Date()],
      toDate: [new Date()],
      statusFilter: ['All'],
      searchText: ['']
    });

    this.THCArrivalFilterForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.fetchData();
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending for Arrival': return 's-gen';
      case 'Arrival Completed': return 's-billed';
      case 'HCC Generated': return 's-hcc';
      default: return '';
    }
  }

  openUnloadingSheet(unloadingSheetNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/UnLoadingSheet_ViewPrint?LSNo=${unloadingSheetNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  fetchData() {
    this.pagination.page = 1;
    this.getTHCArrivalDetail();
  }

  onDataUpdate() {
    this.apiCache.clear();
    this.fetchData();
  }

  private apiCache = new Map<string, any>();

   formatDate(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getTHCArrivalDetail() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    const payload = {
      brcd: this.docketService.loginUserList.LocationCode,
      fromDate: this.formatDate(this.THCArrivalFilterForm.value.fromDate),
      toDate: this.formatDate(this.THCArrivalFilterForm.value.toDate),
      searchText: this.THCArrivalFilterForm.value.searchText,
      statusFilter: this.THCArrivalFilterForm.value.statusFilter,
      pageNumber: this.pagination.page,
      pageSize: this.pagination.pageSize,
      isDownload: false
    };

    const cacheKey = JSON.stringify(payload);
    if (this.apiCache.has(cacheKey)) {
      this.handleApiResponse(this.apiCache.get(cacheKey));
      return;
    }

    this.isLoading = true;
    this.listSubscription = this.PRSDRSApiService.getTHCArrivalList(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.apiCache.set(cacheKey, response);
        this.handleApiResponse(response);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  private handleApiResponse(response: any) {
    if (response) {
      this.arrivalData = response.thcList;
      this.pagination.totalRecords = response.pagination.totalRecords;
      this.pagination.totalPages = response.pagination.totalPages;
      this.summaryData = response.summary;
    }
  }


  setPage(p: number) {
    if (this.pagination.page === p) return;
    this.pagination.page = p;
    this.getTHCArrivalDetail();
  }

  filterByStatus(status: string) {
    this.THCArrivalFilterForm.patchValue({ statusFilter: status }, { emitEvent: false });
    this.fetchData();
  }

  refreshFilter() {
    this.buildFilterForm();
    this.fetchData()
  }

  downloadExcel() {
    this.isdownload = true;
    const payload={
      brcd:'PIM',
      fromDate: this.formatDate(this.THCArrivalFilterForm.value.fromDate),
      toDate: this.formatDate(this.THCArrivalFilterForm.value.toDate),
      searchText: this.THCArrivalFilterForm.value.searchText,
      statusFilter: this.THCArrivalFilterForm.value.statusFilter,
      pageNumber: this.pagination.page,
      pageSize:this.pagination.pageSize,
      isDownload: true
    }
    this.listSubscription = this.PRSDRSApiService.getTHCArrivalList(payload).subscribe({
      next: (response: any) => {
        this.isdownload = false;
        if (response) {
          this.exportService.exportToExcel(response.thcList, `THCArrival_Export`);
        }
      },
      error: (err: any) => {
        this.isdownload = false;
        console.error('Error downloading Excel', err);
      }
    });
  }

    openMFView(MFNO: string) {
    const url = `${this.env.liveUrl}ViewPrint/Menifest_ViewPrint?MFNO=${MFNO}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

  openHCCModal(hccNo: string) {
    const url = `${this.env.liveUrl}Tracking/TripAllView?LsNO=${hccNo}&VPType=LoadingUnloading&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

  openThcView(thcNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/ChallanView?ChallanNo=${thcNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

   openThcArrival(data: any) {
    this.ThcArrivalPopupComponent.showPopup(data);
  }
}
