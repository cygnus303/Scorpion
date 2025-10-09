import { Component, TemplateRef, ViewChild } from '@angular/core';
import { DeliveryAgentByCodeResponse } from 'app/shared/models/delivery-agent.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'delivery-agent-view',
  standalone: false,
  templateUrl: './delivery-agent-view.component.html',
  styleUrl: './delivery-agent-view.component.scss',
  providers:[BsModalService],
})
export class DeliveryAgentViewComponent {
  public bsModalRef!:BsModalRef;
  public deliveryAgentViewList!:DeliveryAgentByCodeResponse;
  public licenseAttechmentImg!:DeliveryAgentByCodeResponse;
  public modalRef!: BsModalRef;

  @ViewChild('templatePopup', { static: true }) templatePopup!: TemplateRef<any>;

  constructor(private modalService: BsModalService) {}
  
 showPopup(data:any){
    if(data){
      this.deliveryAgentViewList = data;
    }
    this.bsModalRef = this.modalService.show(this.templatePopup, {  backdrop: true, ignoreBackdropClick: false, class: 'modal-lg modal-dialog-centered' });
  }

  closePopup() {
    if (this.bsModalRef) {this.bsModalRef.hide();}
 }

   openAttachment(Templatepod: TemplateRef<any>, data: DeliveryAgentByCodeResponse) {
    this.licenseAttechmentImg = data;
    this.modalRef = this.modalService.show(Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }
}
