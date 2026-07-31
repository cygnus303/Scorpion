import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { ExportService } from 'app/shared/services/export.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vendor-reports',
  standalone: true,
  imports: [CommonModule, BsDatepickerModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vendor-reports.component.html',
  styleUrl: './vendor-reports.component.scss'
})
export class VendorReportsComponent {
  public activeReport: string = 'billing'; // 'billing' | 'ledger' | 'dnr' | ''
  public billingSummary: any = null;
  public listSubscription?: Subscription;

  public billingForm!: FormGroup;

  constructor(
    private dynamicDataService: DynamicDataService,
    private exportService: ExportService
  ) {}

  ngOnInit(){
   this.billingBuildForm();
  }

  billingBuildForm(){
    const today=new Date()
    this.billingForm = new FormGroup({
      fromDate: new FormControl(today),
      toDate: new FormControl(today),
      docNo: new FormControl('')
    });
  }



   openReport(report: string) {
    if (this.activeReport === report) {
      this.activeReport = ''; // Toggle off if clicked again
    } else {
      this.activeReport = report;
    }
  }

  formatDateToString(dStr: any) {
    if (!dStr) return '';
    let d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

   getBillingSummary () {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }

    const payload = {
      FilterJson: {
        "ReportId":"04",
        "UserName":"V0100",
        "BillNo":this.billingForm.value.docNo,
        "StartDt": this.formatDateToString(this.billingForm.value.fromDate),
        "EndDt": this.formatDateToString(this.billingForm.value.toDate),
        "Type":"1"
      }
    };

    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        if (res) {
          if (res.Table3 && res.Table3.length > 0) {
            this.billingSummary = res.Table3;
            this.exportService.exportToZip(res.Table3, 'Vendor_Billing_Summary');
          } else {
            console.warn('No data found for the selected criteria.');
          }
        }
      },
      error: (err: any) => {
        console.error('API Error:', err);
      }
    });
  }


}
