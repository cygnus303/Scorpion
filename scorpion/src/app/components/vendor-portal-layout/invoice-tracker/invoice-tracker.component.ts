import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-invoice-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-tracker.component.html',
  styleUrl: './invoice-tracker.component.scss'
})
export class InvoiceTrackerComponent {
  public billDetail:any;
  public billNo: string = '';

  constructor(private dynamicDataService:DynamicDataService){}

  onGetInvoiceData(){
    if (!this.billNo) {
      alert('Please enter a Bill Number');
      return;
    }

    const payload = {
      FilterJson: {
        "ReportId":"03",
        "UserName":"CYGNUSTEAM",
        "BillNo": this.billNo,
        "Type":"1"
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        if (res && res.Table1 && res.Table1.length > 0) {
          this.billDetail = res.Table1[0];
        } else {
          this.billDetail = null;
          alert('No invoice data found for this bill number');
        }
      },
      error: (err: any) => {
        console.error('Error getting invoice data:', err);
        alert('Failed to get invoice data');
      }
    });
  }

}
