import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from 'app/shared/services/common.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { PrsArrivalDetailsService } from 'app/shared/services/prs-arrival-details.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DocketService } from 'app/shared/services/docket.service';
import { VendorChargeHelperService } from 'app/shared/services/vendor-charge.service';

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
  public headerVendorList: any[] = [];
  public headerVendor: any = null;
  public documentType:string='';
  public isType:string='';
  public rowVendorList: any[][] = [];

  constructor(private modalService: BsModalService, private CommonService: CommonService,
    private thcMasterService: THCMasterService, private fb: FormBuilder, private THCMasterService: THCMasterService,
    public generalMasterService: GeneralMasterService, public prsArrivalDetailsService: PrsArrivalDetailsService,
    private sweetAlertService: SweetAlertService, private docketService: DocketService, private THCService: THCMasterService,
    public vendorChargeHelper: VendorChargeHelperService) { }

  isHccValid(hcc: any): boolean {
    if (hcc === null || hcc === undefined || hcc === '') return false;
    if (hcc === 'NO HCC' || hcc === 'NOHCC') return false;
    
    if (!isNaN(hcc)) {
      return Number(hcc) === 0;
    }
    
    return true;
  }

  get hasExistingHcc(): boolean {
    if (!this.selectedHccDetails) return false;
    if (this.isType === 'E' || !!(this.selectedHccDetails.HCNumber || this.selectedHccDetails.hcNumber)) {
      return true;
    }
    return !!(
      this.isHccValid(this.selectedHccDetails.loadingNoHCCCnt) ||
      this.isHccValid(this.selectedHccDetails.unloadingNoHCCCnt) ||
      this.isHccValid(this.selectedHccDetails.loadingNoHCCCnt) ||
      this.isHccValid(this.selectedHccDetails.unloadingNoHCCCnt)
    );
  }

  showPopup(data: any, flag: any,type?:string) {
    console.log("HCC Details Data:", data);
    this.selectedHccDetails = data;
    this.isType = type || '';
    this.documentType = this.isType === 'E' ? data.DocumentType : flag;
    console.log(this.selectedHccDetails)
    // Auto-detect existing HCC type so radio shows pre-selected (disabled) state
    if(this.isType === 'E'){
      this.selectedHccType = data.ChargesType === 'U' ? 'Unloading' : 'Loading';
    }else{
      if (this.isHccValid(data.loadingNoHCCCnt) || this.isHccValid(data.loadingNoHCCCnt)) {
        this.selectedHccType = 'Unloading';
      } else if (this.isHccValid(data.unloadingNoHCCCnt) || this.isHccValid(data.unloadingNoHCCCnt)) {
        this.selectedHccType = 'Loading';
      } else {
        this.selectedHccType = '';
      }
    }
    this.buildForm();
    this.headerVendor = null;
    this.generalMasterService.getChargeTypeData();
    this.getVendorType(this.documentType);
    if(this.isType === 'E'){
      this.getHCCEditDetail(data);
    }else{
      this.getHCCDetail(data);
    }
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
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

  getVendorType(docType: string) {
    this.THCMasterService.getVendorType(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          const mTypeRow = response.data.find((x: any) => x.documentType === docType);
          if (mTypeRow) {
            const vendorStr = this.selectedHccType === 'Unloading' ? (mTypeRow.unLoading_VendorType || mTypeRow.UnLoading_VendorType) : (mTypeRow.loading_VendorType || mTypeRow.Loading_VendorType);
            if (vendorStr) {
              const vendorTypes = vendorStr.split(',');
              this.generalMasterService.getLoadingByDetail(vendorTypes);
            }
          }
        }
      }
    });
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
    const group = this.fb.group({
      lr: [item.lr],
      origin: [item.origin],
      destination: [item.destination],
      pkgsno: [item.pkgsno],
      weight: [item.weight],
      lrWiseHCCAmount: [item.lrWiseHCCAmount || 0.00],
      isChecked: [false],
      luVendorTyp: [item.chargedBy],
      luVendorCode: [item.vendorCode],
      rateType: [item.rateType],
      chargeRate: [item.chargeRate || 0],
      rateError: ['']
    });

    const vendorType = group.get('luVendorTyp')?.value;
    if (vendorType && vendorType !== 'XX9') {
      group.get('luVendorCode')?.setValidators([Validators.required]);
      group.get('rateType')?.setValidators([Validators.required]);
    }

    group.get('chargeRate')?.valueChanges.subscribe(() => this.calculateLRWiseHCCAmount());
    group.get('rateType')?.valueChanges.subscribe(() => this.calculateLRWiseHCCAmount());

    return group;
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
            documentNo: this.selectedHccDetails?.pdcno||this.selectedHccDetails?.drsNo||this.selectedHccDetails?.mfNo,
            chargesType:this.selectedHccType ,
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
          this.prefetchVendorLists();
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

  getHCCEditDetail(data: any) {
    this.hccForm.patchValue({
      hhcLocation: data.HCCLocation,
      hcNumber: data.HCNumber,
      documentNo:data.DocumentNo,
      chargesType:data.ChargesType === 'U' ? 'Unloading' : 'Loading',
      chargedBy: data.ChargedBy || null,
      vendorCode: data.VendorCode || null,
      // rateType: data.rateType || null,
      // chargeRate: data.chargeRate,
      // vendorName: data.vendorName,
    })

    const payload = {
      FilterJson: {
        ReportId: "669",
        HCCNo:data.HCNumber,
	      Chargetype:data.ChargesType,
	      DocumentNo:data.DocumentNo
      }
    };

    this.isLoading = true;
    this.lrList.clear();
    this.thcMasterService.getHCCDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response && response.Table1 && response.Table1.length > 0) {
          const tableData = response.Table1;
          this.lrList.clear();
          tableData.forEach((rowItem: any) => {
            const mappedItem = {
              lr: rowItem.LR || rowItem.DOCKNO  || '',
              origin: rowItem.Origin || '',
              destination: rowItem.Destination || '',
              pkgsno: parseFloat(rowItem.PKGSNO ||  0),
              weight: parseFloat(rowItem.Weight ||  0),
              lrWiseHCCAmount: rowItem.LRWiseHCCAmount !== undefined && rowItem.LRWiseHCCAmount !== null ? parseFloat(rowItem.LRWiseHCCAmount) : (parseFloat(rowItem.ChargeAmount) || 0),
              chargedBy: rowItem.LuVendorTyp || null,
              vendorCode: rowItem.LuVendorCode || null,
              rateType: rowItem.RateType !== undefined && rowItem.RateType !== null ? String(rowItem.RateType) : null,
              chargeRate: parseFloat(rowItem.ChargeRate || 0)
            };
            this.lrList.push(this.createLRGroup(mappedItem));
          });
          this.prefetchVendorLists();
          this.calculateTotals();
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error("Error fetching HCC Edit detail:", err);
        this.isLoading = false;
      }
    });
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
      chargeAmount: totalLRWiseAmount.toFixed(2),
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

      const isXX9 = event.codeId === 'XX9';

      const vendorControl = this.hccForm.get('vendorCode');
      const rateTypeControl = this.hccForm.get('rateType');
      const chargeRateCtrl = this.hccForm.get('chargeRate');

      if (isXX9) {
        vendorControl?.clearValidators();
        rateTypeControl?.clearValidators();
        chargeRateCtrl?.clearValidators();

        this.lrList.controls.forEach((group: any) => {
          group.patchValue({ lrWiseHCCAmount: '0.00' });
        });
        this.calculateTotals();
      } else {
        vendorControl?.setValidators([Validators.required]);
        rateTypeControl?.setValidators([Validators.required]);
      }

      vendorControl?.updateValueAndValidity();
      rateTypeControl?.updateValueAndValidity();
      chargeRateCtrl?.updateValueAndValidity();
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
      lrWiseHCCAmount: parseFloat(item.lrWiseHCCAmount) || 0,
      chargedBy: item.luVendorTyp || '',
      luVendorTyp: item.luVendorTyp || '',
      luVendorCode: item.luVendorCode || '',
      vendorCode: item.luVendorCode || '',
      rateType: item.rateType || '',
      chargeRate: parseFloat(item.chargeRate) || 0
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
      documentType: this.documentType,
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
        this.hccForm.markAllAsTouched();
        this.sweetAlertService.error('Error submitting HCC');
      }
    });
  }

  calculateLRWiseHCCAmount() {
    this.lrList.controls.forEach((group: any) => {
      const isValid = this.validateRate(group);
      if (!isValid) {
        group.patchValue({ lrWiseHCCAmount: '0.00' }, { emitEvent: false });
        return;
      }

      const rate = parseFloat(group.get('chargeRate')?.value) || 0;
      const rateType = group.get('rateType')?.value;
      const weight = parseFloat(group.get('weight')?.value) || 0;
      const pkgsno = parseFloat(group.get('pkgsno')?.value) || 0;
      const lrWiseAmount = parseFloat(group.get('lrWiseHCCAmount')?.value) || 0;
      const isAllowZero = group.get('isChecked')?.value; // isChecked = false means IsAllowZero

      let charge = 0;
      if (rateType == '3') {
        charge = pkgsno * rate;
      } else if (rateType == '4') {
        charge = rate;
      } else if (rateType == '1') {
        charge = weight * rate;
      }

      if (isAllowZero) {
        group.patchValue({ lrWiseHCCAmount: '0.00' }, { emitEvent: false });
      } else {
        group.patchValue({ lrWiseHCCAmount: charge.toFixed(2) }, { emitEvent: false });
      }
    });

    this.calculateTotals();
  }

  validateRate(group: FormGroup): boolean {
    const vendorType = group.get('luVendorTyp')?.value;
    if (vendorType === 'XX9') {
      group.get('rateError')?.setValue('');
      return true;
    }
    const rateType = group.get('rateType')?.value;
    const rate = parseFloat(group.get('chargeRate')?.value || '0') || 0;
    const chrgwt = parseFloat(group.get('weight')?.value || '0') || 0;
    const noofpkg = parseFloat(group.get('pkgsno')?.value || '0') || 0;

    if (chrgwt === 0) {
      group.get('rateError')?.setValue('Charge weight is zero, cannot validate rate.');
      group.get('chargeRate')?.setValue('0.00', { emitEvent: false });
      return false;
    }

    let maxlimitcalculation = 0;
    if (rateType === '4') {
      maxlimitcalculation = rate / chrgwt;
    } else if (rateType === '3') {
      maxlimitcalculation = (rate * noofpkg) / chrgwt;
    } else {
      maxlimitcalculation = rate;
    }

    if (maxlimitcalculation > 5.0) {
      group.get('rateError')?.setValue('Rate Amount Is High, Please Check');
      group.get('chargeRate')?.setValue('0.00', { emitEvent: false });
      return false;
    } else {
      group.get('rateError')?.setValue('');
      return true;
    }
  }

  clearNewRateOnFocus(index: number) {
    const group = this.lrList.at(index) as FormGroup;
    if (parseFloat(group.get('chargeRate')?.value || 0) === 0) {
      group.get('chargeRate')?.setValue('', { emitEvent: false });
    }
  }

  resetNewRateOnBlur(index: number) {
    const group = this.lrList.at(index) as FormGroup;
    if (!group.get('chargeRate')?.value || group.get('chargeRate')?.value === '') {
      group.get('chargeRate')?.setValue('0.00', { emitEvent: false });
    }
    this.calculateLRWiseHCCAmount();
  }
  onHeaderHccVendorTypeChange(event: any) {
    this.headerVendor = null;
    this.vendorChargeHelper.handleHeaderHccVendorTypeChange(
      event?.codeId || event,
      this.hccForm.get('lrList') as FormArray,
      this.rowVendorList,
      (list: any[]) => this.headerVendorList = list,
      'luVendorTyp',
      'luVendorCode',
      'rateType',
      'chargeRate',
      this.selectedHccType === 'Unloading' ? 'U' : 'L'
    );

    const type = event?.codeId || event;
    const formArray = this.hccForm.get('lrList') as FormArray;
    formArray.controls.forEach((group: any) => {
      group.get('chargeRate')?.patchValue(0);
      const vendorCodeCtrl = group.get('luVendorCode');
      const rateTypeCtrl = group.get('rateType');
      if (type && type !== 'XX9') {
        vendorCodeCtrl?.setValidators([Validators.required]);
        rateTypeCtrl?.setValidators([Validators.required]);
      } else {
        vendorCodeCtrl?.clearValidators();
        rateTypeCtrl?.clearValidators();
      }
      vendorCodeCtrl?.updateValueAndValidity({ emitEvent: false });
      rateTypeCtrl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  onHeaderVendorChange(event: any) {
    this.vendorChargeHelper.handleHeaderVendorChange(
      event?.value || event,
      this.hccForm.get('lrList') as FormArray,
      'luVendorCode',
      this.selectedHccType === 'Unloading' ? 'U' : 'L',
      null,
      'rateType',
      'chargeRate',
      'luVendorTyp'
    );
  }

  onHeaderRateTypeChange(event: any) {
    this.vendorChargeHelper.handleHeaderRateTypeChange(
      event?.codeId || event,
      this.hccForm.get('lrList') as FormArray,
      'rateType',
      'luVendorTyp'
    );
  }

  onRowVendorTypeChange(event: any, index: number) {
    this.vendorChargeHelper.handleRowVendorTypeChange(
      event?.codeId || event,
      index,
      this.hccForm.get('lrList') as FormArray,
      this.rowVendorList,
      'luVendorTyp',
      'luVendorCode',
      'rateType',
      'chargeRate',
      this.selectedHccType === 'Unloading' ? 'U' : 'L'
    );

    const formArray = this.hccForm.get('lrList') as FormArray;
    const group = formArray.at(index);
    group.get('chargeRate')?.patchValue(0);
    const vendorCodeCtrl = group.get('luVendorCode');
    const rateTypeCtrl = group.get('rateType');
    const type = event?.codeId || event;
    if (type && type !== 'XX9') {
      vendorCodeCtrl?.setValidators([Validators.required]);
      rateTypeCtrl?.setValidators([Validators.required]);
    } else {
      vendorCodeCtrl?.clearValidators();
      rateTypeCtrl?.clearValidators();
    }
    vendorCodeCtrl?.updateValueAndValidity({ emitEvent: false });
    rateTypeCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onRowVendorCodeChange(event: any, index: number) {
    this.vendorChargeHelper.handleRowVendorCodeChange(
      event?.value || event,
      index,
      this.hccForm.get('lrList') as FormArray,
      this.selectedHccType === 'Unloading' ? 'U' : 'L',
      null,
      'rateType',
      'chargeRate',
      'luVendorTyp',
      'luVendorCode'
    );
  }

  prefetchVendorLists() {
    this.lrList.controls.forEach((ctrl: any, index: number) => {
      const vendorTyp = ctrl.value.luVendorTyp;
      if (vendorTyp) {
        this.vendorChargeHelper.fetchVendorListFor(vendorTyp, (list: any[]) => {
          this.rowVendorList[index] = list;
        });
      }
    });
  }

}