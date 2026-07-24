import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-vendor-reports',
  standalone: true,
  imports: [CommonModule,BsDatepickerModule,FormsModule],
  templateUrl: './vendor-reports.component.html',
  styleUrl: './vendor-reports.component.scss'
})
export class VendorReportsComponent {
  public activeReport: string = 'billing'; // 'billing' | 'ledger' | 'dnr' | ''

  openReport(report: string) {
    if (this.activeReport === report) {
      this.activeReport = ''; // Toggle off if clicked again
    } else {
      this.activeReport = report;
    }
  }
}
