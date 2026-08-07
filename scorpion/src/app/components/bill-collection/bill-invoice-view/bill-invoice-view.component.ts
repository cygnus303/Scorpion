import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-bill-invoice-view',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './bill-invoice-view.component.html'
})
export class BillInvoiceViewComponent {
  public selectedInvoiceBill: any;
  @ViewChild('TemplateInvoice', { static: true }) TemplateInvoice!: TemplateRef<any>;

  constructor(public modalRef: BsModalRef,public modalService:BsModalService) {}

  showPopup(data :any){
    this.modalRef = this.modalService.show(this.TemplateInvoice, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
  }

  downloadInvoice() {
    window.print();
  }

  closeInvoiceView() {
    this.modalRef.hide();
  }
}
