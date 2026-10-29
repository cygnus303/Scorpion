import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import Swal from 'sweetalert2';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DateRangePickerComponent } from 'app/shared/components/date-range-picker/date-range-picker.component';
import { ThcDepartureConfirmPopupComponent } from './thc-departure-confirm-popup/thc-departure-confirm-popup.component';

@Component({
  selector: 'app-thc-depature-list',
  standalone: true,
  imports: [NgSelectModule, CommonModule, BsDatepickerModule, FormsModule, PaginationComponent, DateRangePickerComponent, ThcDepartureConfirmPopupComponent],
  templateUrl: './thc-depature-list.component.html',
  styleUrl: './thc-depature-list.component.scss'
})
export class ThcDepatureListComponent implements OnInit {
  public isCSVLoading: boolean = false;
  public isLoading: boolean = false;
  public selectAllChecked: boolean = false;
  public selectedCount: number = 0;
  public summaryData: any;
  public thcToDepart: any[] = [];
  public thcData: any[] = [];
  public env = environment;
  public statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending for departure', value: 'Pending for Departure' },
    { label: 'Departed', value: 'Departed' },
  ];
  public modeList = [
    { label: 'All', value: 'All' },
    { label: 'Road', value: 'Road' },
    { label: 'Air', value: 'Air' },
    // { label: 'Rail', value: 'Rail' },
  ];

  public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    statusFilter: 'All',
    modeFilter: 'All',
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

  public searchSubject: Subject<string> = new Subject<string>();
  private fetchSub?: Subscription;
  public selectedThcNos: Set<string> = new Set<string>();

  @ViewChild('departureConfirmPopup') departureConfirmPopup!: ThcDepartureConfirmPopupComponent;

  constructor(
    private thcService: THCMasterService,
    public docketService: DocketService,
    private exportService: ExportService,
    private sweetAlertService: SweetAlertService
  ) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    this.config.fromDateStr = fromDate;
  }

  ngOnInit() {
     const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.config.page = 1;
      this.config.searchText = searchText;
      this.fetchData();
    });
    this.fetchData();
  }

  get isHQTR(): boolean {
    return this.docketService.loginUserList?.LocationCode === 'HQTR';
  }

  formatDateToISO(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  onDateRangeSelected(event: { fromDate: Date, toDate: Date, rangeType: string }) {
    this.config.fromDateStr = event.fromDate;
    this.config.toDateStr = event.toDate;
    this.fetchData();
  }

  fetchData() {
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }
    this.isLoading = true;
    const payload = {
      fromDate: this.formatDateToISO(this.config.fromDateStr),
      toDate: this.formatDateToISO(this.config.toDateStr),
      searchText: this.config.searchText || '',
      status: this.config.statusFilter,
      transportMode: this.config.modeFilter,
      pageNo: this.config.page,
      pageSize: this.config.pageSize,
      locCode: this.docketService.loginUserList.LocationCode || null
    };

    this.fetchSub = this.thcService.getTHCDepartureList(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.summaryData = res.summary || {};
          this.thcData = (res.data || []).map((item: any) => ({ ...item, isSelected: this.selectedThcNos.has(item.thcno) }));

          if (res.pagination) {
            this.config.totalRecords = res.pagination.totalRecords || 0;
            this.config.totalPages = res.pagination.totalPages || 1;
          } else if (this.thcData.length > 0) {
            this.config.totalRecords = this.thcData[0].totalRecords || 0;
          } else {
            this.config.totalRecords = 0;
          }
          this.checkSelection();
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.thcData.forEach(item => {
      if (item.departureStatus !== 'Departed') {
        item.isSelected = isChecked;
        if (isChecked) {
          this.selectedThcNos.add(item.thcno);
        } else {
          this.selectedThcNos.delete(item.thcno);
        }
      }
    });
    this.checkSelection();
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

  onRowSelect(data: any) {
    if (data.isSelected) {
      this.selectedThcNos.add(data.thcno);
    } else {
      this.selectedThcNos.delete(data.thcno);
    }
    this.checkSelection();
  }

  exportExcel() {
    this.isCSVLoading = true;
    const payload = {
      locCode: this.docketService.loginUserList.LocationCode || null,
      fromDate: this.config.fromDateStr ? new Date(this.config.fromDateStr).toISOString() : '',
      toDate: this.config.toDateStr ? new Date(this.config.toDateStr).toISOString() : '',
      searchText: this.config.searchText || '',
      status: this.config.statusFilter === 'All' ? 'ALL' : this.config.statusFilter,
      transportMode: this.config.modeFilter === 'All' ? 'ALL' : this.config.modeFilter
    };

    this.thcService.exportTHCDepartureExcel(payload).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          this.exportService.exportToExcel(res, 'THCDepartureList');
        }
        this.isCSVLoading = false;
      },
      error: () => {
        this.isCSVLoading = false;
      }
    });
  }

  checkSelection() {
    const selectableItems = this.thcData.filter(item => item.departureStatus !== 'Departed');
    this.selectedCount = this.selectedThcNos.size;

    if (selectableItems.length === 0) {
      this.selectAllChecked = false;
    } else {
      this.selectAllChecked = this.selectedCount === selectableItems.length;
    }
  }



  openConfirmPopup(thcNo?: string) {
    if (thcNo) {
      const item = this.thcData.find(t => t.thcno === thcNo);
      this.thcToDepart = item ? [item] : [];
    } else {
      this.thcToDepart = this.thcData.filter(t => this.selectedThcNos.has(t.thcno));
    }

    console.log("SELECTED ROW DATA:", this.thcToDepart);

    if (this.thcToDepart.length > 0) {
      this.departureConfirmPopup.showPopup(this.thcToDepart);
    }
  }

  onDepartSuccess() {
    this.selectedThcNos.clear();
    this.checkSelection();
    this.fetchData();
  }


  clearSelection() {
    this.selectedThcNos.clear();
    this.thcData.forEach(item => item.isSelected = false);
    this.checkSelection();
  }

  onSearchChange() {
    this.searchSubject.next(this.config.searchText);
  }

  setPage(event: any) {
    this.config.page = event;
    this.fetchData();
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.config.page = 1;
    this.fetchData();
  }
}
