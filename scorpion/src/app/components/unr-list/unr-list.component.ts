import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { UnrApprovalComponent } from './unr-approval/unr-approval.component';
import { MrViewComponent } from './mr-view/mr-view.component';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DocketService } from 'app/shared/services/docket.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { ExportService } from 'app/shared/services/export.service';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
@Component({
  selector: 'app-unr-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, UnrApprovalComponent, FormsModule, BsDatepickerModule, MrViewComponent],
  templateUrl: './unr-list.component.html',
  styleUrl: './unr-list.component.scss'
})
export class UNRListComponent {
  public listSubscription?: Subscription;
  public fetchSubject = new Subject<void>();
  public activeTab: string = 'Customer';
  public isLoading: boolean = false;
  public unrList: any[] = [];
  public isAllSelected: boolean = false;
  public isCSVLoading: boolean = false;
  public customerData: any[] = [];
  public notFoundTextValue = 'Enter at least 3 characters';
  @ViewChild(UnrApprovalComponent) unrApprovalComp!: UnrApprovalComponent;
  @ViewChild('MrViewComponent') MrViewComponent!: MrViewComponent;

  public isSuccess: boolean = false;
  public successData: any = {
    urnNo: '',
    allocCount: 0,
    totalAmt: 0,
    custCount: 0
  };

  public config = {
    FromDt: new Date(),
    ToDt: new Date(),
    Status: 'ALL',
    PageNo: 1,
    PageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    UNRNO: '',
    SearchText: '',
  };

  statusList = [
    { label: 'All Status', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Pending Approval', value: 'PendingApproval' },

  ];

  constructor(
    private docketService: DocketService,
    private exportService: ExportService,
    private dynamicDataService: DynamicDataService,
    private basicDetailService: BasicDetailService,
    private prsdrsApiService: PRSDRSApiService,
    public sweetAlertService: SweetAlertService
  ) { }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getList() {
    if (this.activeTab === 'approval' && this.unrApprovalComp) {
      this.unrApprovalComp.getUNRApprovalList(this.config);
    }
    else if (this.activeTab === 'Customer') {
      this.getUNRList();
    }
  }

  onSearchChange() {
    this.config.PageNo = 1;
    if (this.activeTab === 'approval' && this.unrApprovalComp) {
      this.unrApprovalComp.lastConfig = { ...this.unrApprovalComp.lastConfig, ...this.config };
      this.unrApprovalComp.fetchSubject.next();
    } else {
      this.fetchSubject.next();
    }
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
      this.getUNRList();
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

  getUNRList() {
    if (this.listSubscription) { this.listSubscription.unsubscribe(); }

    const payload = {
      "FilterJson": {
        "ReportId": "665",
        "FromDt": this.formatDate(this.config.FromDt),
        "ToDt": this.formatDate(this.config.ToDt),
        "Status": '',
        "UNRNO": '',
        "PageNo": this.config.PageNo,
        "PageSize": this.config.PageSize,
        "SearchText": this.config.SearchText
      }
    }
    this.isLoading = true;
    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoading = false;
      if (response?.Table1) {
        this.unrList = response.Table1.map((x: any, index: number) => ({ ...x, sno: index + 1 }));
        const totalRecords = this.unrList.length > 0 ? (this.unrList[0].TotalRows || this.unrList[0].TotalCount || this.unrList.length) : 0;
        this.config.totalRecords = totalRecords;
        this.config.totalPages = Math.ceil(totalRecords / this.config.PageSize) || 1;
        this.checkIfAllSelected();
      }
    }, () => {
      this.isLoading = false;
    });
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.isAllSelected = checked;
    this.unrList.forEach(item => item.isChecked = checked);
  }

  checkUncheckAll() {
    this.unrList.forEach(item => {
      item.isChecked = this.isAllSelected;
    });
  }

  isAllSelectedChange() {
    this.isAllSelected = this.unrList.every(item => item.isChecked);
  }

  get hasSelectedRows(): boolean {
    return this.unrList && this.unrList.some(item => item.isChecked);
  }

  checkIfAllSelected() {
    if (this.unrList.length === 0) {
      this.isAllSelected = false;
      return;
    }
    this.isAllSelected = this.unrList.every(item => item.isChecked);
  }

  setPage(p: number) {
    if (this.config.PageNo === p) return;
    this.config.PageNo = p;
    this.getUNRList();
  }

  openMRView(mrNo: string) {
    this.MrViewComponent.showPopup(mrNo);
  }

  getCustomerList(event: any) {
    const searchText = event?.term || '';
    if (!searchText || searchText.length < 3) {
      this.customerData = [];
      this.notFoundTextValue = 'Enter at least 3 characters';
      return;
    }

    const payload = {
      "FilterJson": {
        "ReportId": "667",
        "SearchText": searchText
      }
    };

    this.notFoundTextValue = 'Searching...';
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      if (response && response.Table1) {
        this.customerData = response.Table1;
        this.notFoundTextValue = 'No matches found';
      } else {
        this.customerData = [];
        this.notFoundTextValue = '';
      }
    }, () => {
      this.customerData = [];
      this.notFoundTextValue = '';
    });
  }

  resetCustomerDropdown() {
    this.customerData = [];
    this.notFoundTextValue = 'Enter at least 3 characters';
  }

  onCustomerSelect(selectedId: any, rowItem: any) {
    if (selectedId) {
      const selectedItem = this.customerData.find(c => (c.CUSTCD || c.CUSTCODE || c.CODE) === selectedId);
      if (selectedItem) {
        rowItem.newCustCode = selectedItem.CUSTCODE || selectedItem.CUSTCD || selectedItem.custcd || selectedItem.CODE;
        rowItem.newCustName = selectedItem.CUSTNAME || selectedItem.CUSTNM || selectedItem.custnm || selectedItem.NAME;
      }
    } else {
      rowItem.newCustCode = null;
      rowItem.newCustName = null;
    }
  }

  addRow(item: any, index: number) {
    if (!item.selectedCustomer) {
      this.sweetAlertService.info("Please Select Customer Name First");
      return;
    }
    const amount = parseFloat(item.transferAmount);
    if (!amount || amount <= 0) {
      this.sweetAlertService.info("Please Enter Transfer Amount First");
      return;
    }

    const available = parseFloat(item.CHECKAMOUNT);
    if (amount > available) {
      this.sweetAlertService.info("Transfer Amount cannot exceed check amount ₹ " + available.toFixed(2));
      return;
    }

    if (!item.isSplit) {
      item.originalCheckNo = item.CHECKNO;
      item.CHECKNO = item.originalCheckNo + ' /A';
      item.isSplit = true;
      item.splitIndex = 1;
    }

    const nextIndex = item.splitIndex + 1;
    const nextSuffix = ' /' + String.fromCharCode(64 + nextIndex);

    const newRow = {
      ...item,
      CHECKNO: item.originalCheckNo + nextSuffix,
      CHECKAMOUNT: (available - amount).toFixed(2),
      transferAmount: '',
      selectedCustomer: null,
      newCustCode: null,
      newCustName: null,
      isSubRow: true,
      splitIndex: nextIndex,
      isChecked: true,
      isLocked: false
    };

    item.isLocked = true;

    this.unrList.splice(index + 1, 0, newRow);
  }

  removeRow(index: number) {
    if (index > 0 && this.unrList[index - 1]) {
      this.unrList[index - 1].isLocked = false;
    }
    this.unrList.splice(index, 1);
  }

  getStatus(item: any): string {
    const tAmt = parseFloat(item.transferAmount) || 0;
    if (tAmt <= 0) return 'Pending';

    let originalCheck = item.originalCheckNo || item.CHECKNO;
    let totalTransferred = 0;
    let totalCheckAmount = parseFloat(item.CHECKAMOUNT) || 0;

    const relatedRows = this.unrList.filter(x => (x.originalCheckNo || x.CHECKNO) === originalCheck);
    
    if (relatedRows.length > 0) {
      const parentRow = relatedRows.find(r => !r.isSubRow) || relatedRows[0];
      totalCheckAmount = parseFloat(parentRow.CHECKAMOUNT) || 0;
      totalTransferred = relatedRows.reduce((sum, r) => sum + (parseFloat(r.transferAmount) || 0), 0);
    }

    if (!item.isSubRow && totalTransferred > 0 && totalTransferred >= totalCheckAmount) {
      return '✓ Adjusted';
    }

    return 'Partially Adjusted';
  }

  getStatusStyles(item: any): any {
    const status = this.getStatus(item);
    if (status === '✓ Adjusted') {
      return { 'background-color': '#ecfdf5', 'color': '#047857', 'border': '1px solid #6ee7b7' }; // Green
    } else if (status === 'Partially Adjusted') {
      return { 'background-color': '#e0f2fe', 'color': '#0369a1', 'border': '1px solid #7dd3fc' }; // Blue
    }
    return {};
  }

  onDownload() {
    this.isCSVLoading = true;

    const payload = {
      "FilterJson": {
        "ReportId": "665",
        "FromDate": this.formatDate(this.config.FromDt),
        "ToDate": this.formatDate(this.config.ToDt),
        "IsDownload": 1
      }
    }
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response && response.Table1) {
          this.exportService.exportToCSV(response.Table1, `UNR_List`);
        }
      },
      error: (err: any) => {
        this.isCSVLoading = false;
        console.error('Error downloading CSV', err);
      }
    });

  }

  onSave() {
    const selectedRows = this.unrList.filter(item => {
      if (item.isSubRow && item.originalCheckNo) {
        const parent = this.unrList.find(x => !x.isSubRow && (x.originalCheckNo || x.CHECKNO) === item.originalCheckNo);
        return parent ? parent.isChecked : item.isChecked;
      }
      return item.isChecked;
    });

    if (selectedRows.length === 0) {
      this.sweetAlertService.info("Please select at least one UNR to process");
      return;
    }

    for (const item of selectedRows) {
      if (!item.newCustCode) {
        this.sweetAlertService.info(`Please select a Customer for Check No: ${item.CHECKNO}`);
        return;
      }
      if (!item.transferAmount || parseFloat(item.transferAmount) <= 0) {
        this.sweetAlertService.info(`Please enter a valid transfer amount for Check No: ${item.CHECKNO}`);
        return;
      }
    }

    const unrmList = selectedRows.map(item => ({
      custcode: item.CUSTCODE,
      checkno: item.CHECKNO,
      checkdate: item.CHECKDATE,
      checkamount: item.CHECKAMOUNT?.toString(),
      newcustcode: item.newCustCode,
      transferamt: item.transferAmount?.toString()
    }));

    const payload = {
      unrmList: unrmList,
      baseFinYear: this.docketService.loginUserList.FinYear,
      baseUserName: this.docketService.loginUserList.BaseUserName
    };

    // this.sweetAlertService.showConfirmation('Confirmation', 'Are you sure you want to process this transaction?', 'warning').then((result) => {
      // if (result) {
        this.isLoading = true;
        this.prsdrsApiService.onUNRSubmit(payload).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (res.status === 'SUCCESS') {
              this.isSuccess = true;
              this.successData = {
                urnNo: res.urnNo || 'N/A',
                allocCount: payload.unrmList.length,
                totalAmt: payload.unrmList.reduce((sum: number, item: any) => sum + (parseFloat(item.transferamt || '0') || 0), 0),
                custCount: new Set(payload.unrmList.map((item: any) => item.newcustcode)).size
              };
              this.getUNRList(); // Refresh list after save
            } else {
              this.sweetAlertService.error(res.message || 'Failed to process UNR');
            }
          },
          error: (err: any) => {
            this.isLoading = false;
            this.sweetAlertService.error('An error occurred during submission');
          }
        });
      // }
    // });
  }

  // copyUnrNumber() {
  //   if (this.successData.urnNo) {
  //     navigator.clipboard.writeText(this.successData.urnNo);
  //     this.sweetAlertService.success("UNR Numbers copied to clipboard!");
  //   }
  // }

  closeUnrSuccessAndRedirect() {
    this.isSuccess = false;
  }
}


