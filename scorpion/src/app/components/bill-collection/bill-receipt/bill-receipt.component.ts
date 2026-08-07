import { Component, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BillInvoiceViewComponent } from '../bill-invoice-view/bill-invoice-view.component';
import { CommonDateService } from 'app/shared/services/common-date.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-bill-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, BsDatepickerModule,BillInvoiceViewComponent],
  templateUrl: './bill-receipt.component.html',
  styleUrl: './bill-receipt.component.scss',
  providers: [BsModalService]
})
export class BillReceiptComponent {
  @ViewChild('TemplateReceipt', { static: true }) TemplateReceipt!: TemplateRef<any>;
  @ViewChild('BillInvoiceViewComponent') invoiceViewRef!: BillInvoiceViewComponent;
  @ViewChild('BillInvoiceViewComponent') BillInvoiceViewComponent!: BillInvoiceViewComponent;

  @Output() close = new EventEmitter<void>();
  minDate: Date | undefined;
  maxDate: Date | undefined;
  public modalRef!: BsModalRef;

  paymentMode: 'cash' | 'bank' = 'cash';
  bankMode: 'cheque' | 'rtgs' = 'cheque';

  bills = [
    { no: '19062600452', date: '19/06/2026', branch: 'SIL : Siliguri', type: 'Paid', tax: 12500.00, gst: 2250.00, total: 14750.00, collection: 14750, pending: 0.00, tds: 0, bankChg: 0, roundOff: false },
    { no: '19062600455', date: '19/06/2026', branch: 'SIL : Siliguri', type: 'To Pay', tax: 8400.00, gst: 1512.00, total: 9912.00, collection: 9912, pending: 0.00, tds: 0, bankChg: 0, roundOff: false }
  ];

  totalCollection = 24662.00;
  totalTds = 0.00;
  bankCharges = 0.00;
  roundOff = 0.00;
  netReceived = 24662.00;

  selectedFileName: string = '';

  constructor(private modalService: BsModalService,public commonDateService:CommonDateService,public docketService: DocketService) {}

  showPopup(data: any = null) {
    this.dateAccess();
    this.modalRef = this.modalService.show(this.TemplateReceipt, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.close.emit();
  }

  openInvoiceView(data: any) {
      this.BillInvoiceViewComponent.showPopup(data);
    
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
    }
  }

  removeFile() {
    this.selectedFileName = '';
  }

   dateAccess() {
  const payload = {
    moduleCode: '03',
    baseUserName: this.docketService.baseUsername
  };

  this.commonDateService.userDateSelection(payload).subscribe({
    next: (res: any) => {
      if (res && res.length > 0) {
        const rule = res[0];
        this.minDate = new Date(rule.min_Date);
        if (rule.backDate_Days && rule.backDate_Days > 0) {
          const today = new Date();
          this.minDate = new Date(today.setDate(today.getDate() - rule.backDate_Days));
        }

        this.maxDate = new Date();
      }
    }
  });
}
}
