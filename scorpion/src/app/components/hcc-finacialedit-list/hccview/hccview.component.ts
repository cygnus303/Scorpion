import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-hccview',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule],
  templateUrl: './hccview.component.html',
  styleUrl: './hccview.component.scss'
})
export class HCCviewComponent {
  public modalRef!: BsModalRef;
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService) { }

  showPopup() {
    this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
  }


  close() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  printHccModal() {
    window.print();
  }

  closeHccModal() {
    this.close();
  }
}
