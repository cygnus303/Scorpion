import { Component, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { MrViewComponent } from '../mr-view/mr-view.component';
import { VoucherViewComponent } from '../voucher-view/voucher-view.component';
import { UnrViewComponent } from '../unr-view/unr-view.component';
import { DocketService } from 'app/shared/services/docket.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-unr-approval',
  standalone: true,
  imports: [CommonModule, PaginationComponent, MrViewComponent, VoucherViewComponent, UnrViewComponent],
  providers: [BsModalService],
  templateUrl: './unr-approval.component.html',
  styleUrl: './unr-approval.component.scss'
})
export class UnrApprovalComponent {
  isLoading: boolean = false;
  public approvalList: any;
  public listSubscription?: Subscription;
  public fetchSubject = new Subject<void>();
  @ViewChild('MrViewComponent') MrViewComponent!: MrViewComponent;
  @ViewChild('VoucherViewComponent') VoucherViewComponent!: VoucherViewComponent;
  @ViewChild('UnrViewComponent') UnrViewComponent!: UnrViewComponent;
  @ViewChild('SuccessModalRef') SuccessModalRef!: TemplateRef<any>;

  public modalRef!: BsModalRef;
  public successData: any = {};


  public pagination: any = {
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
  };


  public lastFilters: any = { fromDt: '', toDt: '', status: 'ALL' };

  constructor(
    private dynamicDataService: DynamicDataService,
    private docketService: DocketService,
    private sweetAlertService: SweetAlertService,
    private modalService: BsModalService
  ) {

  }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.FinYear = this.docketService.loginUserList.FinYear,
        this.docketService.Companycode = this.docketService.loginUserList.Companycode
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }

    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getUNRApprovalList();
    });
    
    // Trigger initial fetch when component mounts
    this.fetchSubject.next();
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  public lastConfig: any = {
    FromDt: new Date(),
    ToDt: new Date(),
    Status: 'ALL',
    UNRNO: '',
    SearchText:''
  };

  getUNRApprovalList(config?: any) {
     if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    if (config) {
      this.lastConfig = { ...config };
      // If parent passes PageNo, you can optionally sync it, but usually pagination is handled locally or synced
      if (config.PageNo) {
        this.pagination.page = config.PageNo;
      }
    }

    const payload = {
      "FilterJson": {
        "ReportId": "366",
        "FromDt": this.formatDate(this.lastConfig.FromDt),
        "ToDt": this.formatDate(this.lastConfig.ToDt),
        "Status": this.lastConfig.Status,
        "UNRNO": this.lastConfig.UNRNO,
        "PageNo": this.pagination.page,
        "PageSize": this.pagination.pageSize,
        "SearchText": this.lastConfig.SearchText
      }
    }
    this.isLoading = true;
    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoading = false;
      if (response?.Table1) {
        this.approvalList = response.Table1;
        const totalRecords = this.approvalList.length > 0 ? (this.approvalList[0].TotalRows || this.approvalList[0].TotalRecord || this.approvalList.length) : 0;
        this.pagination.totalRecords = totalRecords;
        this.pagination.totalPages = Math.ceil(totalRecords / this.pagination.pageSize) || 1;
      }
    }, () => {
      this.isLoading = false;
      this.approvalList = [];
      this.pagination.totalRecords = 0;
      this.pagination.totalPages = 1;
    });
  }

  setPage(p: number) {
    if (this.pagination.page === p) return;
    this.pagination.page = p;
    this.getUNRApprovalList();
  }

  openMRView(mrNo: string) {
    this.MrViewComponent.showPopup(mrNo);
  }

  openVoucherView(voucherNo: string) {
    this.VoucherViewComponent.showPopup(voucherNo);
  }

  openUNRView(unrNo: string) {
    this.UnrViewComponent.showPopup(unrNo);
  }

  onApproveReject(unrNo: any, type: string, reason: string = "") {
    if (type === 'R') {
      this.sweetAlertService.cancelWithReason(
        'Reject UNR',
        `UNR ${unrNo}`,
        (reason: string) => {
          this.onApprove(unrNo, 'R', reason);
        },
        'reject',
        'Reject'
      );
    } else {
      this.sweetAlertService.confirm(`Are you sure you want to approve UNR: <br><b>${unrNo}</b>`, { confirmButtonText: 'Yes, Approve' }).then((result) => {
        if (result.isConfirmed) {
          this.onApprove(unrNo, 'A');
        }
      });
    }
  }

  onApprove(unrNo: any, type: string, reason?: string) {
    const payload = {
      "FilterJson": {
        "ReportId": "369",
        "Type": type,
        "User": this.docketService.BaseUserCode,
        "Finyear": "2026",
        "Brcd": this.docketService.Location,
        "COMPANY_CODE": "C003",
        "UNRNO": unrNo,
        "Remark": reason || ''
      }
    }
    this.isLoading = true;
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoading = false;

      if (type === 'R') {
        this.sweetAlertService.success(`UNR <b>${unrNo}</b> rejected successfully!`);
        this.getUNRApprovalList();
      } else {
        if (response && response.Table1 && response.Table1.length > 0) {
          this.successData = response.Table1[0];
          if (!this.successData.UNRNO) this.successData.UNRNO = unrNo;

          this.modalRef = this.modalService.show(this.SuccessModalRef, { class: 'modal-md modal-dialog-centered hcc-view-modal-custom', backdrop: true });
          this.getUNRApprovalList();
        } else {
          this.sweetAlertService.success(`UNR <b>${unrNo}</b> approved successfully!`);
          this.getUNRApprovalList();
        }
      }
    }, () => {
      this.isLoading = false;
    });

  }

  closeSuccessModal() {
    this.modalRef?.hide();
  }

  viewApprovedVoucher() {
    this.closeSuccessModal();
    const vNo = this.successData?.VoucherNo || this.successData?.VOUCHERNO || this.successData?.voucherNo;
    if (vNo) {
      this.openVoucherView(vNo);
    }
  }

  copyApprovedVoucher() {
    if (this.successData && this.successData.VoucherNo) {
      navigator.clipboard.writeText(this.successData.VoucherNo);
      alert('Voucher No copied to clipboard!');
    }
  }

}
