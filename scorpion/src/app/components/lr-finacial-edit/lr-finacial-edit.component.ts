import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import { LrService } from 'app/shared/services/lr.service';
import { MenuAccessService } from 'app/shared/services/menu-access.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { environment } from 'environments/environment';
import { LrViewComponent } from '../lr-list/lr-view/lr-view.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DateRangePickerComponent } from 'app/shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-lr-finacial-edit',
  standalone: true,
  imports: [CommonModule,PaginationComponent,FormsModule,LrViewComponent,NgSelectModule, BsDatepickerModule, DateRangePickerComponent],
  templateUrl: './lr-finacial-edit.component.html',
  styleUrl: './lr-finacial-edit.component.scss'
})
export class LrFinacialEditComponent {
public isCSVLoading:boolean=false;
public LREditList:any[]=[];
public isLoading:boolean=false;
public env=environment;
public summaryData: any;
private fetchSubject = new Subject<void>();
public listSubscription?: Subscription;
  
  @ViewChild('LrViewComponent') LrViewComponent!: LrViewComponent;
 public statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending for Quick Completion', value: 'pendingforQuickCompletion' },
    { label: 'At Booking Stock', value: 'booking' },
    { label: 'In Transit', value: 'inTransit' },
    { label: 'At Delivery Stock', value: 'delivered' }
  ];
  public billedList=[
     { label: 'All', value: 'All' },
    { label: 'Billed', value: 'Billed' },
    { label: 'Unbilled', value: 'UnBilled' }
  ]

public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    statusFilter: 'All',
    isBilledFilter:'All',
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
};

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'pendingforQuickCompletion': 'chip-pending',
      'InTransit': 'chip-transit',
      'Booking': 'chip-booking',
      'Delivered': 'chip-delivery',
      'Cancelled':'chip-danger'
    };
    return map[status] ?? 'chip-pending';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pendingforQuickCompletion': '⏳',
      'InTransit': '🚛',
      'Booking': '🏭',
      'Delivered': '🏬',
      'Cancelled':'🚫'
    };
    return icons[status] ?? '⏳';
  }

constructor(public docketService: DocketService,
    public lrService: LrService,
    private router: Router,
    private exportService:ExportService,
    private sweetAlertService: SweetAlertService,
    public menuAccessService: MenuAccessService){}

    
      ngOnInit() {
        const saved = localStorage.getItem("loginUserList");
        if (saved) {
          this.docketService.loginUserList = JSON.parse(saved);
          this.docketService.Location = this.docketService.loginUserList.LocationCode;
          // this.docketService.loginUserList.LocationCode = 'PIM'
          this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
          this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
        }
        this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
          this.fetchLREditList();
        });
        this.fetchData();
        this.menuAccessService.loadMenuPermissions('LR1');
      }

onExcelDownload(){
   this.isCSVLoading = true;
     const payload = {
      fromDate: this.formatDateToISO(this.config.fromDateStr),
      toDate: this.formatDateToISO(this.config.toDateStr),
      locCode: this.docketService.loginUserList.LocationCode || null,
      statusFilter: this.config.statusFilter || 'All',
      isBilledFilter:this.config.isBilledFilter || 'All',
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      isDownload: true,
      searchText: this.config.searchText || ''
    };


   this.listSubscription = this.lrService.getLRFinList(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response && response.data) {
          this.exportService.exportToCSV(response.data, `LRFinEdit_List`);
        }
      },
      error: (err: any) => {
        this.isCSVLoading = false;
        console.error('Error downloading CSV', err);
      }
    });
}

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  onDateRangeSelected(event: { fromDate: Date, toDate: Date, rangeType: string }) {
    this.config.fromDateStr = event.fromDate;
    this.config.toDateStr = event.toDate;
    this.fetchData();
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

fetchLREditList(){
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }

    const payload = {
      fromDate: this.formatDateToISO(this.config.fromDateStr),
      toDate: this.formatDateToISO(this.config.toDateStr),
      locCode: this.docketService.loginUserList.LocationCode || null,
      statusFilter: this.config.statusFilter || 'All',
      isBilledFilter:this.config.isBilledFilter || 'All',
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      isDownload: false,
      searchText: this.config.searchText || ''
    };

    this.isLoading = true;
    this.listSubscription = this.lrService.getLRFinList(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.handleApiResponse(response);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching PRS List', err);
        this.LREditList = [];
      }
    });
}

 private handleApiResponse(response: any) {
    if (response && response.data) {
      this.LREditList = response.data;

      if (response.pagination) {
        this.config.totalRecords = response.pagination.totalRecords || this.LREditList.length;
        this.config.totalPages = response.pagination.totalPages || 1;
        this.config.page = response.pagination.currentPage || 1;
        this.config.pageSize = response.pagination.pageSize || 50;
      }

      if (response.summary) {
        this.summaryData = response.summary;
      }
    } else {
      this.LREditList = [];
      this.config.totalRecords = 0;
      this.config.totalPages = 1;
    }
  }

formatDateToISO(dateVal: any): string | null {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  setPage(p: number) {
    if (this.config.page === p) return;
    this.config.page = p;
    this.fetchLREditList();
  }

    openPrint(dockno: string) {
    const url = `${this.env.liveUrl}Operation/MultiDocketViewPrint?dockno=${dockno}&PrintType=5&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

   openEdit(dockno: string) {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '2';
      user.DocketNo = dockno;
      user.IsFromBillGeneration = "true";
      this.docketService.loginUserList = user;
      localStorage.setItem("loginUserList", JSON.stringify(user));
    }
    this.router.navigate(['/docketFinancialEdit'], { queryParams: { fromLR: 'true' } });
  }

  onView(row: any){
    this.LrViewComponent.showPopup(row);
}
}
