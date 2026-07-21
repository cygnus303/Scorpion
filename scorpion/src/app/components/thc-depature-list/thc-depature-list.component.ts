import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-thc-depature-list',
  standalone: true,
  imports: [NgSelectModule,CommonModule,BsDatepickerModule,FormsModule,PaginationComponent],
  templateUrl: './thc-depature-list.component.html',
  styleUrl: './thc-depature-list.component.scss'
})
export class ThcDepatureListComponent implements OnInit {
  public isCSVLoading : boolean=false;
  public isLoading : boolean =false;
  public selectAllChecked: boolean = false;
  public selectedCount: number = 0;
  public summaryData:any;
  public thcData: any[] = [];
  public env = environment;
  public statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending for departure', value: 'Pending for Departure' },
    { label: 'Departed', value: 'Departed' },
  ];
  public modeList=[
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

  formatDateToISO(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
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

  // UI Demo Logic
  public thcToDepart: string[] = [];

  openConfirmPopup(thcNo?: string) {
    if (thcNo) {
      this.thcToDepart = [thcNo];
    } else {
      this.thcToDepart = Array.from(this.selectedThcNos);
    }
    
    if (this.thcToDepart.length > 0) {
      const isMultiple = this.thcToDepart.length > 1;
      const thcText = isMultiple ? `${this.thcToDepart.length} THCs` : this.thcToDepart[0];

      Swal.fire({
        html: `
          <div style="text-align: left;">
            <h5 style="font-weight: 700; color: #0b1a30; margin-bottom: 12px; font-size: 18px;">Confirm departure</h5>
            <div style="font-size: 14px; color: #4b5563; line-height: 1.5;">
              Are you sure you want to depart <span style="font-weight: 600; color: #0b1a30;">${thcText}</span>?<br>
              Docket status will be updated for <strong style="color: #0b1a30;">LS / MF</strong> at the departure location.
            </div>
          </div>
        `,
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: '<i class="ti ti-send me-2"></i> Confirm depart',
        cancelButtonText: 'Cancel',
        width: '460px',
        padding: '24px 24px 20px 24px',
        customClass: {
          popup: 'rounded-4 shadow-sm',
          htmlContainer: 'm-0 p-0',
          actions: 'justify-content-end mt-4 mb-0 w-100 p-0',
          cancelButton: 'btn btn-outline-secondary px-4 py-2 me-2 text-dark fw-medium',
          confirmButton: 'btn btn-danger px-4 py-2 fw-medium d-flex align-items-center'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.confirmDepart();
        }
      });
    }
  }

  confirmDepart() {
    // In a real app, call API here
    debugger
    // Simulate API success and show success modal
    Swal.fire({
      html: `
        <div class="mb-4 d-flex justify-content-center">
          <div style="width: 90px; height: 90px; border-radius: 50%; background-color: #e6f9ed; border: 1px solid #c2f0d5; display: flex; align-items: center; justify-content: center;">
            <i class="ti ti-check text-success" style="font-size: 60px !important; width: 60px !important; height: 60px !important; display: flex; align-items: center; justify-content: center;"></i>
          </div>
        </div>
        <h5 style="font-weight: 700; color: #0b1a30; margin-bottom: 12px; font-size: 18px;">THC departed successfully</h5>
        <div style="font-size: 14px; color: #4b5563; line-height: 1.5; padding: 0 10px;">
          THC <span style="font-weight: 600; color: #0b1a30;">${this.thcToDepart.join(', ')}</span> has been departed.<br>
          Docket status is now available for <strong style="color: #0b1a30;">LS / MF</strong> at the departure location. THC status updated across THC Generation module.
        </div>
      `,
      confirmButtonText: '<i class="ti ti-check me-2"></i> Done',
      width: '460px',
      padding: '35px 24px 24px 24px',
      customClass: {
        popup: 'rounded-4 shadow-sm text-center',
        htmlContainer: 'm-0 p-0',
        actions: 'justify-content-center mt-4 mb-0 w-100 p-0',
        confirmButton: 'btn btn-danger px-4 py-2 fw-medium d-flex align-items-center'
      },
      buttonsStyling: false
    });
    
    // Update local data to reflect 'Departed' status for demo
    this.thcToDepart.forEach(no => {
      const item = this.thcData.find(t => t.thcno === no);
      if (item) item.departureStatus = 'Departed';
    });
    this.selectedThcNos.clear();
    this.checkSelection();
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
