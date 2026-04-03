import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { ChallanModule } from 'app/components/challan-list/challan.module';

@Component({
  selector: 'app-add-prsdrs',
  standalone: true,
  imports: [CommonModule, ChallanModule],
  templateUrl: './add-prsdrs.component.html',
  styleUrl: './add-prsdrs.component.scss',
  providers: [BsModalService]
})
export class AddPRSDRSComponent {
  public modalRef!: BsModalRef;

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService) { }

  showPopup() {
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }
}
