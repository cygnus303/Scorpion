import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from 'app/shared/services/common.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { PrsArrivalDetailsService } from 'app/shared/services/prs-arrival-details.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-hcc-details',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, ReactiveFormsModule],
  templateUrl: './hcc-details.component.html',
  styleUrl: './hcc-details.component.scss'
})
export class HCCDetailsComponent {
  public modalRef!: BsModalRef;
  selectedHccType: string = '';
  public selectedHccDetails: any;
  public hccData: any;
  public hccForm!: FormGroup;
  public isLoading: boolean = false;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;

  constructor(private modalService: BsModalService, private CommonService: CommonService,
    private thcMasterService: THCMasterService, private fb: FormBuilder,
    public generalMasterService: GeneralMasterService, public prsArrivalDetailsService: PrsArrivalDetailsService,
    private sweetAlertService: SweetAlertService, private docketService: DocketService, private THCService: THCMasterService) { }

  get hasExistingHcc(): boolean {
    if (!this.selectedHccDetails) return false;
    return !!(
      this.selectedHccDetails.loadingHCCNo ||
      this.selectedHccDetails.unloadingHCCNo ||
      this.selectedHccDetails.loadingHCC ||
      this.selectedHccDetails.unLoadingHCC
    );
  }

  showPopup(data: any, flag: any) {
    console.log("HCC Details Data:", data);
    this.selectedHccDetails = data;
    // Auto-detect existing HCC type so radio shows pre-selected (disabled) state
    if (data.loadingHCCNo || data.loadingHCC) {
      this.selectedHccType = 'Unloading';
    } else if (data.unloadingHCCNo || data.unLoadingHCC) {
      this.selectedHccType = 'Loading';
    } else {
      this.selectedHccType = '';
    }
    this.buildForm();
    this.CommonService.getVendorType('P');
    this.generalMasterService.getChargeTypeData();
    this.getHCCDetail(data);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

  buildForm() {
    this.hccForm = this.fb.group({
      hhcLocation: [''],
      hcNumber: [''],
      documentNo: [''],
      Route: [''],
      LaborType: [''],
      HCCPayType: [''],
      chargeAmount: [''],
      chargedBy: [''],
      VendorCode: [''],
      RateType: [''],
      chargeRate: [''],
      chargesType: [''],
      vendorCode: [''],
      vendorName: [''],
      rateType: [''],
      totalWeight: [''],
      totalLRWiseAmount: [0],
      totalPkg: [''],
      documentType: [''],
      lrList: this.fb.array([])   // ✅ Correct
    });
  }

  get lrList(): FormArray {
    return this.hccForm.get('lrList') as FormArray;
  }
  createLRGroup(item: any): FormGroup {
    return this.fb.group({
      lr: [item.lr],
      origin: [item.origin],
      destination: [item.destination],
      pkgsno: [item.pkgsno],
      weight: [item.weight],
      lrWiseHCCAmount: [item.lrWiseHCCAmount || 0.00],
      isChecked: [item.lrWiseHCCAmount > 0]
    });
  }

  getHCCDetail(data: any) {
    const payload = {
      hhcNo: data.drsNo || data.pdcno || data.mfNo,
      chargesType: this.selectedHccType || 'Loading'
    }
    this.isLoading = true;
    this.lrList.clear();

    this.thcMasterService.getHCCDetail(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.hccForm.patchValue({
            hhcLocation: response.hhcLocation,
            hcNumber: response.hcNumber,
            documentNo: response.documentNo,
            chargesType: response.chargesType === 'L' ? 'Loading' : 'UnnLoading',
            chargedBy: response.chargedBy || null,
            vendorCode: response.vendorCode || null,
            rateType: response.rateType || null,
            chargeRate: response.chargeRate,
            vendorName: response.vendorName,
          })
          this.prsArrivalDetailsService.getVendorsList(response.chargedBy);
          this.lrList.clear();
          response.clullrdList.forEach((item: any) => {
            this.lrList.push(this.createLRGroup(item));
          });
          this.calculateTotals();
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    })
  }

  calculateTotals() {
    let totalWeight = 0;
    let totalPkg = 0;
    let totalLRWiseAmount = 0;

    this.lrList.controls.forEach((group: any) => {
      const weight = parseFloat(group.get('weight')?.value) || 0;
      const pkgs = parseFloat(group.get('pkgsno')?.value) || 0;
      const amount = parseFloat(group.get('lrWiseHCCAmount')?.value) || 0;

      totalWeight += weight;
      totalPkg += pkgs;
      totalLRWiseAmount += amount;
    });

    this.hccForm.patchValue({
      totalWeight: totalWeight.toFixed(2),
      totalPkg: totalPkg.toFixed(2),
      totalLRWiseAmount: totalLRWiseAmount.toFixed(2),
      chargeAmount:totalLRWiseAmount.toFixed(2),
    });
  }



  onHccTypeChange() {
    if (this.selectedHccType) {
      this.getHCCDetail(this.selectedHccDetails);
    }
  }

  onChangeChargeBy(event: any) {
    if (event) {
      this.hccForm.patchValue({
        vendorName: null,
        vendorCode: null,
        chargeRate: 0,
        rateType: null
      });
    }
  }

  onVendorChange(event: any) {
    if (event) {
      this.hccForm.patchValue({
        vendorName: event.text
      });
    } else {
      this.hccForm.patchValue({
        vendorName: ''
      });
    }
    const data = {
      loadUnloadType: this.selectedHccType === 'Unloading' ? 'U' : 'L',
      vendorCode: event.value,
      typeModule: 'D',
      chargeType: null,
      brdc: this.docketService.loginUserList.LocationCode,
      loadingBy: this.hccForm.value.chargedBy,
    };
    if (['XX5'].includes(this.hccForm.get('chargedBy')?.value)) {
      this.THCService.getLoadingCharge(data).subscribe({
        next: (response: any) => {
          this.hccForm.patchValue({
            chargeRate: response.rate,
            rateType: response.rateType
          });
          this.calculateLRWiseHCCAmount()
        },
        error: (err) => {
          console.error('Error fetching loading charge:', err);
        }
      });
    }
  }


  onSubmit() {
    if (this.hccForm.invalid) {
      this.hccForm.markAllAsTouched();
      return;
    }

    const formValue = this.hccForm.value;

    // Build the list of LRs according to API specifications
    const clullrdList = formValue.lrList.map((item: any) => ({
      lr: item.lr || '',
      isAllowZero: false,
      origin: item.origin || '',
      destination: item.destination || '',
      pkgsno: parseFloat(item.pkgsno) || 0,
      weight: parseFloat(item.weight) || 0,
      chrgwt: parseFloat(item.weight) || 0,
      lrWiseHCCAmount: parseFloat(item.lrWiseHCCAmount) || 0
    }));

    const payload = {
      hcNumber: formValue.hcNumber || '',
      fromDate: new Date().toISOString(),
      toDate: new Date().toISOString(),
      hhcLocation: formValue.hhcLocation || '',
      documentNo: formValue.documentNo || '',
      route: formValue.Route, // Using 'ABH' since it was hardcoded in UI
      laborType: formValue.LaborType || '',
      hccPayType: formValue.HCCPayType || '',
      chargeAmount: parseFloat(formValue.chargeAmount) || 0,
      chargesType: formValue.chargesType || '',
      totalLRWise: (formValue.totalLRWiseAmount || 0).toString(),
      totalPkg: parseFloat(formValue.totalPkg) || 0,
      totalWeight: parseFloat(formValue.totalWeight) || 0,
      chargeRate: parseFloat(formValue.chargeRate) || 0,
      chargedBy: formValue.chargedBy || '',
      documentType: this.selectedHccDetails.drsNo ? 'D' : 'P',
      rateType: formValue.rateType || '',
      vendorCode: formValue.vendorCode || '',
      vendorName: formValue.vendorName || '',
      clullrdList: clullrdList
    };
    const params = {
      baseLocationCode: this.docketService.loginUserList?.LocationCode || '',
      basefinyear: this.docketService.loginUserList?.FinYear || '',
      userid: this.docketService.loginUserList?.UserId || '',
      companycode: this.docketService.loginUserList?.Companycode || ''
    }


    this.thcMasterService.submitHCC(payload, params).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.sweetAlertService.success(`HCC No. ${res.data.hcNo} has been Edited successfully.`);
          this.dataEmitter.emit()
          this.modalRef.hide();
        } else {
          this.sweetAlertService.error(res.message || 'Error from server');
        }
      },
      error: (err: any) => {
        console.error("Error submitting HCC", err);
        this.sweetAlertService.error('Error submitting HCC');
      }
    });
  }

calculateLRWiseHCCAmount() {
  const rate = parseFloat(this.hccForm.get('chargeRate')?.value) || 0;
  const rateType = this.hccForm.get('rateType')?.value;
  const chargedBy = this.hccForm.get('chargedBy')?.value;


  this.lrList.controls.forEach((group: any) => {
    const weight = parseFloat(group.get('weight')?.value) || 0;
    const pkgsno = parseFloat(group.get('pkgsno')?.value) || 0;
    const lrWiseAmount = parseFloat(group.get('lrWiseHCCAmount')?.value) || 0;
    const isAllowZero = group.get('isChecked')?.value === true; // isChecked = false means IsAllowZero

    let charge = 0;

    if (rateType == '3') {
      charge = pkgsno * rate;
    } else if (rateType == '4') {
      charge = lrWiseAmount; // as-is
    } else if (rateType == '1') {
      charge = weight * rate;
    }

    // IsAllowZero (isChecked false) hoy to 0 set karo
    if (rateType === '4' ) {
      group.patchValue({ lrWiseHCCAmount: charge.toFixed(2) });
    } else if(isAllowZero){
      group.patchValue({ lrWiseHCCAmount: '0.00' });
    }else{
      group.patchValue({ lrWiseHCCAmount: charge.toFixed(2) });
    }
  });

  this.calculateTotals();
}

}