import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';

@Component({
  selector: 'app-stock-update-layout',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent],
  templateUrl: './stock-update-layout.component.html',
  styleUrl: './stock-update-layout.component.scss'
})
export class StockUpdateLayoutComponent {
  public isLoading: boolean = false;
  public prsData: any[] = [
    { thcNo: 'THC/2526/00001', date: '21-Mar-2026', dockets: 24, mf: '3 MFs', pending: 5, vType: 'Own', vName: 'ABC Logistics', arrival: '21-Mar-2026', location: 'Mumbai', unloading: 'US/2526/00001' },
    { thcNo: 'THC/2526/00002', date: '21-Mar-2026', dockets: 12, mf: '2 MFs', pending: 3, vType: 'Market', vName: 'XYZ Transport', arrival: '21-Mar-2026', location: 'Delhi', unloading: 'US/2526/00002' },
    { thcNo: 'THC/2526/00003', date: '21-Mar-2026', dockets: 18, mf: '4 MFs', pending: 18, vType: 'Own', vName: 'ABC Logistics', arrival: '21-Mar-2026', location: 'Pune', unloading: 'US/2526/00003' },
    { thcNo: 'THC/2526/00004', date: '21-Mar-2026', dockets: 31, mf: '2 MFs', pending: 4, vType: 'Market', vName: 'PQR Carriers', arrival: '21-Mar-2026', location: 'Agra', unloading: 'US/2526/00004' },
    { thcNo: 'THC/2526/00005', date: '20-Mar-2026', dockets: 8, mf: '1 MF', pending: 2, vType: 'Own', vName: 'ABC Logistics', arrival: '20-Mar-2026', location: 'Nashik', unloading: 'US/2526/00005' },
    { thcNo: 'THC/2526/00006', date: '21-Mar-2026', dockets: 22, mf: '3 MFs', pending: 22, vType: 'Market', vName: 'LMN Freight', arrival: '21-Mar-2026', location: 'Surat', unloading: 'US/2526/00006' },
    { thcNo: 'THC/2526/00007', date: '20-Mar-2026', dockets: 15, mf: '2 MFs', pending: 3, vType: 'Own', vName: 'ABC Logistics', arrival: '20-Mar-2026', location: 'Jaipur', unloading: 'US/2526/00007' },
    { thcNo: 'THC/2526/00008', date: '20-Mar-2026', dockets: 9, mf: '1 MF', pending: 2, vType: 'Market', vName: 'RST Transport', arrival: '20-Mar-2026', location: 'Surat', unloading: 'US/2526/00008' }
  ];

  public config = {
    fromDateStr: new Date(new Date().setDate(new Date().getDate() - 7)),
    toDateStr: new Date(),
    statusFilter: 'All',
    page: 1,
    pageSize: 10,
    totalRecords: 8,
    totalPages: 1,
    searchText: ''
  };
}
