import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-thc-list',
  standalone: true,
  imports: [NgSelectModule,CommonModule,ReactiveFormsModule,BsDatepickerModule,PaginationComponent],
  templateUrl: './thc-list.component.html',
  styleUrl: './thc-list.component.scss'
})
export class ThcListComponent {
  public isLoading: boolean = false;
  public summaryData:any;
  public THCFilterForm !:FormGroup;
  public pagination={
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  };
  statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Departed', label: 'Departed', color: 'departed', bg: 'var(--teal)', count: 0 },
    { value: 'Completed journey', label: 'Completed Journey', color: 'completed-journey', bg: 'var(--orange)', count: 0 },
    { value: 'Billed', label: 'Billed', color: 'billed', bg: 'var(--accent-hover)', count: 0 },
    { value: 'Cancelled', label: 'Cancelled', color: 'cancelled', bg: 'var(--red)', count: 0 },
  ];

}
