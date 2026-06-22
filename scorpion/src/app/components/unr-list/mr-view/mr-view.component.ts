import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-mr-view',
  standalone: true,
  imports: [CommonModule],
  providers:[BsModalService],
  templateUrl: './mr-view.component.html',
  styleUrl: './mr-view.component.scss'
})
export class MrViewComponent {
  public modalRef!: BsModalRef;
  public isLoading: boolean = false;
  public summary: any = {};
  public dataList: any[] = [];
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;

  constructor(private thcMasterService:THCMasterService,
    private modalService:BsModalService
  ){}


  showPopup(row: any) {
    if (!row) return;
    this.isLoading = true;
    const payload = {
      FilterJson: {
        ReportId: "368",
        VoucherNo: row
      }
    };

    this.thcMasterService.getHCCDynamicData(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          if (res.Table1 && res.Table1.length > 0) {
            this.summary = res.Table1[0];
          }
          if (res.Table2) {
            this.dataList = res.Table2;
          }
          this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching HCC details', err);
      }
    });
  }

  printVoucher() {
    const printContent = document.getElementById('voucherPaper');
    if (!printContent) return;

    let printIframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'print-iframe';
      printIframe.style.position = 'absolute';
      printIframe.style.width = '0px';
      printIframe.style.height = '0px';
      printIframe.style.border = 'none';
      document.body.appendChild(printIframe);
    }

    // Get all style elements from the current document to maintain the exact UI
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el: any) => {
        if (el.tagName.toLowerCase() === 'link') {
          return `<link rel="stylesheet" href="${el.href}">`;
        }
        return el.outerHTML;
      })
      .join('\n');

    const iframeDoc = printIframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Print Voucher</title>
          ${styles}
          <style>
            body { 
              background: #fff; 
              padding: 20px; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            .voucher-paper { 
              box-shadow: none !important; 
              border: 1px solid #ccc !important; 
              max-width: 100% !important; 
              margin: 0 !important; 
            }
            @media print {
              @page { margin: 10mm; }
              .voucher-paper { border: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait a brief moment for styles to apply in the iframe, then print
    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    }, 400);
  }
}
