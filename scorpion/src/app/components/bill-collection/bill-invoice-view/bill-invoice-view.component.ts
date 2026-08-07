import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-bill-invoice-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bill-invoice-view.component.html'
})
export class BillInvoiceViewComponent {
  public selectedInvoiceBill: any;

  constructor(public modalRef: BsModalRef) {}

  downloadInvoice() {
    window.print();
  }

  closeInvoiceView() {
    this.modalRef.hide();
  }
}
