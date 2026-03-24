import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-pfm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-pfm.component.html',
  styleUrl: './view-pfm.component.scss',
  providers: [BsModalService]
})
export class ViewPfmComponent {
  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(private modalService: BsModalService) { }

  showPopup(data: any) {
    console.log('View PFM Selected Data:', data);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }
}
