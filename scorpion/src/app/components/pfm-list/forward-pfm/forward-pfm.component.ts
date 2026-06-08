import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormsModule, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forward-pfm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BsDatepickerModule],
  templateUrl: './forward-pfm.component.html',
  styleUrl: './forward-pfm.component.scss',
  providers: [BsModalService]
})
export class ForwardPFMComponent implements OnDestroy {
  public modalRef!: BsModalRef;
  public forwardForm!: FormGroup;
  public pfmData: any[] = [];
  public displayPFMs: string = '';
  public totalLRs: number = 0;
  public uniquePFMCount: number = 0;
  public minDate: any;
  public maxDate: any;
  public PfmForwardSubscription?: Subscription;

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService,
    public PFMapiService: PFMapiService,
    private docketService: DocketService,
    private sweetAlertService:SweetAlertService) { }

  createForm() {
    this.forwardForm = new FormGroup({
      fwdDate: new FormControl(new Date(), Validators.required),
      courierNo: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]{4,}$')]),
      courierName: new FormControl('', Validators.required),
      forwardedTo: new FormControl('HQTR', Validators.required),
      remarks: new FormControl('')
    });
  }

  showPopup(data: any) {
    console.log(data);
    const uniquePFMs = [...new Set(data.map((r:any) => r.fM_No).filter((f:any) => f))];
    this.displayPFMs = uniquePFMs.join(', ') || '—';
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
            this.updateSummary();
          }
        }
      }); 
    }
    // this.pfmData = (data || []).map(r => ({ ...r, checked: true }));
    // this.updateSummary();
    // const firstItem = data?.[0];
    // if (firstItem?.fM_Date) {
    //   this.minDate = new Date(firstItem.fM_Date);
    // }
    // this.maxDate = new Date();
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  updateSummary() {
    const selected = this.pfmData.filter((r:any) => r.checked);
    const uniquePFMs = [...new Set(selected.map((r:any) => r.fM_No).filter((f:any) => f))];
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
    if (this.PfmForwardSubscription && !this.PfmForwardSubscription.closed) {
      return;
    }
    const selected = this.pfmData.filter(r => r.checked);
    const uniquePFMs = [...new Set(selected.map(r => r.fM_No).filter(f => f))];
    const formVals = this.forwardForm.value;

    const pfmForwardArray = uniquePFMs.map(fM_No => {
      const groupedLrs = selected
        .filter(r => r.fM_No === fM_No)
        .map(r => r.dockno)
        .join(',');

      return {
        fM_No: fM_No,
        DockNo: groupedLrs,
        doc_FWD_To: '2',
        courier_Code: formVals.courierName,
        loc_Cust_Code: 'HQTR',
        fM_FWD_LocCode: this.docketService.loginUserList.LocationCode,
        courier_Way_Bill_No: formVals.courierNo,
        courier_Way_Bill_Date: formVals.fwdDate ? new Date(formVals.fwdDate).toISOString().split('T')[0] : '',
        entryBy: this.docketService.loginUserList.UserId
      };
    });

    const payload = {
      pfmForward: pfmForwardArray
    };
    console.log('Forward Payload:', payload);

    this.PfmForwardSubscription = this.PFMapiService.PFMForward(payload).subscribe({
      next: (response: any) => {
        this.sweetAlertService.success('PFM Forwarded Successfully!!');
        this.dataEmitter.emit('PFM forwarded successfully');
        this.modalRef.hide();
      },
      error: (err: any) => {
         this.sweetAlertService.error(err);
      }
    });
  }

  ngOnDestroy() {
    if (this.PfmForwardSubscription) {
      this.PfmForwardSubscription.unsubscribe();
    }
  }
}
