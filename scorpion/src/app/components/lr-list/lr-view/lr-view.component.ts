import { Component, TemplateRef, ViewChild } from '@angular/core';
import { LrService } from 'app/shared/services/lr.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lr-view',
  standalone: true,
  providers: [BsModalService],
  imports: [CommonModule],
  templateUrl: './lr-view.component.html',
  styleUrl: './lr-view.component.scss'
})
export class LrViewComponent {
  public isLoading = false;
  public modalRef!: BsModalRef;
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;

  constructor(private modalService: BsModalService,private lrService: LrService) { }

  public lrDetails: any = null;
  public boxDetails: any[] = [];

  showPopup(row: any) {
    if (!row) return;
    this.isLoading = true;

    this.lrService.lrViewDetail(row).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          const data =  res;
          this.lrDetails = data.Header || null;
          this.boxDetails = data.BoxDetails || [];
          this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching LR details', err);
      }
    });
  }



  parseDate(val: any): any {
    if (!val) return val;
    // Handle specific string format "dd/MM/yyyy HH:mm"
    if (typeof val === 'string') {
      const parts = val.trim().split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '00:00:00';
      const dateParts = datePart.split('/');
      if (dateParts.length === 3) {
        // Assume dd/MM/yyyy => return yyyy-MM-ddTHH:mm:ss for standard Date parsing
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timePart}`;
      }
    }
    return val;
  }

  printDocket() {
    const printContent = document.querySelector('.docket-container');
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
          <title>Print Docket</title>
          ${styles}
          <style>
             @page { margin: 0; }
             @media print {
                body { padding: 10mm; margin: 0; background: white; }
                .docket-container { box-shadow: none !important; height: auto !important; max-height: none !important; overflow: visible !important; display: block !important; }
                .docket-content { overflow: visible !important; }
                .docket-header { position: static !important; }
                .no-print { display: none !important; }
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
