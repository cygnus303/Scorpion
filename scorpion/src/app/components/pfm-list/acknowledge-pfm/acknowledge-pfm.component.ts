import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-acknowledge-pfm',
  standalone: true,
  imports: [CommonModule,BsDatepickerModule],
  templateUrl: './acknowledge-pfm.component.html',
  styleUrl: './acknowledge-pfm.component.scss',
  providers: [BsModalService]
})
export class AcknowledgePFMComponent {
public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(private modalService: BsModalService) { }
  
  showPopup() {
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }

}
