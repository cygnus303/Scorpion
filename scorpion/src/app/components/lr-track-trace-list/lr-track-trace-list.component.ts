import { Component } from '@angular/core';

@Component({
  selector: 'app-lr-track-trace-list',
  standalone: true,
  imports: [],
  templateUrl: './lr-track-trace-list.component.html',
  styleUrl: './lr-track-trace-list.component.scss'
})
export class LrTrackTraceListComponent {
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
}
