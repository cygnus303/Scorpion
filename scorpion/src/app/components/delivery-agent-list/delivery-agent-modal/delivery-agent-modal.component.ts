import { Component, TemplateRef, ViewChild } from '@angular/core';
import { DocketService } from 'app/shared/services/docket.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'delivery-agent-modal',
  standalone: false,
  templateUrl: './delivery-agent-modal.component.html',
  styleUrl: './delivery-agent-modal.component.scss',
  providers:[BsModalService],
})
export class DeliveryAgentModalComponent {
  bsModalRef!:BsModalRef;
  constructor(private modalService: BsModalService,public docketService: DocketService) {}
  @ViewChild('templatePopup', { static: true }) templatePopup!: TemplateRef<any>;
 showPopup(data:any){
    this.bsModalRef = this.modalService.show(this.templatePopup, {  backdrop: true, ignoreBackdropClick: false, class: 'modal-xl modal-dialog-centered' });
  }

  closePopup() {
  if (this.bsModalRef) {
    this.bsModalRef.hide(); // modal close karva
  }
}

}
