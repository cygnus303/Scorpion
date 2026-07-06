import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { LrViewComponent } from 'app/components/lr-list/lr-view/lr-view.component';

@Component({
  selector: 'app-hccview',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule,LrViewComponent],
  templateUrl: './hccview.component.html',
  styleUrl: './hccview.component.scss'
})
export class HCCviewComponent {
  public modalRef!: BsModalRef;
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;
   @ViewChild('LrViewComponent') LrViewComponent!: LrViewComponent;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  public summary: any = {};
  public dataList: any[] = [];
  public isLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private thcMasterService: THCMasterService
  ) { }

  showPopup(row: any) {
    if (!row) return;
    this.isLoading = true;
    const payload = {
      FilterJson: {
        HcNumber: row.HCNumber,
        DocumentNo: row.DocumentNo
      }
    };

    this.thcMasterService.getHCCViewDetail(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.summary = res.summary || {};
          this.dataList = res.data || [];
          this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching HCC details', err);
      }
    });
  }

  getTotalPkgs(): number {
    return this.dataList.reduce((acc, curr) => acc + (curr.PKG_Load || 0), 0);
  }

  getTotalWeight(): number {
    return this.dataList.reduce((acc, curr) => acc + (curr.CHRGWT_Load || 0), 0);
  }

   getHccAmount(): number {
    return this.dataList.reduce((acc, curr) => acc + (curr.HCAmt || 0), 0);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  printHccModal() {
    const printContent = document.querySelector('.modal-content');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1200px';
    iframe.style.height = '1200px';
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
          <base href="${document.baseURI}">
          <title>HCC Voucher</title>
          ${styles}
          <style>
             @page { margin: 0; size: portrait; }
             body { 
                margin: 0; 
                padding: 10mm; 
                background: #f4f5f7 !important; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
                color-adjust: exact !important; 
             }
             @media print {
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
                body { margin: 0; padding: 10mm; background: #f4f5f7 !important; }
                .modal-content, .modal-body { overflow: visible !important; border: none !important; box-shadow: none !important; background: transparent !important; width: 100% !important; }
                .docket-tbl-wrap { overflow: visible !important; width: 100% !important; }
                .docket-tbl { width: 100% !important; max-width: 100% !important; table-layout: auto !important; }
                .docket-tbl th, .docket-tbl td { 
                   white-space: normal !important; 
                   word-wrap: break-word !important; 
                   word-break: break-word !important;
                   padding: 4px 2px !important; 
                   font-size: 9px !important; 
                }
                .modal-header-actions, .modal-footer-btns { display: none !important; }
                .print-only { display: none !important; }
                .detail-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; }
             }
          </style>
        </head>
        <body>
          <div class="modal-content" style="border: none;">
             ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 1000);
    };
  }

  closeHccModal() {
    this.close();
  }

  openLRView(row: any){
    this.LrViewComponent.showPopup(row);
  }
}
