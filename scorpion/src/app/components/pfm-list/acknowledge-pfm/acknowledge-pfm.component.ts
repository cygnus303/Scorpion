import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-acknowledge-pfm',
  standalone: true,
  imports: [CommonModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './acknowledge-pfm.component.html',
  styleUrl: './acknowledge-pfm.component.scss',
  providers: [BsModalService]
})
export class AcknowledgePFMComponent {
  public modalRef!: BsModalRef;
  public uniquePFMs: string[] = [];
  public ackForm!: FormGroup;
  public minDate: any;
  public maxDate: any;

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService,
    private pfmApiService: PFMapiService,
    private docketService: DocketService,
    private sweetAlertService:SweetAlertService
  ) { }

  createForm() {
    this.ackForm = new FormGroup({
      ackDate: new FormControl(new Date(), Validators.required),
      remarks: new FormControl('')
    });
  }

  showPopup(data: any) {
    console.log('Acknowledge PFM Selected Data:', data);
    const fmDate = Array.isArray(data)
      ? data?.[0]?.fM_Date
      : data?.fM_Date;

    if (fmDate) {
      this.minDate = new Date(fmDate);
    }

    this.maxDate = new Date();

    if (Array.isArray(data)) {
      const pfmSet = new Set<string>();
      data.forEach(item => {
        if (item.fM_No) pfmSet.add(item.fM_No);
      });
      this.uniquePFMs = Array.from(pfmSet);
    } else {
      this.uniquePFMs = [];
    }
    this.createForm();

    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }

  submitAcknowledge() {
    if (this.ackForm.invalid) {
      this.ackForm.markAllAsTouched();
      return;
    }
    if (this.uniquePFMs.length === 0) {
      return;
    }
    const payload = {
      fmList: this.uniquePFMs.map(no => ({ fm_no: no })),
      entryBy: this.docketService.loginUserList.UserId,
      brcd: this.docketService.loginUserList.LocationCode
    };

    this.pfmApiService.NewForwardFMAckDocumentsDone(payload).subscribe({
      next: (res: any) => {
        this.sweetAlertService.success('PFM Acknowledged Successfully!!');
        this.dataEmitter.emit('PFM Acknowledged Successfully');
        this.modalRef.hide();
      },
      error: (err: any) => {
        this.sweetAlertService.error(err);
      }
    });
  }
}
