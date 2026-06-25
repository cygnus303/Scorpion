import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subscription } from 'rxjs';
import { ThcEditComponent } from '../thc-edit/thc-edit.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { ExportService } from 'app/shared/services/export.service';
import { environment } from 'environments/environment';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';


@Component({
  selector: 'app-thc-list',
  standalone: true,
  imports: [NgSelectModule,CommonModule,ReactiveFormsModule,BsDatepickerModule,PaginationComponent,ThcEditComponent],
  providers: [BsModalService],
  templateUrl: './thc-list.component.html',
  styleUrl: './thc-list.component.scss'
})
export class ThcListComponent {
  public isLoading: boolean = false;
  public summaryData:any;
  public THCFilterForm !:FormGroup;
  private listSubscription?: Subscription;
  public isdownload:boolean=false;
  public env = environment;
  @ViewChild('ThcEditComponent') ThcEditComponent!: ThcEditComponent;
  
  public pagination={
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  };
  statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Departed', label: 'Departed', color: 'departed', bg: 'var(--teal)', count: 0 },
    { value: 'Completed Journey', label: 'Completed Journey', color: 'completed-journey', bg: 'var(--orange)', count: 0 },
    { value: 'Cancelled', label: 'Cancelled', color: 'cancelled', bg: 'var(--red)', count: 0 },
    { value: 'Billed', label: 'Billed', color: 'billed', bg: 'var(--accent-hover)', count: 0 },
  ];
  public thcData:any;

    constructor(private fb: FormBuilder,private docketService:DocketService,private router: Router,
      public PRSDRSApiService:PRSDRSApiService,private exportService:ExportService,private sweetAlertService: SweetAlertService) { }
  

    ngOnInit() {
      const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
      this.buildFilterForm();
      this.fetchData()
    }
    
  
    buildFilterForm() {
      this.THCFilterForm = this.fb.group({
        fromDate: [new Date()],
        toDate: [new Date()],
        statusFilter: ['All'],
        searchText: ['']
      });
  
      this.THCFilterForm.valueChanges.pipe(
        debounceTime(300)
      ).subscribe(() => {
        this.fetchData()
      });
    }

  fetchData() {
    this.pagination.page = 1;
    this.getTHCDetail();
  }

getStatusClass(status: string): string {
  switch (status) {
    case 'Billed':
      return 's-billed';   // yellow

    case 'Completed Journey':
      return 's-hcc'; // green/teal

    case 'Departed':
      return 's-gen'; // blue/orange

    case 'Cancelled':
      return 's-canc'; // red

    default:
      return '';
  }
  }

    openTHC() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '1';
      this.docketService.loginUserList = user;
      localStorage.setItem("loginUserList", JSON.stringify(user));
    }
    this.router.navigate(['Operation/ChallanList'], { queryParams: { fromPRS: 'true' } });
  }

    openEditPopup(data: any) {
    this.ThcEditComponent.showPopup(data);
  }

   formatDate(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

    getTHCDetail() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    const payload={
      locCode:this.docketService.loginUserList.LocationCode || null,
      fromDate: this.formatDate(this.THCFilterForm.value.fromDate),
      toDate: this.formatDate(this.THCFilterForm.value.toDate),
      searchText: this.THCFilterForm.value.searchText,
      statusFilter: this.THCFilterForm.value.statusFilter,
      pageNumber: this.pagination.page,
      pageSize:this.pagination.pageSize,
      isDownload: false
    }
     this.isLoading = true;
    this.listSubscription = this.PRSDRSApiService.getTHCList(payload).subscribe({
      next : (response:any)=>{
        if(response){
          this.thcData= response.data;
           this.pagination.totalRecords = response.pagination.totalRecords;
          this.pagination.totalPages = response.pagination.totalPages;
          this.summaryData = response.summary;
          this.isLoading = false;
        }
      }, error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    })
  }
    refreshFilter() {
    this.buildFilterForm();
    this.fetchData()
  }

    downloadExcel() {
    this.isdownload = true;
    const payload={
      brcd:'PIM',
      fromDate: this.formatDate(this.THCFilterForm.value.fromDate),
      toDate: this.formatDate(this.THCFilterForm.value.toDate),
      searchText: this.THCFilterForm.value.searchText,
      statusFilter: this.THCFilterForm.value.statusFilter,
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

   filterByStatus(status: string) {
    this.THCFilterForm.patchValue({ statusFilter: status }, { emitEvent: false });
    this.fetchData();
  }

  openMFView(MFNO: string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewMF?MFNO=${MFNO}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

  onView(data:any){
     const url = `${this.env.liveUrl}ViewPrint/ViewChallan?DocumentNo=${data?.thcNo}&src=angular`;
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
    const url = `${this.env.liveUrl}ViewPrint/ViewChallan?DocumentNo=${thcNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

    onCancel(thcNo: string) {
    this.sweetAlertService.cancel(`Are You Sure You Want to Cancel ${thcNo}?`, () => {
      this.onCancelTHC(thcNo);
    });
  }

  onCancelTHC(thcNo:any){
    const payload={
      thcno:thcNo,
      userName:this.docketService.baseUsername
    }
    this.PRSDRSApiService.CancelTHC(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.sweetAlertService.success(`THC ${thcNo} has been cancelled successfully.`);
          this.fetchData();
        }
      },
      error: (err: any) => {
        console.error('Error cancelling THC', err);
      }
    });
  }

  setPage(p: number) {
    if (this.pagination.page === p) return;
    this.pagination.page = p;
    this.getTHCDetail();
  }
}
