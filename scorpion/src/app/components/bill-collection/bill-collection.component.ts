import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bill-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule, PaginationComponent],
  templateUrl: './bill-collection.component.html',
  styleUrl: './bill-collection.component.scss'
})
export class BillCollectionComponent implements OnInit {
  public isLoading: boolean = false;
  public billList: any[] = [];
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

  ngOnInit() {
    this.getList();
  }

  setPage(event: any) {
    this.config.PageNo = event;
    this.getList();
  }

  getList() {
    this.isLoading = true;
    setTimeout(() => {
      this.billList = [
        {
          sno: 1,
          BILLNO: 'INV-2026-001',
          CUSTCODE: 'C00120',
          CUSTNAME: 'ALKEM LABORATORIES LTD',
          BILLBRANCH: 'Mumbai (HO)',
          BILLTYPE: 'Tax Invoice',
          TAXABLEAMT: 50000.00,
          GSTAMT: 9000.00,
          TOTALAMT: 59000.00,
          PENDINGAMT: 59000.00,
          MRNO: 'MR-001',
          STATUS: 'Pending'
        },
        {
          sno: 2,
          BILLNO: 'INV-2026-002',
          CUSTCODE: 'C00145',
          CUSTNAME: 'SUN PHARMA LTD',
          BILLBRANCH: 'Pune',
          BILLTYPE: 'Export Invoice',
          TAXABLEAMT: 120000.00,
          GSTAMT: 0.00,
          TOTALAMT: 120000.00,
          PENDINGAMT: 60000.00,
          MRNO: 'MR-002',
          STATUS: 'Partial'
        },
        {
          sno: 3,
          BILLNO: 'INV-2026-003',
          CUSTCODE: 'C00188',
          CUSTNAME: 'CIPLA LTD',
          BILLBRANCH: 'Delhi',
          BILLTYPE: 'Tax Invoice',
          TAXABLEAMT: 25000.00,
          GSTAMT: 4500.00,
          TOTALAMT: 29500.00,
          PENDINGAMT: 0.00,
          MRNO: 'MR-003',
          STATUS: 'Collected'
        },
        {
          sno: 4,
          BILLNO: 'INV-2026-004',
          CUSTCODE: 'C00210',
          CUSTNAME: 'LUPIN LTD',
          BILLBRANCH: 'Ahmedabad',
          BILLTYPE: 'Tax Invoice',
          TAXABLEAMT: 40000.00,
          GSTAMT: 7200.00,
          TOTALAMT: 47200.00,
          PENDINGAMT: 47200.00,
          MRNO: '-',
          STATUS: 'Pending'
        },
        {
          sno: 5,
          BILLNO: 'INV-2026-005',
          CUSTCODE: 'C00255',
          CUSTNAME: 'DR REDDYS LABS',
          BILLBRANCH: 'Hyderabad',
          BILLTYPE: 'Tax Invoice',
          TAXABLEAMT: 75000.00,
          GSTAMT: 13500.00,
          TOTALAMT: 88500.00,
          PENDINGAMT: 20000.00,
          MRNO: 'MR-004',
          STATUS: 'Partial'
        }
      ];
      this.isLoading = false;
      this.config.totalRecords = this.billList.length;
      this.config.totalPages = 1;
    }, 500);
  }

  getStatusStyles(item: any) {
    if (item.STATUS === 'Pending') {
      return { 'background': '#fff8e1', 'color': '#f57f17', 'border': '1px solid #ffe082' };
    } else if (item.STATUS === 'Partial') {
      return { 'background': '#e3f2fd', 'color': '#1565c0', 'border': '1px solid #90caf9' };
    } else if (item.STATUS === 'Collected') {
      return { 'background': '#e8f5e9', 'color': '#2e7d32', 'border': '1px solid #a5d6a7' };
    }
    return {};
  }
}
