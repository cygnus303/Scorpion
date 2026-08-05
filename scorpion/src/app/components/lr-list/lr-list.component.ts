import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { LrService } from 'app/shared/services/lr.service';
import { environment } from 'environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { ExportService } from 'app/shared/services/export.service';
import { LrViewComponent } from './lr-view/lr-view.component';
import { MenuAccessService } from 'app/shared/services/menu-access.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { EwayBillPreviewComponent } from '../eway-bill-preview/eway-bill-preview.component';

@Component({
  selector: 'app-lr-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent,LrViewComponent],
  templateUrl: './lr-list.component.html',
  styleUrl: './lr-list.component.scss',
  providers: [BsModalService]
})
export class LrListComponent {
  public isLoading: boolean = false;
  public listSubscription?: Subscription;
  public LRData: any[] = [];
  private fetchSubject = new Subject<void>();
  public summaryData: any;
  public env = environment;
  public isCSVLoading:boolean=false;
  public statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending for Quick Completion', value: 'pendingforQuickCompletion' },
    { label: 'At Booking Stock', value: 'booking' },
    { label: 'In Transit', value: 'inTransit' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'At Delivery Stock', value: 'At Delivery Stock' }
  ];
    trackMenuItems = [
    { icon: '📊', label: 'Profit / Loss', type: 7 },
    { icon: '🔄', label: 'Operational Life Cycle', type: 3 },
    { icon: '💳', label: 'Financial Life Cycle', type: 4 },
    { icon: '📄', label: 'POD / PFM', type: 5 },
    { icon: '🕒', label: 'Time Tracking', type: 2 },
    { icon: '📝', label: 'View Summary', type: 1 },
    { icon: '📦', label: 'Loading/UnLoading', type: 11 },
    { icon: '🧭', label: 'On Map', type: null },
    { icon: '📅', label: 'Expected Delivery Date', type: null },
    { icon: '🚚', label: 'Movement', type: 6 },
    { icon: '👁', label: 'DEPS View', type: 17 },
    { icon: '📡', label: 'UBI Tracking', type: 18 },
  ];

  openTrackIndex: number | null = null;
  public modalRef!: BsModalRef;
  @ViewChild('ewayBillModal') ewayBillModal!: TemplateRef<any>;
  public ewaybillData: any[] = [];
  @ViewChild('LrViewComponent') LrViewComponent!: LrViewComponent;



  constructor(
    public docketService: DocketService,
    public lrService: LrService,
    private router: Router,
    private exportService: ExportService,
    private sweetAlertService: SweetAlertService,
    public menuAccessService: MenuAccessService,
    private dynamicDataService: DynamicDataService,
    private modalService: BsModalService,
    private basicDetailService: BasicDetailService
  ) { }

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
      this.fetchLRList();
    });
    this.fetchData();
    this.menuAccessService.loadMenuPermissions('LR1');
  }
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

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'pendingforQuickCompletion': 'chip-pending',
      'InTransit': 'chip-transit',
      'Booking': 'chip-booking',
      'Delivered': 'chip-delivery',
      'At Delivery Stock': 'chip-deliveryStock',
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
      'At Delivery Stock':'💰',
      'Cancelled':'🚫'
    };
    return icons[status] ?? '⏳';
  }

  private apiCache = new Map<string, any>();

  formatDateToISO(dateVal: any): string | null {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  fetchLRList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }

    const payload = {
      fromDate: this.formatDateToISO(this.config.fromDateStr),
      toDate: this.formatDateToISO(this.config.toDateStr),
      locCode: this.docketService.loginUserList.LocationCode || null,
      statusFilter: this.config.statusFilter || 'All',
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      isDownload: false,
      searchText: this.config.searchText || ''
    };

    this.isLoading = true;
    this.listSubscription = this.lrService.getLRList(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.handleApiResponse(response);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching PRS List', err);
        this.LRData = [];
      }
    });
  }

  onExcelDownload(){
    this.isCSVLoading = true;
    const params = {
      startDate: this.formatDateToISO(this.config.fromDateStr),
      endDate: this.formatDateToISO(this.config.toDateStr),
      locCode: this.docketService.loginUserList.LocationCode || '',
      statusFilter: this.config.statusFilter || 'All',
      searchText: this.config.searchText || ''
    };

   this.listSubscription = this.lrService.exportLRListing(params).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response && response.data) {
          this.exportService.exportToCSV(response.data, `LR_List`);
        }
      },
      error: (err: any) => {
        this.isCSVLoading = false;
        console.error('Error downloading CSV', err);
      }
    });
  }

  private handleApiResponse(response: any) {
    if (response && response.data) {
      this.LRData = response.data;

      if (response.pagination) {
        this.config.totalRecords = response.pagination.totalRecords || this.LRData.length;
        this.config.totalPages = response.pagination.totalPages || 1;
        this.config.page = response.pagination.currentPage || 1;
        this.config.pageSize = response.pagination.pageSize || 50;
      }

      if (response.summary) {
        this.summaryData = response.summary;
      }
    } else {
      this.LRData = [];
      this.config.totalRecords = 0;
      this.config.totalPages = 1;
    }
  }

  get isHQTR(): boolean {
    return this.docketService.loginUserList?.LocationCode === 'HQTR';
  }

  onCancel(dockNo: string) {
    this.sweetAlertService.cancelWithReason(
      'Cancel LR',
      `LR ${dockNo}`,
      (reason: string) => {
        this.executeCancel(dockNo, reason);
      }
    );
  }

  executeCancel(dockNo: string, reason: string) {
    const payload = {
      dockNo: dockNo,
      reason: reason,
      userId: this.docketService.loginUserList.BaseUserName,
      baseLocationCode: this.docketService.loginUserList.LocationCode
    };

    this.lrService.cancelDocket(payload).subscribe({
      next: (res: any) => {
        if (res.success === true) {
          this.sweetAlertService.success(` ${dockNo} has been cancelled successfully.`);
          this.fetchData();
        } else {
          this.sweetAlertService.error(res?.message || 'Failed to cancel LR');
        }
      },
      error: (err: any) => {
        this.sweetAlertService.error(err?.error?.message || 'Failed to cancel LR');
      }
    });
  }

  setPage(p: number) {
    if (this.config.page === p) return;
    this.config.page = p;
    this.fetchLRList();
  }

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }


  onDataUpdate() {
    this.apiCache.clear();
    this.fetchData();
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  openAddLR() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '';
      this.docketService.loginUserList = user;
      localStorage.setItem("loginUserList", JSON.stringify(user));
    }
    this.router.navigate(['/docket'], { queryParams: { fromLR: 'true' } });
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

  openQuick(dockno: string) {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '3';
      user.DocketNo = dockno;
      user.IsFromBillGeneration = "true";
      this.docketService.loginUserList = user;
      localStorage.setItem("loginUserList", JSON.stringify(user));
    }
    this.router.navigate(['/docketFinancialEdit'], { queryParams: { fromLR: 'true' } });
  }

  toggleTrack(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.openTrackIndex = this.openTrackIndex === index ? null : index;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.openTrackIndex = null;
  }

onView(row: any){
    this.LrViewComponent.showPopup(row);
}

  onTrackMenuClick(item: any, dockno: string) {
    this.openTrackIndex = null;

    if (item.label === 'On Map') {
      this.openPopup(`${this.env.liveUrl}Tracking/VehicleTrackingShowOnMap?Vehno=&src=angular`);
      return;
    }
    if (item.label === 'Expected Delivery Date') {
      this.openPopup(`${this.env.liveUrl}ViewPrint/Expected_Delivery_Date_Tracking_ViewPrint?Dockno=${dockno} expe deliv date&src=angular`);
      return;
    }

    this.openPopup(`${this.env.liveUrl}ViewPrint/Tracking?Type=${item.type}&DocketNo=${dockno}&DockSf=.&src=angular`);
  }

  openPopup(url: string) {
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) popup.location.href = url;
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

  getEwaybillData(dockno: string) {
    const payload = {
      "FilterJson": {
        "ReportId": "11",
        "DockNo": dockno
      }
    }
    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoading = false;
      if (response?.Table1 && response.Table1.length > 0) {
        this.ewaybillData = response.Table1;
        this.modalRef = this.modalService.show(this.ewayBillModal, { class: 'modal-lg modal-dialog-centered' });
      } else {
        this.sweetAlertService.info('No E-Way bill data found for this docket.');
      }
    }, error => {
      this.isLoading = false;
      this.sweetAlertService.error('Error fetching E-Way bill data');
    });
  }

  downloadEWayBillPDF(ewaybillNo: string) {
    if (!ewaybillNo) return;
    const payload = {
      "FilterJson": {
        "ReportId": "12",
        "EwaybillNo": ewaybillNo
      }
    }

    
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.modalService.show(EwayBillPreviewComponent, {
            initialState: { response },
            class: 'modal-lg modal-dialog-centered'
          });
        } else {
          this.sweetAlertService.error('E-Way Bill Details Not Found');
        }
      },
      error: () => {
        this.sweetAlertService.error('Failed to fetch E-Way Bill Details');
      }
    });
  }

}
