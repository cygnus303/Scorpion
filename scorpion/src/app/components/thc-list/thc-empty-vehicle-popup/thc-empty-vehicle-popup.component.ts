import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thc-empty-vehicle-popup',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './thc-empty-vehicle-popup.component.html',
  styleUrl: './thc-empty-vehicle-popup.component.scss'
})
export class ThcEmptyVehiclePopupComponent {
  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;

  constructor(private modalService: BsModalService) { }


  showPopup(){
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  closePopup() {
    this.modalRef?.hide();
  }
}
