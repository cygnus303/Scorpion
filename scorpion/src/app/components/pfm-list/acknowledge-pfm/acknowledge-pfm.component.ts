import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-acknowledge-pfm',
  standalone: true,
  imports: [CommonModule, BsDatepickerModule],
  templateUrl: './acknowledge-pfm.component.html',
  styleUrl: './acknowledge-pfm.component.scss',
  providers: [BsModalService]
})
export class AcknowledgePFMComponent {
  public modalRef!: BsModalRef;
  public uniquePFMs: string[] = [];
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(private modalService: BsModalService) { }

  showPopup(data: any) {
    console.log('Acknowledge PFM Selected Data:', data);
    if (Array.isArray(data)) {
      const pfmSet = new Set<string>();
      data.forEach(item => {
        if (item.fM_No) pfmSet.add(item.fM_No);
      });
      this.uniquePFMs = Array.from(pfmSet);
    } else {
      this.uniquePFMs = [];
    }
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }

}
