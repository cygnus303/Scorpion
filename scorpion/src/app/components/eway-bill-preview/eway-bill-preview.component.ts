import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-eway-bill-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eway-bill-preview.component.html'
})
export class EwayBillPreviewComponent implements OnInit {
  public response: any;
  public partA: any = {};
  public partB: any[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    private sweetAlertService: SweetAlertService
  ) {}

  ngOnInit() {
    if (this.response) {
      if (this.response.Table1 && this.response.Table1.length > 0) {
        this.partA = this.response.Table1[0];
      } else {
        this.partA = this.response;
      }
      
      if (this.response.Table2) {
        this.partB = this.response.Table2;
      }
    }
  }

  getVehicleInfo(item: any): string {
    const veh = item.vehicle_number || '';
    const docNo = (item.tripshtNo && item.tripshtNo !== 0 && item.tripshtNo !== '0') ? item.tripshtNo : '';
    const date = item.transporter_document_date || '';
    
    if (!veh && docNo && date) {
        return `& ${docNo} & ${date}`;
    }
    
    const parts = [];
    if (veh) parts.push(veh);
    if (docNo) parts.push(docNo);
    if (date) parts.push(date);
    
    return parts.join(' & ');
  }

  printEWayBill() {
    const printContents = document.getElementById('print-section')?.innerHTML;
    if (!printContents) {
      this.sweetAlertService.error('Nothing to print');
      return;
    }

    const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(`
        <html>
          <head>
            <title>E-Way Bill - ${this.response?.ewaybillNo || ''}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              @media print {
                body { padding: 0; }
                table { border-collapse: collapse !important; }
                td, th { border: 1px solid #999 !important; }
              }
            </style>
          </head>
          <body onload="setTimeout(function(){ window.print(); window.close(); }, 250)">
            ${printContents}
          </body>
        </html>
      `);
      popupWin.document.close();
    } else {
      this.sweetAlertService.error('Please allow popups for this website to print.');
    }
  }
}
