import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-gb-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gb-view.component.html',
  styleUrls: ['./gb-view.component.scss']
})
export class GbViewComponent implements OnInit {
  @ViewChild('gbViewTemplate', { static: true }) template!: TemplateRef<any>;
  modalRef?: BsModalRef;
  
  public data: any;

  constructor(private modalService: BsModalService) {}

  ngOnInit(): void {}

  openModal(lrData: any) {
    this.data = lrData;
    this.modalRef = this.modalService.show(this.template, {
      class: 'modal-lg modal-dialog-centered custom-gb-modal'
    });
  }

  closeModal() {
    this.modalRef?.hide();
  }
}
