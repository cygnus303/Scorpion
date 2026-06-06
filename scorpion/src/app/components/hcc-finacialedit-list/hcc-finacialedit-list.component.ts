import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HCCviewComponent } from './hccview/hccview.component';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-hcc-finacialedit-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, HCCviewComponent],
  templateUrl: './hcc-finacialedit-list.component.html',
  styleUrl: './hcc-finacialedit-list.component.scss',
  providers: [BsModalService]
})
export class HccFinacialeditListComponent {
  @ViewChild('HCCviewComponent') HCCviewComponent!: HCCviewComponent;

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
  HCCTypeList = [
    { label: 'All Status', value: 'All' },
    { label: 'Loading HCC', value: 'Loading' },
    { label: 'Unloading HCC', value: 'Unloading' },
  ];

  openHCCview() {
    this.HCCviewComponent.showPopup();
  }

}
