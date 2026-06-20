import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-lr-print-view',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './lr-print-view.component.html',
  styleUrl: './lr-print-view.component.scss'
})
export class LrPrintViewComponent {
  public isLoading = false;
  public modalRef!: BsModalRef;
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;

  public lrDetails: any = null;
  public boxDetails: any[] = [];
  public charges: any[] = [];

  constructor(private modalService: BsModalService, private lrService: LrService) { }

  showPopup(row: any) {
    if (!row || !row.LrNumber) return;
    
    this.isLoading = true;
    this.lrService.printView(row.LrNumber).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.success) {
          this.lrDetails = res.data;
          this.modalRef = this.modalService.show(this.TemplateRef, { 
            class: 'modal-xl modal-dialog-centered custom-print-modal', 
            backdrop: true 
          });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching LR print view details', err);
      }
    });
  }

  printDocket() {
    const printContent = document.querySelector('.lr-print-wrapper');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print LR</title>
          ${styles}
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
             @page { margin: 5mm; }
             @media print {
                body { padding: 0 !important; margin: 0 !important; background: white; -webkit-print-color-adjust: exact; color-adjust: exact; zoom: 0.85; }
                .modal-body { padding: 0 !important; }
                .lr-print-wrapper { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; border: none !important; }
                .mb-4 { margin-bottom: 10px !important; }
                .pb-4 { padding-bottom: 10px !important; }
                .mt-4 { margin-top: 10px !important; }
                .pt-3 { padding-top: 10px !important; }
                .no-print { display: none !important; }
                .card, .border, table { page-break-inside: avoid; break-inside: avoid; }
                tr { page-break-inside: avoid; break-inside: avoid; }
                .custom-grid .col-md-6 { width: 50% !important; float: left; }
                .row { display: flex !important; flex-wrap: wrap !important; }
                .col-6 { width: 50% !important; }
                .col-12 { width: 100% !important; }
             }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  }
}
