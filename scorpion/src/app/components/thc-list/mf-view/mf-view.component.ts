import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-mf-view',
  standalone: true,
  imports: [],
   providers: [BsModalService],
  templateUrl: './mf-view.component.html',
  styleUrl: './mf-view.component.scss'
})
export class MfViewComponent {
  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  
  constructor(private modalService: BsModalService) { }

  showPopup(){
      this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

}
