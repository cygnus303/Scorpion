import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { LrService } from 'app/shared/services/lr.service';
import { environment } from 'environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-lr-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent],
  templateUrl: './lr-list.component.html',
  styleUrl: './lr-list.component.scss'
})
export class LrListComponent {
  public isLoading: boolean = false;
  public listSubscription?: Subscription;
  public LRData: any[] = [];
  private fetchSubject = new Subject<void>();
  public summaryData:any;
  public env = environment;
  public  statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending for Quick Completion', value: 'pendingforQuickCompletion' },
    { label: 'At Booking Stock', value: 'booking' },
    { label: 'In Transit', value: 'inTransit' },
    { label: 'At Delivery Stock', value: 'delivered' }
  ];
  trackMenuItems = [
  { icon: '📊', label: 'Profit / Loss',          type: 7  },
  { icon: '🔄', label: 'Operational Life Cycle', type: 3  },
  { icon: '💳', label: 'Financial Life Cycle',   type: 4  },
  { icon: '📄', label: 'POD / PFM',              type: 5  },
  { icon: '🕒', label: 'Time Tracking',           type: 2  },
  { icon: '📝', label: 'View Summary',            type: 1  },
  { icon: '📦', label: 'Loading/UnLoading',       type: 11 },
  { icon: '🧭', label: 'On Map',                  type: null },
  { icon: '📅', label: 'Expected Delivery Date',  type: null },
  { icon: '🚚', label: 'Movement',                type: 6  },
  { icon: '👁',  label: 'DEPS View',              type: 17 },
  { icon: '📡', label: 'UBI Tracking',            type: 18 },
];

openTrackIndex: number | null = null;



  constructor(
    public docketService: DocketService,
    public lrService: LrService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchLRList();
    });
      this.fetchData();
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
    };
    return map[status] ?? 'chip-pending';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pendingforQuickCompletion': '⏳',
      'InTransit': '🚛',
      'Booking': '🏭',
      'Delivered': '🏬',
    };
    return icons[status] ?? '⏳';
  }

  fetchLRList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.isLoading = true;
    const payload = {
      fromDate: new Date(this.config.fromDateStr).toISOString(),
      toDate: new Date(this.config.toDateStr).toISOString(),
      locCode: this.docketService.loginUserList.LocationCode || null,
      statusFilter: this.config.statusFilter || 'All',
      pageNumber: this.config.page,
      pageSize: this.config.pageSize,
      isDownload: false,
      searchText: this.config.searchText || ''
    };
    this.listSubscription = this.lrService.getLRList(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
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
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching PRS List', err);
        this.LRData = [];
      }
    });
  }

    get isHQTR(): boolean {
    return this.docketService.loginUserList?.LocationCode === 'HQTR';
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

  openEdit(dockno:string){
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

   openQuick(dockno:string){
     const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '1';
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

openView(dockno:string){
   const url = `${this.env.liveUrl}ViewPrint/GC_XLSGeneration?Dockno=${dockno}&Docksf=.&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
}

 openPopup(url: string) {
  const popup = window.open('', 'popupWindow',
    'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
  );
  if (popup) popup.location.href = url;
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

openPrint(dockno: string){
  const url = `${this.env.liveUrl}Operation/MultiDocketViewPrint?dockno=${dockno}&PrintType=5&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
}

}
