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

@Component({
  selector: 'app-unr-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, UnrApprovalComponent,FormsModule,BsDatepickerModule,MrViewComponent],
  templateUrl: './unr-list.component.html',
  styleUrl: './unr-list.component.scss'
})
export class UNRListComponent {
  public listSubscription?: Subscription;
  public fetchSubject = new Subject<void>();
  public activeTab: string = 'Customer';
  public isLoading:boolean=false;
  public unrList: any[] = [];
  public isAllSelected: boolean = false;
  @ViewChild(UnrApprovalComponent) unrApprovalComp!: UnrApprovalComponent;
  public config = {
    FromDt: new Date(),
    ToDt: new Date(),
    Status: 'ALL',
    PageNo: 1,
    PageSize: 10,
    totalRecords: 0,
    UNRNO: '',
    searchText: ''
  };

  statusList = [
    { label: 'All Status', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Pending Approval', value: 'PendingApproval' },

  ];

  constructor(private docketService:DocketService,private dynamicDataService:DynamicDataService){}

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getList() {
    if (this.activeTab === 'approval' && this.unrApprovalComp) {
      this.unrApprovalComp.getUNRApprovalList(this.config);
    }
    else if(this.activeTab === 'Customer' ){
      this.getUNRList();
    }
  }

  onSearchChange() {
    this.config.PageNo = 1;
    this.unrApprovalComp.fetchSubject.next();
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

  getUNRList(){
  if (this.listSubscription) { this.listSubscription.unsubscribe(); }
    // if (config) {
    //   this.lastConfig = { ...config };
    //   // If parent passes PageNo, you can optionally sync it, but usually pagination is handled locally or synced
    //   if (config.PageNo) {
    //     this.pagination.page = config.PageNo;
    //   }
    // }

    const payload = {
      "FilterJson": {
        "ReportId": "665",
        "FromDt": this.formatDate(this.config.FromDt),
        "ToDt": this.formatDate(this.config.ToDt),
        "Status": '',
        "UNRNO": '',
        "PageNo": this.config.PageNo,
        "PageSize": this.config.PageSize
      }
    }
    this.isLoading = true;
    this.listSubscription=this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoading = false;
      if (response?.Table1) {
        this.unrList = response.Table1;
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

  checkIfAllSelected() {
    if (this.unrList.length === 0) {
      this.isAllSelected = false;
      return;
    }
    this.isAllSelected = this.unrList.every(item => item.isChecked);
  }

}
