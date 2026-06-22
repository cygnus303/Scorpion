import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { UnrApprovalComponent } from './unr-approval/unr-approval.component';
import { MrViewComponent } from './mr-view/mr-view.component';

@Component({
  selector: 'app-unr-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, UnrApprovalComponent,FormsModule,BsDatepickerModule,MrViewComponent],
  templateUrl: './unr-list.component.html',
  styleUrl: './unr-list.component.scss'
})
export class UNRListComponent {
  @ViewChild(UnrApprovalComponent) unrApprovalComp!: UnrApprovalComponent;


  public activeTab: string = 'dateRange';

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


  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getList() {
    if (this.activeTab === 'approval' && this.unrApprovalComp) {
      this.unrApprovalComp.getUNRApprovalList(this.config);
    }
  }
    onSearchChange() {
    this.config.PageNo = 1;
    this.unrApprovalComp.fetchSubject.next();
  }

}
