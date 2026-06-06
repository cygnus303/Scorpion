import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-hcc-finacialedit-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent],
  templateUrl: './hcc-finacialedit-list.component.html',
  styleUrl: './hcc-finacialedit-list.component.scss'
})
export class HccFinacialeditListComponent {
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
  statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Generated', value: 'Generated' },
    { label: 'Arrived', value: 'Arrived' },
    { label: 'Billed', value: 'Billed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'HCC Generated', value: 'HCC Generated' }
  ];

}
