import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-godown-delivery-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './godown-delivery-view.component.html',
  styleUrl: './godown-delivery-view.component.scss',
  providers: [BsModalService]
})
export class GodownDeliveryViewComponent {
  @ViewChild('gdViewTemplate', { static: true }) gdViewTemplate!: TemplateRef<any>;
  @Output() docketClick = new EventEmitter<string>();

  modalRef?: BsModalRef;
  public gdNo: string = '';
  public headerDetails: any = null;
  public docketList: any[] = [];
  public selectedDocket: any = null;
  public isLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService
  ) {}

  openModal(data: any) {
    this.gdNo = data;
    this.headerDetails = null;
    this.docketList = [];
    this.selectedDocket = null;
    this.isLoading = true;

    this.modalRef = this.modalService.show(this.gdViewTemplate, {
      class: 'modal-lg modal-dialog-centered custom-gd-view-modal',
      backdrop: true
    });

    this.fetchGDDetails(this.gdNo);
  }

  closeModal() {
    this.modalRef?.hide();
  }

  selectDocket(docket: any) {
    this.selectedDocket = docket;
  }

  onDocketClick(docketNo: string) {
    if (docketNo && docketNo !== '—' && docketNo !== 'N/A') {
      this.closeModal();
      this.docketClick.emit(docketNo);
    }
  }

  print() {
    const printContent = document.querySelector('.gd-view-dialog');
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
          <title>Godown Delivery Details</title>
          ${styles}
          <style>
             @page { margin: 0; }
             @media print {
                body { 
                  padding: 10mm; 
                  margin: 0; 
                  background: white; 
                  -webkit-print-color-adjust: exact; 
                  print-color-adjust: exact; 
                }
                .gd-view-dialog { box-shadow: none !important; height: auto !important; max-height: none !important; overflow: visible !important; display: block !important; }
                .godown-view-body { overflow: visible !important; }
                .dockets-table-wrap { overflow: visible !important; }
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

  private fetchGDDetails(gdNo: string) {
    const payload = {
      FilterJson: {
        ReportId: '393',
        DocNo: gdNo
      }
    };

    this.isLoading = true;
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.headerDetails = response?.Table1?.[0] || null;
        this.docketList = response?.Table2 || [];
        this.selectedDocket = this.docketList[0] || null;
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching GD details from API:', err);
      }
    });
  }
}
