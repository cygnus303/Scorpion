import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { CommonService } from 'app/shared/services/common.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { ExportService } from 'app/shared/services/export.service';
import { VendorService } from 'app/shared/services/vendor.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-query-response',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BsDatepickerModule, PaginationComponent],
  providers: [BsModalService],
  templateUrl: './query-response.component.html',
  styleUrl: './query-response.component.scss'
})
export class QueryResponseComponent {
  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();
  public isLoading: boolean = false;
  public summaryData: any;
  public modalRef?: BsModalRef;
  public selectedItem: any;
  public env = environment;

  public queryList: any = [];
  public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: '',
    Status: '0'
  };

  constructor(
    public dynamicDataService: DynamicDataService,
    private commonService: CommonService,
    private modalService: BsModalService,
    public vendorService:VendorService,
    private sweetAlertService: SweetAlertService
  ) { }

  ngOnInit() {
    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getQueryResponse();
    });

    this.fetchData();
  }

  getQueryResponse() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }

    const payload = {
      FilterJson: {
        "ReportId": 10,
        "VendorCode": "",
        "Status": this.config.Status,
        "FromDate": this.commonService.formatDateToISO(this.config.fromDateStr),
        "ToDate": this.commonService.formatDateToISO(this.config.toDateStr),
        "PageNo": this.config.page,
        "PageSize": this.config.pageSize,
        "IsDownload": "0",
        "SearchText": this.config.searchText
      }
    };
    this.isLoading= true;

    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.queryList = response.Table2;
          if (response.Table1) {
            this.summaryData = response.Table1[0];
          }
          if (response.Table3) {
            this.config.totalRecords = response.Table3[0].TotalRecords || this.queryList.length;
            this.config.totalPages = response.Table3[0].TotalPages || 1;
            this.config.page = response.Table3[0].PageNo || 1;
            this.config.pageSize = response.Table3[0].PageSize || 50;
          }
          this.isLoading= false;
        }
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.isLoading= false;
      }
    });
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  setPage(p: number) {
    if (this.config.page === p) return;
    this.config.page = p;
    this.getQueryResponse();
  }

  onSearchChange() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Query Responded': return 's-gen';
      case 'Query Raised': return 's-billed';
      default: return '';
    }
  }

  filterByStatus(status: string) {
    this.config.Status = status;
    this.fetchData();
  }

  onFileSelected(event: any, item: any) {
    const file = event.target.files[0];
    if (file) {
      item.fileName = file.name;
      item.file = file;
    }
    // Clear the value to allow selecting the same file again
    event.target.value = '';
  }

  openView(template: any, item: any) {
    this.selectedItem = item;
    this.modalRef = this.modalService.show(template, { class: 'modal-md modal-dialog-centered' });
  }

  closeModal() {
    this.modalRef?.hide();
  }

  viewAttachment(fileName: string) {
    if (fileName) {
      const fileUrl = `${this.env.liveUrl}uploads/vendor-response/${fileName}`; 
      window.open(fileUrl, '_blank');
    } else {
      this.sweetAlertService.info("Attachment not found.");
    }
  }

  onSubmit(item:any){
    const formData = new FormData();
    formData.append('QueryNo', item.QueryNo || '');
    formData.append('VendorBillNo', item.VendorBillNo || '');
    formData.append('Remarks', item.newRemarks || '');
    
    if (item.file) {
      formData.append('File', item.file);
      formData.append('ResponseAttachmentName', item.fileName);
    } else {
      formData.append('ResponseAttachmentName', '');
    }
    
    formData.append('UpdatedBy', 'cygnusteam');

    this.vendorService.queryResponse(formData).subscribe({
      next: (response: any) => {
        if (response) {
          if (response.status === 1) {
            this.sweetAlertService.success(response.message);
          } else {
            this.sweetAlertService.info(response.message);
          }
          this.getQueryResponse();
        }
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.sweetAlertService.error(err.error?.message || 'Something went wrong');
      }
    });
  }
}