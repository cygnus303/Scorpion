import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-edit-forwarded-pfm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-forwarded-pfm.component.html',
  styleUrl: './edit-forwarded-pfm.component.scss',
  providers: [BsModalService]
})
export class EditForwardedPFMComponent {
  public modalRef!: BsModalRef;
  public pfmData: any;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(private modalService: BsModalService) { }

  showPopup(data: any) {
    console.log('Edit PFM Selected Data:', data);
    this.pfmData = data;
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }

  formatFromTo(val: string): string {
    if (!val) return '—';
    return val.replace(':', ' → ');
  }
}
