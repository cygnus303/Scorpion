import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-prsdrs-edit',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule],
  templateUrl: './prsdrs-edit.component.html',
  styleUrl: './prsdrs-edit.component.scss'
})
export class PRSDRSEditComponent {
  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(
    private modalService: BsModalService,
  ) { }

  showPopup() {
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }
}
