import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

import { FormsModule } from '@angular/forms';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-sticker-print',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sticker-print.component.html',
  styleUrls: ['./sticker-print.component.scss']
})
export class StickerPrintComponent implements OnInit {
  @ViewChild('stickerPrintModal', { static: true }) template!: TemplateRef<any>;
  @ViewChild('stickerPreviewModal', { static: true }) previewTemplate!: TemplateRef<any>;
  modalRef?: BsModalRef;
  previewModalRef?: BsModalRef;
  
  public data: any;
  public stickerData: any[] = [];
  public filteredStickerData: any[] = [];
  
  public firstSeries: string = '';
  public lastSeries: string = '';
  public fromSeries: string = '';
  public toSeries: string = '';
  public isLoadingStickers: boolean = false;
  public isPreviewLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService,
    private lrService: LrService
  ) {}

  ngOnInit(): void {}

  openModal(lrData: any) {
    this.data = lrData;
    this.fromSeries = '';
    this.toSeries = '';
    this.firstSeries = '';
    this.lastSeries = '';
    this.stickerData = [];
    this.filteredStickerData = [];
    
    this.modalRef = this.modalService.show(this.template, {
      class: 'modal-md modal-dialog-centered custom-sticker-modal'
    });
    this.fetchDynamicData(this.data?.dockno || this.data?.Cnote_No);
  }


  openPreview() {
    if (this.showError) return;
    
    // First hide the config modal
    this.modalRef?.hide();
    
    this.isPreviewLoading = true;
    
    // Open preview modal immediately
    this.previewModalRef = this.modalService.show(this.previewTemplate, {
      class: 'modal-lg modal-dialog-centered custom-sticker-modal'
    });
    
    // Now fetch the actual QR code labels using the new API
    const docketNo = this.data?.dockno || this.data?.Cnote_No;
    if (!docketNo) {
      this.isPreviewLoading = false;
      return;
    }
    
    this.lrService.getQRCodeLabels(docketNo).subscribe({
      next: (response: any) => {
        this.isPreviewLoading = false;
        let dataList = response;
        if (response && response.data) dataList = response.data;
        else if (response && response.Data) dataList = response.Data;
        else if (response && response.Result) dataList = response.Result;
        
        if (dataList && Array.isArray(dataList)) {
          // Filter based on fromSeries and toSeries if provided
          let labels = dataList;
          if (this.fromSeries && this.toSeries) {
            const fromIndex = labels.findIndex((s: any) => s.seriesNo === this.fromSeries);
            const toIndex = labels.findIndex((s: any) => s.seriesNo === this.toSeries);
            if (fromIndex !== -1 && toIndex !== -1 && fromIndex <= toIndex) {
              labels = labels.slice(fromIndex, toIndex + 1);
            }
          }
          
          this.filteredStickerData = labels;
        }
      },
      error: (err) => {
        this.isPreviewLoading = false;
        console.error('Error fetching QR Code Labels:', err);
      }
    });
  }

  fetchDynamicData(docketNo: string) {
    if (!docketNo) return;
    this.isLoadingStickers = true;
    const payload = {
      "FilterJson": {
        "ReportId": "390",
        "DocketNo" : docketNo,
        "SeriesNo" : '',
        "FromBoxId":'', 
        "ToBoxId" :'' 
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoadingStickers = false;
      if (response && response.Table1 && response.Table1.length > 0) {
        this.stickerData = response.Table1;
        this.firstSeries = this.stickerData[0].BCSerialNo;
        this.lastSeries = this.stickerData[this.stickerData.length - 1].BCSerialNo;
      }
    }, error => {
      this.isLoadingStickers = false;
    });
  }

  get showError(): boolean {
    if (!this.fromSeries && !this.toSeries) return false;
    
    // Assume invalid until verified
    let fromValid = true;
    let toValid = true;
    
    if (this.fromSeries && this.stickerData.length > 0) {
        fromValid = this.stickerData.some(s => s.BCSerialNo === this.fromSeries);
    }
    
    if (this.toSeries && this.stickerData.length > 0) {
        toValid = this.stickerData.some(s => s.BCSerialNo === this.toSeries);
    }

    return !fromValid || !toValid;
  }

  closeModal() {
    this.modalRef?.hide();
  }

  closePreview() {
    this.previewModalRef?.hide();
  }

  printStickers() {
    const printContents = document.getElementById('print-section-stickers')?.innerHTML;
    if (!printContents) {
      console.error('Nothing to print');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sticker Print - ${this.data?.dockno || this.data?.Cnote_No || ''}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { 
              background-color: #ffffff !important; 
              padding: 15px; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .sticker-card { 
              border: 1px solid #475569 !important; 
              border-radius: 4px !important; 
              box-shadow: none !important; 
              height: 100%;
            }
            @media print {
              @page { margin: 10px; }
              body { padding: 0; margin: 0; }
              .row {
                display: block !important;
              }
              .row::after {
                content: "";
                clear: both;
                display: table;
              }
              .col-md-6 {
                display: block !important;
                float: left !important;
                width: 50% !important;
                max-width: 50% !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                padding: 10px !important;
                box-sizing: border-box !important;
              }
              .sticker-card { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
                margin-bottom: 0 !important; 
                border-color: #000 !important; 
              }
            }
          </style>
        </head>
        <body>
          <div class="container-fluid pt-2">
            <div class="row g-3">
              ${printContents}
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 800);
  }
}
