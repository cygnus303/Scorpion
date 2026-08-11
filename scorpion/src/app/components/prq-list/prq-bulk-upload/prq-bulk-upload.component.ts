import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-prq-bulk-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prq-bulk-upload.component.html'
})
export class PrqBulkUploadComponent {
  @ViewChild('TemplateBulkUpload', { static: true }) TemplateBulkUpload!: TemplateRef<any>;
  
  public modalRef?: BsModalRef;
  public selectedFile: File | null = null;
  public selectedFileName: string = '';

  constructor(private modalService: BsModalService) {}

  showPopup() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.modalRef = this.modalService.show(this.TemplateBulkUpload, { class: 'modal-dialog-centered', backdrop: 'static' });
  }

  closeModal() {
    this.modalRef?.hide();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }
}
