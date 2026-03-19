import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-forward-pfm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forward-pfm.component.html',
  styleUrl: './forward-pfm.component.scss',
  providers: [BsModalService]
})
export class ForwardPFMComponent {
public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(private modalService: BsModalService) { }
  
  showPopup() {
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }

}
