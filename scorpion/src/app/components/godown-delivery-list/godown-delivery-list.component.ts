import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { LrViewComponent } from '../lr-list/lr-view/lr-view.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { HCCDetailsComponent } from '../prs-generation-list/hcc-details/hcc-details.component';
import { GbViewComponent } from '../lr-list/gb-view/gb-view.component';
import { StickerPrintComponent } from '../lr-list/sticker-print/sticker-print.component';
import { LrPrintComponent } from '../lr-list/lr-print/lr-print.component';
import { DateRangePickerComponent } from 'app/shared/components/date-range-picker/date-range-picker.component';
import { GdViewComponent } from '../lr-list/gd-view/gd-view.component';
import { EwaybillInvoiceModalComponent } from 'app/shared/components/ewaybill-invoice-modal/ewaybill-invoice-modal.component';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { ExportService } from 'app/shared/services/export.service';

@Component({
  selector: 'app-godown-delivery-list',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    BsDatepickerModule,
    FormsModule,
    PaginationComponent,
    LrViewComponent,
    HCCDetailsComponent,
    GbViewComponent,
    StickerPrintComponent,
    LrPrintComponent,
    EwaybillInvoiceModalComponent,
    DateRangePickerComponent,
    GdViewComponent
  ],
  templateUrl: './godown-delivery-list.component.html',
  styleUrl: './godown-delivery-list.component.scss',
  providers: [BsModalService]
})
export class GodownDeliveryListComponent {
  @ViewChild('LrViewComponent') lrViewComponent!: LrViewComponent;
  @ViewChild('GbViewComponent') gbViewComponent!: GbViewComponent;
  @ViewChild('GdViewComponent') gdViewComponent!: GdViewComponent;
  @ViewChild('HCCDetailsComponent') HCCDetailsComponent!: HCCDetailsComponent;

  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;
  openTrackIndex: number | null = null;
  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();

  public isAllSelected: boolean = false;

  public summaryData: any = {
    TotalLR: 0,
    PendingForDelivery: 0,
    Delivered: 0
  };

  public godownDeliveryList: any[] = [];

  public config = {
    fromDateStr: new Date(new Date().setDate(new Date().getDate() - 30)),
    toDateStr: new Date(),
    statusFilter: 'T',
    page: 1,
    pageSize: 15,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

  constructor(
    public docketService: DocketService,
    private exportService: ExportService,
    public dynamicDataService: DynamicDataService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchLRList();
    });
    this.fetchData();
  }

  fetchLRList() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }

    const payload = {
      "FilterJson": {
        "ReportId": "396",
        "FromDate": this.formatDateToISO(this.config.fromDateStr),
        "ToDate": this.formatDateToISO(this.config.toDateStr),
        "BRCD": this.docketService.loginUserList?.LocationCode || null,
        // "Status": this.config.statusFilter || 'T',
        "PageNo": this.config.page,
        "PageSize": this.config.pageSize,
        "IsDownload": false,
        "DockNo": this.config.searchText || ''
      }
    };

    this.isLoading = true;
    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.handleApiResponse(response);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching Godown Delivery List', err);
        this.godownDeliveryList = [];
        this.config.totalRecords = 0;
        this.config.totalPages = 1;
      }
    });
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  private handleApiResponse(response: any) {
    if (response.Table1) {
      // 1. Bind Table1 (Summary Data)
      if (response.Table1  && response.Table1.length > 0) {
        this.summaryData = response.Table1[0];
      } else {
       this.summaryData={}
      }

      // 2. Bind Table2 (LR Grid Data)
      if (response.Table2 && response.Table1.length > 0) {
        this.godownDeliveryList = response.Table2.map((item: any) => ({
          ...item,
          isSelected: false
        }));

        if (this.godownDeliveryList.length > 0 && this.godownDeliveryList[0].TotalRecords !== undefined) {
          this.config.totalRecords = this.godownDeliveryList[0].TotalRecords;
        } else {
          this.config.totalRecords = this.godownDeliveryList.length;
        }
        this.config.totalPages = Math.ceil(this.config.totalRecords / this.config.pageSize) || 1;
      } else {
        this.godownDeliveryList = [];
        this.config.totalRecords = 0;
        this.config.totalPages = 1;
      }
    } else {
      this.godownDeliveryList = [];
      this.summaryData = { TotalLR: 0, PendingForDelivery: 0, Delivered: 0 };
      this.config.totalRecords = 0;
      this.config.totalPages = 1;
    }

    this.isAllSelected = false;
  }

  formatDateToISO(dateVal: any): string | null {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  onDateRangeSelected(event: any) {
    if (event) {
      this.config.fromDateStr = event.fromDate;
      this.config.toDateStr = event.toDate;
      this.fetchData();
    }
  }

  onSearchChange() {
    this.fetchData();
  }

  setPage(page: number) {
    this.config.page = page;
    this.fetchLRList();
  }


  // View Modals
  onView(dockno: string) {
    if (this.lrViewComponent && dockno) {
      // this.lrViewComponent.openModal(dockno);
    }
  }

  onGBNo(item: any) {
    const gb = item.GBNo || item.gbNo;
    if (this.gbViewComponent && gb) {
      this.gbViewComponent.openModal(gb);
    }
  }

  onGDNo(item: any) {
    const gd = item.GDNo || item.gdNo;
    if (this.gdViewComponent && gd) {
      this.gdViewComponent.openModal(gd);
    }
  }

  onViewHCC(docNo: string, hccNo: string) {
    if (this.HCCDetailsComponent && docNo && hccNo) {
      this.HCCDetailsComponent.showPopup({ dockno: docNo, hcNumber: hccNo }, 'G', 'GB');
    }
  }

  openHCCModal(lr: any) {
    this.HCCDetailsComponent.showPopup(lr, 'G', 'GB');
  }

  openGDHCCModal(lr: any) {
    this.HCCDetailsComponent.showPopup(lr, 'G', 'GD');
  }

  getPickupDeliveryTypeClass(type: string): string {
    if (!type) return 'badge-default';
    const t = type.toLowerCase().replace(/\s+/g, '-');
    if (t.includes('door') && t.includes('godown')) {
      if (t.startsWith('door')) return 'badge-door-godown';
      return 'badge-godown-door';
    }
    if (t.includes('godown')) return 'badge-godown-godown';
    if (t.includes('door')) return 'badge-door-door';
    return 'badge-default';
  }

  getStatusClass(status: string): string {
    if (!status) return 'chip-pending';
    const s = status.toLowerCase();
    // if (s.includes('part')) return 'chip-part';
    if (s === 'p') return 'chip-pending';
    if (s === 'd') return 'chip-delivery';
    if ( s === 't') return 'chip-transit';
    return 'chip-pending';
  }

   onExcelDownload() {
    this.isCSVLoading = true;
    const payload = {
      "FilterJson": {
        "ReportId": "396",
        "FromDate": this.formatDateToISO(this.config.fromDateStr),
        "ToDate": this.formatDateToISO(this.config.toDateStr),
        "BRCD": this.docketService.loginUserList?.LocationCode || null,
        // "Status": this.config.statusFilter || 'T',
        "PageNo": this.config.page,
        "PageSize": this.config.pageSize,
        "IsDownload": true,
        "DockNo": this.config.searchText || ''
      }
    };
    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response.Table1 && response.Table1.length >0) {
          this.exportService.exportToCSV(response.Table1, `Godown_Delivery_List`);
        }
      },
      error: (err: any) => {
        this.isCSVLoading = false;
        console.error('Error downloading CSV', err);
      }
    });
  }
}
