import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-lr-print-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lr-print-preview.component.html',
  styleUrls: ['./lr-print-preview.component.scss']
})
export class LrPrintPreviewComponent implements OnInit {
  public dockno: string = '';
  public customerName: string = '';
  public isAlkemCustomer: boolean = false;
  public qrCodeImageUrl: string | null = null; // Store QR code image URL

  public lrData: any = null; // Store API response data here

  public copies = [
    { id: 'consignor', name: 'Consignor Copy', selected: true },
    { id: 'consignee', name: 'Consignee Copy', selected: true },
    { id: 'pod', name: 'POD Copy', selected: true },
    { id: 'ho', name: 'HO Copy', selected: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private dynamicDataService: DynamicDataService,
    private lrService: LrService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.dockno = id;
        this.fetchLrData(id);
      }
    });

    // Query parameters mathi customer name check karo (eg. ?customer=alkem)
    this.route.queryParamMap.subscribe(queryParams => {
      const customer = queryParams.get('customer');
      if (customer) {
        this.customerName = customer.toLowerCase();
        this.isAlkemCustomer = this.customerName.includes('alkem');
      }
    });
  }

  fetchLrData(docketNo: string) {
    const payload = {
      "FilterJson": {
        "ReportId": "389",
        "DocketNo": docketNo
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      if (response && response.Table1 && response.Table1.length > 0) {
        this.lrData = response.Table1[0];
        this.fetchQrCodeImage();
      }
    });
  }

  fetchQrCodeImage() {
    const cnoteNo = this.lrData?.Cnote_No || this.dockno;
    if (cnoteNo) {
      this.lrService.getQRCodeImage(cnoteNo).subscribe(
        (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.qrCodeImageUrl = e.target.result;
          };
          reader.readAsDataURL(blob);
        },
        (error) => {
          console.error("Error fetching QR Code", error);
        }
      );
    }
  }

  printPage() {
    window.print();
  }

  downloadPdf() {
    // Load html2pdf dynamically from CDN so no npm install is needed
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const element = document.querySelector('.preview-body');
      if (element) {
        const opt = {
          margin:       0.2,
          filename:     `LR_${this.lrData?.Cnote_No || this.dockno}.pdf`,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0, 
            windowHeight: element.scrollHeight + 100 
          },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' },
          pagebreak:    { mode: ['css', 'legacy'], after: '.cnote-container' }
        };
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save();
      }
    };
    document.body.appendChild(script);
  }
}
