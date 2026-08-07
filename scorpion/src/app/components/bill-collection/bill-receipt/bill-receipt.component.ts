import { Component, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-bill-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './bill-receipt.component.html',
  styleUrl: './bill-receipt.component.scss',
  providers: [BsModalService]
})
export class BillReceiptComponent {
  @ViewChild('TemplateReceipt', { static: true }) TemplateReceipt!: TemplateRef<any>;
  @Output() close = new EventEmitter<void>();

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

  constructor(private modalService: BsModalService) {}

  showPopup(data: any = null) {
    this.modalRef = this.modalService.show(this.TemplateReceipt, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.close.emit();
  }
}
