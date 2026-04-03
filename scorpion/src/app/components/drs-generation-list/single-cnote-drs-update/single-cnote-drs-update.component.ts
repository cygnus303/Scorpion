import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'single-cnote-drs-update',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule],
  templateUrl: './single-cnote-drs-update.component.html',
  styleUrl: './single-cnote-drs-update.component.scss'
})
export class SingleCnoteDrsUpdateComponent {
  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;


  constructor(
    private modalService: BsModalService,

  ) { }

  showPopup(data: any) {
    console.log('Data received for Single C Note Update:', data);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });

  }


}
