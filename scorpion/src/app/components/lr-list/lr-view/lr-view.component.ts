import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-lr-view',
  standalone: true,
  providers: [BsModalService],
  imports: [],
  templateUrl: './lr-view.component.html',
  styleUrl: './lr-view.component.scss'
})
export class LrViewComponent {
  public isLoading = false;
  public modalRef!: BsModalRef;
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;

  constructor(private modalService: BsModalService) { }

  showPopup(row: any) {
    this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
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
