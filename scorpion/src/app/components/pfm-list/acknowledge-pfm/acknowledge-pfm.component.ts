import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-acknowledge-pfm',
  standalone: true,
  imports: [CommonModule, BsDatepickerModule, ReactiveFormsModule,FormsModule],
  templateUrl: './acknowledge-pfm.component.html',
  styleUrl: './acknowledge-pfm.component.scss',
  providers: [BsModalService]
})
export class AcknowledgePFMComponent {
  public modalRef!: BsModalRef;
  public uniquePFMs: string[] = [];
  public displayPFMs: string = '';
  public pfmData: any[] = [];
  public ackForm!: FormGroup;
  public minDate: any;
  public maxDate: any;

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService,
    private pfmApiService: PFMapiService,
    private docketService: DocketService,
    private sweetAlertService:SweetAlertService,
    public PFMapiService: PFMapiService,
  ) { }

  createForm() {
    this.ackForm = new FormGroup({
      ackDate: new FormControl(new Date(), Validators.required),
      remarks: new FormControl('')
    });
  }

  showPopup(data: any) {  
    this.uniquePFMs = [...new Set(data.map((r:any) => r.fM_No).filter((f:any) => f))] as string[];
    this.displayPFMs = this.uniquePFMs.join(', ') || '—';
    this.createForm();
    if (this.displayPFMs) {
      const fmNoList = {fmNoList: this.displayPFMs};
      this.PFMapiService.GetDocketByFMNo(fmNoList).subscribe({
        next: (response: any) => {
          this.pfmData = response;
          if (this.pfmData && this.pfmData.length > 0) {
            this.pfmData.forEach((lr: any) => {
              lr.checked = true; // Initialize all as unchecked
            });
          }
        }
      }); 
    }
    const fmDate = Array.isArray(data)? data?.[0]?.fM_Date: data?.fM_Date;
    if (fmDate) {
      this.minDate = new Date(fmDate);
    }
    this.maxDate = new Date();
    this.createForm();
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }

  // Checkbox functionality methods
  toggleAllLRs(event: any) {
    const isChecked = event.target.checked;
    this.pfmData.forEach(lr => {
      lr.checked = isChecked;
    });
  }

  isAllLRsSelected(): boolean {
    if (!this.pfmData || this.pfmData.length === 0) {
      return false;
    }
    return this.pfmData.every(lr => lr.checked);
  }

  submitAcknowledge() {
    if (this.ackForm.invalid) {
      this.ackForm.markAllAsTouched();
      return;
    }
    if (!this.pfmData || this.pfmData.length === 0) {
      return;
    }
    
    // Get only checked LRs
    const checkedLRs = this.pfmData.filter(lr => lr.checked);
    
    if (checkedLRs.length === 0) {
      this.sweetAlertService.info('Please select at least one LR to acknowledge');
      return;
    }
    
    // Create payload with fm_no and dockNo for checked LRs
    const payload = {
      fmList: checkedLRs.map(lr => ({ 
        fm_no: lr.fM_No, 
        dockNo: lr.dockno 
      })),
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
