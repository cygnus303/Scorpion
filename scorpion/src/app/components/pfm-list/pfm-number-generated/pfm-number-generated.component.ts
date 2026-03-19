import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-pfm-number-generated',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pfm-number-generated.component.html',
  styleUrl: './pfm-number-generated.component.scss',
  providers: [BsModalService]
})
export class PFMNumberGeneratedComponent {
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
