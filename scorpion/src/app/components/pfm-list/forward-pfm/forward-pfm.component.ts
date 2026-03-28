import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormsModule, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-forward-pfm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BsDatepickerModule],
  templateUrl: './forward-pfm.component.html',
  styleUrl: './forward-pfm.component.scss',
  providers: [BsModalService]
})
export class ForwardPFMComponent {
  public modalRef!: BsModalRef;
  public forwardForm!: FormGroup;
  public pfmData: any[] = [];
  public displayPFMs: string = '';
  public totalLRs: number = 0;
  public uniquePFMCount: number = 0;

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService,
    public PFMapiService: PFMapiService,
    private docketService: DocketService) { }

  createForm() {
    this.forwardForm = new FormGroup({
      fwdDate: new FormControl(new Date().toISOString().split('T')[0], Validators.required),
      courierNo: new FormControl('', Validators.required),
      courierName: new FormControl('', Validators.required),
      forwardedTo: new FormControl('HQTR', Validators.required),
      remarks: new FormControl('')
    });
  }

  showPopup(data: any[]) {
    console.log(data);
    this.createForm();
    this.pfmData = (data || []).map(r => ({ ...r, checked: true }));
    this.updateSummary();
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  updateSummary() {
    const selected = this.pfmData.filter(r => r.checked);
    const uniquePFMs = [...new Set(selected.map(r => r.fM_No).filter(f => f))];
    this.displayPFMs = uniquePFMs.join(', ') || '—';
    this.totalLRs = selected.length;
    this.uniquePFMCount = uniquePFMs.length;
  }

  toggleAllFwdLrs(event: any) {
    const isChecked = event.target.checked;
    this.pfmData.forEach(r => r.checked = isChecked);
    this.updateSummary();
  }

  toggleFwdLr(row: any) {
    this.updateSummary();
  }

  submitForward() {
    if (this.forwardForm.invalid) {
      this.forwardForm.markAllAsTouched();
      return;
    }
    const selected = this.pfmData.filter(r => r.checked);
    const uniquePFMs = [...new Set(selected.map(r => r.fM_No))];
    const formVals = this.forwardForm.value;

    const pfmForwardArray = uniquePFMs.map(fM_No => ({
      fM_No: fM_No,
      doc_FWD_To: '2',
      courier_Code: formVals.courierName,
      loc_Cust_Code: 'HQTR',
      fM_FWD_LocCode: this.docketService.loginUserList.LocationCode,
      courier_Way_Bill_No: formVals.courierNo,
      courier_Way_Bill_Date: new Date(formVals.fwdDate).toISOString(),
      entryBy: this.docketService.loginUserList.UserId
    }));

    const payload = {
      pfmForward: pfmForwardArray
    };

    console.log('Forward Payload:', payload);

    this.PFMapiService.PFMForward(payload).subscribe({
      next: (response: any) => {
        this.dataEmitter.emit('PFM forwarded successfully');
        this.modalRef.hide();
      },
      error: (err: any) => {
        console.error('Error forwarding PFM:', err);
      }
    });
  }
}
