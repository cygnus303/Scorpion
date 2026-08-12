import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-bill-invoice-view',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './bill-invoice-view.component.html'
})
export class BillInvoiceViewComponent {
  public selectedInvoiceBill: any;
  public billDetail: any;
  public billList: any[] = [];
  public oscChargesList: any[] = [];
  
  public dynamicColumns: string[] = [];
  public dynamicTotals: any = {};
  public totalOscOther: number = 0;
  @ViewChild('TemplateInvoice', { static: true }) TemplateInvoice!: TemplateRef<any>;

  constructor(
    public modalRef: BsModalRef,
    public modalService: BsModalService,
    public dynamicDataService: DynamicDataService
  ) { }

  showPopup(data: any) {
    this.getBillData(data);
    this.modalRef = this.modalService.show(this.TemplateInvoice, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
  }

  getBillData(data: any) {
    const payload = {
      "FilterJson": {
        "ReportId": "375",
        "BillNo": data
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      if (response) {
        if (response.Table1) {
          this.billList = response.Table1;
        } else {
          this.billList = [];
        }

        if (response.Table2 && response.Table2.length > 0) {
          this.oscChargesList = response.Table2;
          
          // Extract dynamic columns (excluding fixed columns)
          const allKeys = Object.keys(response.Table2[0]);
          this.dynamicColumns = allKeys.filter(key => key !== 'DOCKNO' && key !== 'OtherCharges');
          
          // Calculate totals dynamically
          this.dynamicTotals = {};
          this.dynamicColumns.forEach(col => {
            this.dynamicTotals[col] = this.oscChargesList.reduce((sum, item) => sum + (Number(item[col]) || 0), 0);
          });
          
          this.totalOscOther = this.oscChargesList.reduce((sum, item) => sum + (Number(item.OtherCharges) || 0), 0);
        } else {
          this.oscChargesList = [];
          this.dynamicColumns = [];
          this.dynamicTotals = {};
          this.totalOscOther = 0;
        }

        if (response.Table4 && response.Table4.length > 0) {
          this.billDetail = response.Table4[0];
        } else {
          this.billDetail = null;
        }
      } else {
        this.billList = [];
        this.billDetail = null;
      }
    });
  }

  get totalChargeWt() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.CHRGWT || 0), 0) || 0;
  }

  get totalRate() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.FRT_RATE || 0), 0) || 0;
  }

  get totalFreight() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.FREIGHT || 0), 0) || 0;
  }

  get totalOtherCharges() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.OtherCharges || 0), 0) || 0;
  }

  get totalSubTotal() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.SubTotal || 0), 0) || 0;
  }

  get totalDocumentCharges() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.DocumentCharges || 0), 0) || 0;
  }

  get totalFuelSurcharge() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.FuelSurcharge || 0), 0) || 0;
  }

  get totalIGST() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.IGST || 0), 0) || 0;
  }

  get totalSGST() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.SGST || 0), 0) || 0;
  }

  get totalCGST() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.CGST || 0), 0) || 0;
  }

  downloadInvoice() {
    const printContents = document.querySelector('.invoice-print')?.outerHTML;
    if (!printContents) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Invoice</title>
            <base href="${window.location.origin}/">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
              body { 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                background-color: white;
              }
              .invoice-print, .invoice-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 15px !important;
                box-shadow: none !important;
              }
              @media print {
                @page { margin: 5mm; size: A4 portrait; }
                body { zoom: 90%; } /* Chrome/Edge scaling */
              }
            </style>
          </head>
          <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  closeInvoiceView() {
    this.modalRef.hide();
  }

  getBillDate(dockno: string): string {
    if (!this.billList) return '-';
    const bill = this.billList.find(b => b.dockno === dockno || b.DOCKNO === dockno);
    return bill ? (bill.DOCKDT || '-') : '-';
  }

  formatColumnName(col: string): string {
    if (!col) return '';
    return col.replace(/_Charges|_Charge/gi, ' CHG').replace(/_/g, ' ').toUpperCase();
  }
}
