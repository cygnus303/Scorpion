import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-pfm-popup',
  standalone: true,
  imports: [CommonModule, NgSelectModule],
  templateUrl: './add-pfm-popup.component.html',
  styleUrl: './add-pfm-popup.component.scss',
  providers: [BsModalService]
})
export class AddPfmPopupComponent {
  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(private modalService: BsModalService) { }
  
  showPopup() {
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }
  
  resetForm() {
    console.log('Resetting form...');
    // Reset form logic here
  }
  
  savePFM() {
    console.log('Saving PFM...');
    this.modalRef.hide();
    this.dataEmitter.emit('PFM saved successfully');
  }
}
