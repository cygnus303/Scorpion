import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { AddPrqComponent } from './add-prq/add-prq.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ExportService } from 'app/shared/services/export.service';
import { PrqService } from 'app/shared/services/prq.service';
import { PrqViewComponent } from './prq-view/prq-view.component';
import { PrqTrackComponent } from './prq-track/prq-track.component';

@Component({
  selector: 'app-prq-list',
  standalone: true,
  imports: [BsDatepickerModule, CommonModule, NgSelectModule, PaginationComponent, FormsModule, AddPrqComponent,PrqViewComponent,PrqTrackComponent],
  providers: [BsModalService],
  templateUrl: './prq-list.component.html',
  styleUrl: './prq-list.component.scss'
})
export class PrqListComponent {
  @ViewChild('cancelPrqModal') cancelPrqModalTemplate!: TemplateRef<any>;
  @ViewChild('AddPrqComponent') AddPrqComponent!: AddPrqComponent;
  @ViewChild('PrqViewComponent') PrqViewComponent!: PrqViewComponent;
  @ViewChild('PrqTrackComponent') PrqTrackComponent!: PrqTrackComponent;
  @ViewChild('TemplateBulkUpload') TemplateBulkUpload!: TemplateRef<any>;

  public requestCache = new Map<string, any>();
  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;
  public isTemplateLoading : boolean = false;
  private fetchSubject = new Subject<void>();
  public listSubscription?: Subscription;
  public cardSubscription?: Subscription;
  public cancelModalRef?: BsModalRef;
  public cancelPrqNo: string = '';
  public cancelReason: string = '';
  public isCancelSubmitted: boolean = false;
  public isShaking: boolean = false;
  public prqList: any[] = [];
  public summaryData: any = {
    total_PRQ: 0,
    prq_Generated: 0,
    prq_Assigned: 0,
    cancelled: 0
  };

  public bulkUploadModalRef?: BsModalRef;
  public selectedFile: File | null = null;
  public selectedFileName: string = '';
  public isValidating: boolean = false;
  public isValidationComplete: boolean = false;
  public validationResults: any[] = [];
  public totalRows: number = 0;
  public validRows: number = 0;
  public invalidRows: number = 0;

  statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'PRQ Generated', value: 'Generated' },
    { label: 'PRQ Assigned', value: 'Assigned' },
    { label: 'PRQ Arranged', value: 'Arranged' },
    { label: 'PRQ Cancelled', value: 'Cancelled' },
  ];

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

  constructor(
    private dynamicDataService: DynamicDataService,
    private docketService: DocketService,
    private sweetAlertService: SweetAlertService,
    private modalService: BsModalService,
    private exportService: ExportService,
    private prqService: PrqService
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
      this.getPRQList();
      this.getPRQCardList();
    });
    this.fetchData();

  }


  formatDateToISO(dateVal: any): string | null {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    const day = ('0' + d.getDate()).slice(-2);
    return `${day} ${month} ${year}`;
  }

  getPRQList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    this.isLoading = true;
    const payload = {
      "FilterJson": {
        ReportId: '222',
        FromDate: this.formatDateToISO(this.config.fromDateStr),
        ToDate: this.formatDateToISO(this.config.toDateStr),
        BaseLocation: this.docketService.loginUserList.LocationCode || null,
        UserName: this.docketService.loginUserList.BaseUserName,
        Status: this.config.statusFilter || 'All',
        SearchText:this.config.searchText || '',
        PageNo: this.config.page,
        PageSize: this.config.pageSize,
        IsDownload: "0"
      }
    }
    this.listSubscription=this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoading = false;
      this.prqList = response.Table2;
      if (response.Table1) {
        this.config.totalRecords = response.Table1[0].TotalRecords || this.prqList.length;
        this.config.totalPages = response.Table1[0].TotalPages || 1;
        this.config.page = response.Table1[0].PageNo || 1;
        this.config.pageSize = response.Table1[0].PageSize || 50;
      }
    });
  }

   refreshData() {
    this.requestCache.clear();
    this.fetchData();
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  setPage(p: number) {
    if (this.config.page === p) return;
    this.config.page = p;
    this.getPRQList();
    this.getPRQCardList();
  }

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
    this.getPRQCardList();
  }

  getPRQCardList() {
    if (this.cardSubscription) { this.cardSubscription.unsubscribe(); }

    const payload = {
      "FilterJson": {
        "ReportId": "224",
        "FromDate": this.formatDateToISO(this.config.fromDateStr),
        "ToDate": this.formatDateToISO(this.config.toDateStr),
        "BaseLocation": this.docketService.loginUserList.LocationCode || null,
        "UserName": this.docketService.loginUserList.BaseUserName,
        "SearchText":this.config.searchText
      }
    };
    this.cardSubscription=this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response && response.Table1 && response.Table1.length > 0) {
          const data = response.Table1;
          this.summaryData = {
            total_PRQ: data.find((x: any) => x.CodeDesc === 'Total PRQ')?.CNT || 0,
            prq_Generated: data.find((x: any) => x.CodeDesc === 'PRQ Generated')?.CNT || 0,
            prq_Assigned: data.find((x: any) => x.CodeDesc === 'PRQ Assigned')?.CNT || 0,
            prq_Arranged: data.find((x: any) => x.CodeDesc === 'PRQ Arranged')?.CNT || 0,
            cancelled: data.find((x: any) => x.CodeDesc === 'Cancelled')?.CNT || 0,
          };
        }
      },
      error: (response: any) => {
        this.sweetAlertService.error(response);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Generated': return 's-gen';
      case 'Cancelled': return 's-canc';
      case 'Assigned': return 's-hcc';
      case 'ARRANGED': return 's-billed';
      default: return '';
    }
  }

  openPRQ() {
    this.AddPrqComponent.showPopup();
  }

  openPRQView(prqNo: string){
    this.PrqViewComponent.showPopup(prqNo);
  }

  openBulkUpload() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.isValidating = false;
    this.isValidationComplete = false;
    this.validationResults = [];
    this.bulkUploadModalRef = this.modalService.show(this.TemplateBulkUpload, { class: 'modal-dialog-centered modal-lg', backdrop: 'static' });
  }

  closeBulkUploadModal() {
    this.bulkUploadModalRef?.hide();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
        this.sweetAlertService.info('Only .xls and .xlsx file types are supported.');
        this.selectedFile = null;
        this.selectedFileName = '';
        event.target.value = '';
        return;
      }
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.validateFile(file);
    }
  }

  validateFile(file: File) {
    const formData = new FormData();
    formData.append('excelFile', file);
    // Include user details if needed by the backend
    // formData.append('UserName', this.docketService.loginUserList?.BaseUserName || '');
    
    this.isValidating = true;
    this.isValidationComplete = false;
    
    this.prqService.validateExcel(formData).subscribe({
      next: (response: any) => {
        this.isValidating = false;
        this.isValidationComplete = true;
        this.validationResults = response?.items || [];
        this.totalRows = this.validationResults.length;
        this.validRows = this.validationResults.filter((x: any) => x.isValid).length;
        this.invalidRows = this.totalRows - this.validRows;
      },
      error: (err: any) => {
        this.isValidating = false;
        this.sweetAlertService.error(err?.error?.message || 'Failed to validate the file.');
      }
    });
  }

  public isSubmittingBulk: boolean = false;

  submitBulkUpload() {
     const now = new Date();
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const payload = {
      items: this.validationResults.map(item => ({
        ...item,
        prqDate: formattedDate
      })),
      baseLocation: this.docketService.loginUserList?.LocationCode || '',
      baseUserName: this.docketService.loginUserList?.BaseUserName || '',
      baseFinYear: this.docketService.loginUserList?.FinYear || ''
    };

    this.isSubmittingBulk = true;
    this.prqService.uploadExcel(payload).subscribe({
      next: (response: Blob) => {
        this.isSubmittingBulk = false;
        
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Bulk_PRQ_Upload_Result.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.sweetAlertService.success('PRQs submitted successfully!');
        this.closeBulkUploadModal();
        this.refreshData();
      },
      error: (err: any) => {
        this.isSubmittingBulk = false;
        this.sweetAlertService.error(err?.error?.message || 'An error occurred during submission.');
      }
    });
  }

  selectPrqType(prqNo?: string) {
    // this.addPRQ.showPopup();
    this.AddPrqComponent.showPopup(prqNo);
  }

  onCancel(prqNo: string) {
    this.cancelPrqNo = prqNo;
    this.cancelReason = '';
    this.isCancelSubmitted = false;
    this.cancelModalRef = this.modalService.show(this.cancelPrqModalTemplate, { class: 'modal-dialog-centered cancel-prq-modal', backdrop: 'static' });
  }

  closeCancelModal() {
    this.cancelModalRef?.hide();
    this.cancelPrqNo = '';
    this.cancelReason = '';
    this.isCancelSubmitted = false;
  }

  confirmCancel() {
    this.isCancelSubmitted = true;
    if (!this.cancelReason || !this.cancelReason.trim()) {
      this.isShaking = false;
      setTimeout(() => this.isShaking = true, 10);
      setTimeout(() => this.isShaking = false, 400);
      return;
    }

    const payload = {
      "FilterJson": {
        "ReportId": "221",
        "PRQNo": this.cancelPrqNo,
        "UserName": this.docketService.loginUserList.BaseUserName,
        "CancelReason": this.cancelReason.trim()
      }
    };

    this.isLoading = true;
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.sweetAlertService.success("PRQ Cancelled Successfully");
        this.closeCancelModal();
        this.getPRQList();
      },
      error: (response: any) => {
        this.isLoading = false;
        this.sweetAlertService.error(response?.error?.message || "Failed to cancel PRQ");
      }
    });
  }

  downloadPRQ() {
    const payload = {
      "FilterJson": {
        ReportId: '222',
        FromDate: this.formatDateToISO(this.config.fromDateStr),
        ToDate: this.formatDateToISO(this.config.toDateStr),
        BaseLocation: this.docketService.loginUserList.LocationCode || null,
        UserName: this.docketService.loginUserList.BaseUserName,
        Status: this.config.statusFilter || 'All',
        PageNo: this.config.page,
        PageSize: this.config.pageSize,
        SearchText:this.config.searchText,
        IsDownload: "1"
      }
    }
    this.isCSVLoading = true;
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response && response.Table2 && response.Table2.length > 0) {
          this.exportService.exportToExcel(response.Table2, `PRQ_Export`);
        } else {
          this.sweetAlertService.error('No data available to download');
        }
        this.isCSVLoading = false;
      },
      error: (error: any) => {
        this.isCSVLoading = false;
        this.sweetAlertService.error(error?.error?.message || 'Download failed');
      },
    });
  }

  onTrack(data: any){
    this.PrqTrackComponent.showPopup(data);
  }

  onDownloadTemplate(){
    this.isTemplateLoading = true;
    this.prqService.downloadTemplate().subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PRQ_Template.xlsx'; // Or the correct filename/extension
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isTemplateLoading = false;
      },
      error: (error: any) => {
        this.isTemplateLoading = false;
        this.sweetAlertService.error('Failed to download template.');
      }
    });
  }

}
