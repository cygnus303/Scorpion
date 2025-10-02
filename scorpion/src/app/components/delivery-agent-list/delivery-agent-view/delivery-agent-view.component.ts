import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'delivery-agent-view',
  standalone: false,
  templateUrl: './delivery-agent-view.component.html',
  styleUrl: './delivery-agent-view.component.scss',
  providers:[BsModalService],
})
export class DeliveryAgentViewComponent {
  bsModalRef!:BsModalRef;
  constructor(private modalService: BsModalService) {}
  @ViewChild('templatePopup', { static: true }) templatePopup!: TemplateRef<any>;
 showPopup(data:any){
    this.bsModalRef = this.modalService.show(this.templatePopup, {  backdrop: true, ignoreBackdropClick: false, class: 'modal-lg modal-dialog-centered' });
  }

  closePopup() {
  if (this.bsModalRef) {
    this.bsModalRef.hide(); // modal close karva
  }
}
}
