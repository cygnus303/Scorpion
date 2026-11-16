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
  public forwardedToType: string = 'HQTR';
  public branchList: any[] = [];
  public filteredBranchList: any[] = [];
  public branchSearchText: string = '';
  public showBranchDropdown: boolean = false;
  public selectedBranch: any = null;

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService,
    public PFMapiService: PFMapiService,
    public docketService: DocketService,
    private sweetAlertService:SweetAlertService) { }

  get loginLocation(): string {
    return this.docketService.loginUserList?.LocationCode || this.docketService.Location || 'MUMBAI';
  }

  onForwardedToChange(type: string) {
    this.forwardedToType = type;
    this.selectedBranch = null;
    this.branchSearchText = '';
    this.showBranchDropdown = false;
    this.filteredBranchList = [...this.branchList];

    // Reset fields to blank on radio button change
    this.forwardForm.patchValue({
      courierNo: '',
      courierName: ''
    });

    const courierNoCtrl = this.forwardForm?.get('courierNo');
    const courierNameCtrl = this.forwardForm?.get('courierName');

    if (type === 'HQTR') {
      courierNoCtrl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9]{4,}$')]);
      courierNameCtrl?.setValidators([Validators.required]);
      this.forwardForm.patchValue({
        forwardedTo: 'HQTR'
      });
    } else if (type === 'BRANCH') {
      courierNoCtrl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9]{4,}$')]);
      courierNameCtrl?.setValidators([Validators.required]);
      if (this.branchList.length === 0) {
        this.loadBranchList();
      }
      this.forwardForm.patchValue({
        forwardedTo: ''
      });
    } else if (type === 'SELF') {
      courierNoCtrl?.clearValidators();
      courierNameCtrl?.clearValidators();
      this.forwardForm.patchValue({
        courierNo: '',
        courierName: '',
        forwardedTo: this.loginLocation
      });
    }

    courierNoCtrl?.updateValueAndValidity();
    courierNameCtrl?.updateValueAndValidity();
  }

  loadBranchList() {
    this.PFMapiService.GetLocationList({}).subscribe({
      next: (res: any) => {
        const rawList = res?.data || res || [];
        this.parseBranchList(rawList);
      },
      error: () => {
        this.PFMapiService.GetLocationsDirect().subscribe({
          next: (res: any) => {
            const rawList = res?.data || res || [];
            this.parseBranchList(rawList);
          }
        });
      }
    });
  }

  parseBranchList(rawList: any[]) {
    if (Array.isArray(rawList)) {
      this.branchList = rawList.map(item => {
        const code = item.locCode || item.locationCode || item.code || item.loccode || item.location || '';
        const name = item.locName || item.locationName || item.name || item.locname || item.city || '';
        return {
          locCode: code,
          locName: name,
          displayText: code && name ? `${code} - ${name}` : (code || name)
        };
      });
      this.filteredBranchList = [...this.branchList];
    }
  }

  onBranchSearch(text: string) {
    this.branchSearchText = text;
    this.showBranchDropdown = true;
    if (!text || !text.trim()) {
      this.filteredBranchList = [...this.branchList];
    } else {
      const q = text.toLowerCase().trim();
      this.filteredBranchList = this.branchList.filter(b =>
        b.displayText.toLowerCase().includes(q) ||
        b.locCode.toLowerCase().includes(q) ||
        b.locName.toLowerCase().includes(q)
      );
    }
  }

  selectBranch(branch: any) {
    this.selectedBranch = branch;
    this.branchSearchText = branch.displayText;
    this.showBranchDropdown = false;
    this.forwardForm.patchValue({
      forwardedTo: branch.locCode || branch.locName
    });
  }

  clearBranch() {
    this.selectedBranch = null;
    this.branchSearchText = '';
    this.filteredBranchList = [...this.branchList];
    this.forwardForm.patchValue({
      forwardedTo: ''
    });
  }

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
    this.forwardedToType = 'HQTR';
    this.selectedBranch = null;
    this.branchSearchText = '';
    this.loadBranchList();
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
    if (!selected || selected.length === 0) {
      this.sweetAlertService.warning('Please select at least one LR.');
      return;
    }
    const uniquePFMs = [...new Set(selected.map(r => r.fM_No).filter(f => f))];
    const formVals = this.forwardForm.value;

    // Send to Self submit (Operation/ForwardAckBothSubmit)
    if (this.forwardedToType === 'SELF') {
      const itemsArray = uniquePFMs.map(fM_No => {
        const groupedDockNos = selected
          .filter(r => r.fM_No === fM_No)
          .map(r => (r.dockno || '').toString());

        return {
          fM_No: fM_No,
          dockNos: groupedDockNos,
          doc_FWD_To: '2',
          courier_Code: this.loginLocation,
          loc_Cust_Code: this.loginLocation,
          fM_FWD_LocCode: this.docketService.loginUserList?.LocationCode || this.loginLocation,
          courier_Way_Bill_No: formVals.courierNo,
          courier_Way_Bill_Date: formVals.fwdDate ? new Date(formVals.fwdDate).toISOString() : new Date().toISOString(),
          entryBy: this.docketService.loginUserList?.UserId || ''
        };
      });

      const payload = {
        items: itemsArray
      };
      console.log('ForwardAckBothSubmit Payload:', payload);

      this.PfmForwardSubscription = this.PFMapiService.ForwardAckBothSubmit(payload).subscribe({
        next: (response: any) => {
          this.sweetAlertService.success('PFM Forwarded and Acknowledged Successfully!!');
          this.dataEmitter.emit('PFM forwarded and acknowledged successfully');
          this.modalRef.hide();
        },
        error: (err: any) => {
          this.sweetAlertService.error(err?.error?.message || err);
        }
      });
      return;
    }

    // Standard Submit for HQTR and Branch (Operation/PFMforward)
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
        loc_Cust_Code: formVals.forwardedTo,
        fM_FWD_LocCode: this.docketService.loginUserList?.LocationCode,
        courier_Way_Bill_No: formVals.courierNo,
        courier_Way_Bill_Date: formVals.fwdDate ? new Date(formVals.fwdDate).toISOString().split('T')[0] : '',
        entryBy: this.docketService.loginUserList?.UserId
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
         this.sweetAlertService.error(err?.error?.message || err);
      }
    });
  }

  ngOnDestroy() {
    if (this.PfmForwardSubscription) {
      this.PfmForwardSubscription.unsubscribe();
    }
  }
}
