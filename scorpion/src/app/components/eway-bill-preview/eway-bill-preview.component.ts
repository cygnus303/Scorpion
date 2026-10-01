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
    const date = this.formatDate(item.transporter_document_date);
    
    if (!veh && docNo && date) {
        return `& ${docNo} & ${date}`;
    }
    
    const parts = [];
    if (veh) parts.push(veh);
    if (docNo) parts.push(docNo);
    if (date) parts.push(date);
    
    return parts.join(' & ');
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return '';
    
    const match = String(dateStr).match(/^(\d{2})\/(\d{2})\/(\d{4})(?: (.+))?$/);
    if (match) {
      const day = match[1];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = parseInt(match[2], 10) - 1;
      const year = match[3];
      const time = match[4];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${day} ${monthNames[monthIndex]} ${year}${time ? ' ' + time : ''}`;
      }
    }
    
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate().toString().padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      
      let timeStr = '';
      if (String(dateStr).includes('T') || String(dateStr).match(/\d{2}:\d{2}/)) {
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        timeStr = ` ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
      }
      
      return `${day} ${month} ${year}${timeStr}`;
    }
    
    return dateStr;
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
