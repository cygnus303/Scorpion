import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-prq-track',
  standalone: true,
  imports: [CommonModule,NgSelectModule,ReactiveFormsModule],
  templateUrl: './prq-track.component.html',
  styleUrl: './prq-track.component.scss'
})
export class PrqTrackComponent {
   @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
    public modalRef!: BsModalRef;

  constructor(private modalService: BsModalService){}

  showPopup(){
    this.modalRef = this.modalService.show(this.Templatepod, {
      backdrop: 'static',
      class: 'modal-lg modal-dialog-centered'
    });
  }

}
