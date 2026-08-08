import { Component, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BillInvoiceViewComponent } from '../bill-invoice-view/bill-invoice-view.component';
import { CommonDateService } from 'app/shared/services/common-date.service';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-bill-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule, BillInvoiceViewComponent],
  templateUrl: './bill-receipt.component.html',
  styleUrl: './bill-receipt.component.scss',
  providers: [BsModalService]
})
export class BillReceiptComponent {
  @ViewChild('TemplateReceipt', { static: true }) TemplateReceipt!: TemplateRef<any>;
  @ViewChild('BillInvoiceViewComponent') invoiceViewRef!: BillInvoiceViewComponent;
  @ViewChild('BillInvoiceViewComponent') BillInvoiceViewComponent!: BillInvoiceViewComponent;

  @Output() close = new EventEmitter<void>();
  minDate: Date | undefined;
  maxDate: Date | undefined;
  public modalRef!: BsModalRef;

  totalCollection = 0.00;
  totalTds = 0.00;
  bankCharges = 0.00;
  roundOff = 0.00;
  netReceived = 0.00;

  selectedFile: File | null = null;
  selectedFileName: string = '';
  originalBills: any[] = [];
  receiptForm!: FormGroup;
  tdsTypes: any[] = [];
  bankLedgers: any[] = [];
  cashLedgers: any[] = [];

  constructor(
    private modalService: BsModalService,
    public commonDateService: CommonDateService,
    public sweetalertService: SweetAlertService,
    private docketService: DocketService,
    private dynamicDataService: DynamicDataService,
  ) {
    this.initForm();
  }

  getTdsTypes() {
    const payload = {
      "FilterJson": {
        "ReportId": 374,
        "BRCD": this.docketService.loginUserList?.LocationCode
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        if (res && res.Table1) {
          this.tdsTypes = res.Table1;
        }
      },
      error: (err) => {
        console.error('Error fetching TDS Types', err);
      }
    });
  }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.getTdsTypes();
    this.getLedgerList('CASH')
  }

  getLedgerList(type: string) {
    const payload = {
      "FilterJson": {
        "ReportId": 372,
        "Type": type,
        "BaseLocationCode": this.docketService.loginUserList?.LocationCode
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        if (res && res.Table1) {
          if (type === 'BANK') {
            this.bankLedgers = res.Table1;
          } else {
            this.cashLedgers = res.Table1;
          }
        }
      },
      error: (err) => console.error(`Error fetching ${type} ledger`, err)
    });
  }

  checkBouncedCheque() {
    const chequeNo = this.receiptForm.get('chequeNo')?.value;
    const bankMode = this.receiptForm.get('bankMode')?.value;

    if (bankMode === 'cheque' && chequeNo) {
      const payload = {
        "FilterJson": {
          "ReportId": 373,
          "ChequeNo": chequeNo
        }
      };

      this.dynamicDataService.getDynamicData(payload).subscribe({
        next: (res: any) => {
          if (res && res.Table1 && res.Table1.length > 0) {
            if (res.Table1[0].Isvalidation === "1" || res.Table1[0].isvalidation === "1") {
              this.sweetalertService.error(`Oppps..!!Opration fail..!! This ${chequeNo} Cheque No Is a Bounced ... Please Enter Onther ChequeNo ..`);
              this.receiptForm.get('chequeNo')?.setValue(null);
            }
          }
        },
        error: (err) => {
          console.error("Error checking bounced cheque", err);
        }
      });
    }
  }

  initForm(billsArrayData: any[] = []) {
    this.receiptForm = new FormGroup({
      mrDate: new FormControl(new Date()),
      partyName: new FormControl(billsArrayData.length > 0 ? billsArrayData[0].ptmsstr : ''),
      mrBranch: new FormControl(billsArrayData.length > 0 ? billsArrayData[0].Bbrcdnm : ''),
      remarks: new FormControl('', Validators.required),
      paymentMode: new FormControl('cash'),
      bankMode: new FormControl('cheque'),
      chequeNo: new FormControl(''),
      chequeDate: new FormControl(null),
      depositedInBank: new FormControl(null),
      cashAccountCode: new FormControl(null),
      receivedFromBank: new FormControl(''),
      bankBranch: new FormControl(''),
      tdsType: new FormControl(null),
      bills: new FormArray<FormGroup>(billsArrayData.map(b => this.createBillGroup(b)))
    });

    this.receiptForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });

    this.receiptForm.get('paymentMode')?.valueChanges.subscribe(mode => {
      this.updateValidators(mode, this.receiptForm.get('bankMode')?.value);
    });

    this.receiptForm.get('bankMode')?.valueChanges.subscribe(bMode => {
      this.updateValidators(this.receiptForm.get('paymentMode')?.value, bMode);
    });

    // Initial setup
    this.updateValidators('cash', 'cheque');
  }

  updateValidators(paymentMode: string, bankMode: string) {
    const cashAcc = this.receiptForm.get('cashAccountCode');
    const chequeNo = this.receiptForm.get('chequeNo');
    const chequeDate = this.receiptForm.get('chequeDate');
    const depBank = this.receiptForm.get('depositedInBank');
    const recBank = this.receiptForm.get('receivedFromBank');
    const branch = this.receiptForm.get('bankBranch');

    // Clear all validators first
    cashAcc?.clearValidators();
    chequeNo?.clearValidators();
    chequeDate?.clearValidators();
    depBank?.clearValidators();
    recBank?.clearValidators();
    branch?.clearValidators();

    if (paymentMode === 'cash') {
      cashAcc?.setValidators(Validators.required);
    } else if (paymentMode === 'bank') {
      chequeNo?.setValidators(Validators.required);
      if (bankMode === 'cheque') {
        chequeDate?.setValidators(Validators.required);
      }
      depBank?.setValidators(Validators.required);
      recBank?.setValidators(Validators.required);
      branch?.setValidators(Validators.required);
    }

    // Update validity
    cashAcc?.updateValueAndValidity();
    chequeNo?.updateValueAndValidity();
    chequeDate?.updateValueAndValidity();
    depBank?.updateValueAndValidity();
    recBank?.updateValueAndValidity();
    branch?.updateValueAndValidity();
  }

  createBillGroup(b: any): FormGroup {
    return new FormGroup({
      no: new FormControl(b?.BILLNO || ''),
      date: new FormControl(b?.BGNDT || ''),
      branch: new FormControl(b?.Bbrcdnm || ''),
      type: new FormControl(b?.PAYBAS || ''),
      PAYMode: new FormControl(b?.PAYMode || ''),
      tax: new FormControl(b?.Taxable_Amt || 0),
      gst: new FormControl(b?.GSTAmt || 0),
      total: new FormControl(b?.BILLAMT || 0),
      collection: new FormControl(0),
      pending: new FormControl(b?.PENDAMT || 0),
      tds: new FormControl(0),
      bankChg: new FormControl(0),
      roundOffMinus: new FormControl(0),
      roundOffPlus: new FormControl(0),
      isRoundOff: new FormControl(false),
      attachment: new FormControl('')
    });
  }

  get billsArray(): FormArray {
    return this.receiptForm.get('bills') as FormArray;
  }

  get paymentMode() {
    return this.receiptForm.get('paymentMode')?.value;
  }

  get bankMode() {
    return this.receiptForm.get('bankMode')?.value;
  }

  showPopup(data: any = null) {
    this.dateAccess();
    let billsArrayData: any[] = [];
    if (data) {
      billsArrayData = Array.isArray(data) ? data : [data];
      this.originalBills = billsArrayData;
    }

    this.initForm(billsArrayData);
    this.calculateTotals();

    this.modalRef = this.modalService.show(this.TemplateReceipt, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
  }

  calculateTotals() {
    this.billsArray.controls.forEach((control) => {
      const b = control.value;

      if (b.isRoundOff) {
        const netBeforeRoundOff = (Number(b.collection) || 0) - (Number(b.tds) || 0) + (Number(b.bankChg) || 0);
        const roundedNet = Math.round(netBeforeRoundOff);
        const diff = roundedNet - netBeforeRoundOff;

        let roPlus = 0;
        let roMinus = 0;
        if (diff > 0) {
          roPlus = parseFloat(diff.toFixed(2));
        } else if (diff < 0) {
          roMinus = parseFloat(Math.abs(diff).toFixed(2));
        }

        if (b.roundOffPlus !== roPlus || b.roundOffMinus !== roMinus) {
          control.patchValue({ roundOffPlus: roPlus, roundOffMinus: roMinus }, { emitEvent: false });
        }
      } else {
        if (b.roundOffPlus !== 0 || b.roundOffMinus !== 0) {
          control.patchValue({ roundOffPlus: 0, roundOffMinus: 0 }, { emitEvent: false });
        }
      }

      const updatedB = control.value;
      const netAmt = (Number(updatedB.collection) || 0) - (Number(updatedB.tds) || 0) + (Number(updatedB.bankChg) || 0) - (Number(updatedB.roundOffMinus) || 0) + (Number(updatedB.roundOffPlus) || 0);

      if (netAmt < 0) {
        this.sweetalertService.info('Net Recd. Amount Not in Negative');
        control.patchValue({
          collection: updatedB.pending,
          tds: 0,
          bankChg: 0,
          roundOffMinus: 0,
          roundOffPlus: 0
        }, { emitEvent: false });
      }
    });

    const bills = this.billsArray.getRawValue();
    this.totalCollection = bills.reduce((sum: number, b: any) => sum + (Number(b.collection) || 0), 0);
    this.totalTds = bills.reduce((sum: number, b: any) => sum + (Number(b.tds) || 0), 0);
    this.bankCharges = bills.reduce((sum: number, b: any) => sum + (Number(b.bankChg) || 0), 0);
    const totalRoundOffPlus = bills.reduce((sum: number, b: any) => sum + (Number(b.roundOffPlus) || 0), 0);
    const totalRoundOffMinus = bills.reduce((sum: number, b: any) => sum + (Number(b.roundOffMinus) || 0), 0);

    this.roundOff = totalRoundOffPlus - totalRoundOffMinus;
    this.netReceived = this.totalCollection - this.totalTds + this.bankCharges - totalRoundOffMinus + totalRoundOffPlus;
  }

  getNetRecdAmt(index: number): number {
    const b = this.billsArray.at(index).value;
    return (Number(b.collection) || 0) - (Number(b.tds) || 0) + (Number(b.bankChg) || 0) - (Number(b.roundOffMinus) || 0) + (Number(b.roundOffPlus) || 0);
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.close.emit();
  }

  openInvoiceView(data: any) {
    this.BillInvoiceViewComponent.showPopup(data);

  }

  submit() {
    this.receiptForm.markAllAsTouched();

    if (this.receiptForm.invalid) {
      const invalidFields: string[] = [];
      Object.keys(this.receiptForm.controls).forEach(key => {
        const control = this.receiptForm.get(key);
        if (control?.invalid) {
          invalidFields.push(key);
        }
      });
      console.log('Validation Error: The following fields are invalid: ', invalidFields);
      return;
    }

    if (this.totalTds > 0 && !this.receiptForm.get('tdsType')?.value) {
      this.sweetalertService.info('Please select TDS Type as TDS Amount is greater than 0.');
      return;
    }

    const formVal = this.receiptForm.getRawValue();
    const bills = formVal.bills;
    const mrDateObj = formVal.mrDate ? new Date(formVal.mrDate) : new Date();
    const chequeDateObj = formVal.chequeDate ? new Date(formVal.chequeDate) : new Date();

    const formatCustomDate = (dateObj: Date) => {
      const pad = (n: number) => n < 10 ? '0' + n : n;
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();
      let hours = dateObj.getHours();
      const minutes = pad(dateObj.getMinutes());
      const seconds = pad(dateObj.getSeconds());
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      return `${pad(month)}/${pad(day)}/${year} ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
    };

    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('VM.ObjBillMst.UploadedFile', this.selectedFile);
    }
    formData.append('VM.ObjBillMst.BILLNO', bills.length > 0 ? bills[0].no : "");
    formData.append('VM.ObjBillMst.PENDAMT', String(bills.reduce((sum: number, b: any) => sum + (Number(b.pending) || 0), 0)));
    formData.append('VM.ObjBillMst.Netamt', String(this.netReceived));
    
    const totalBalance = bills.reduce((sum: number, b: any) => sum + ((Number(b.pending) || 0) - (Number(b.collection) || 0)), 0);
    formData.append('VM.ObjBillMst.UNEXPDED', String(totalBalance));
    
    formData.append('VM.ObjBillMst.REMARK', formVal.remarks || "");
    formData.append('VM.ObjBillMst.Col_Amt', String(this.totalCollection));
    formData.append('VM.ObjBillMst.RoundOffP', String(bills.reduce((sum: number, b: any) => sum + (Number(b.roundOffPlus) || 0), 0)));
    formData.append('VM.ObjBillMst.RoundOffM', String(bills.reduce((sum: number, b: any) => sum + (Number(b.roundOffMinus) || 0), 0)));
    formData.append('VM.ObjBillMst.TDSDED', String(this.totalTds));
    formData.append('VM.ObjBillMst.Freight_Deduction', "0");
    formData.append('VM.ObjBillMst.Claim_Deduction', "0");
    formData.append('VM.ObjBillMst.Other_Amount', String(this.bankCharges));
    formData.append('VM.ObjBillMst.Bank_Charges', String(this.bankCharges));
    formData.append('VM.ObjBillMst.PTMSCD', this.originalBills.length > 0 ? this.originalBills[0].PTMSCD : "");
    formData.append('VM.ObjBillMst.PAYBAS', bills.length > 0 ? bills[0].PAYMode : "");
    formData.append('VM.ObjBillMst.BILLAMT', String(bills.reduce((sum: number, b: any) => sum + (Number(b.total) || 0), 0)));
    formData.append('VM.ObjBillMst.cess_rate', "0");
    formData.append('VM.ObjBillMst.H_cess_rate', "0");

    formData.append('VM.MRDate', formatCustomDate(mrDateObj));
    formData.append('VM.ManualMRNO', "-");
    formData.append('VM.PartyCode', this.originalBills.length > 0 ? this.originalBills[0].PTMSCD : "-");
    formData.append('VM.PartyName', formVal.partyName || "-");
    formData.append('VM.PAYBAS', bills.length > 0 ? bills[0].PAYMode : "-");
    formData.append('VM.SecurityLedger', "-");
    formData.append('VM.TDSLedger', "-");
    formData.append('VM.Remarks', formVal.remarks || "-");
    formData.append('VM.TransactionId', "-");
    formData.append('VM.TransactionDate', formatCustomDate(mrDateObj));

    bills.forEach((b: any, index: number) => {
      formData.append(`BillList[${index}].tdsded`, String(b.tds || 0));
      formData.append(`BillList[${index}].remark`, formVal.remarks || "");
      formData.append(`BillList[${index}].billamt`, String(b.total || 0));
      formData.append(`BillList[${index}].claim_Deduction`, "0");
      formData.append(`BillList[${index}].h_cess_rate`, "0");
      formData.append(`BillList[${index}].other_Amount`, String(b.bankChg || 0));
      formData.append(`BillList[${index}].billno`, b.no || "");
      formData.append(`BillList[${index}].freight_Deduction`, "0");
      formData.append(`BillList[${index}].col_Amt`, String(b.collection || 0));
      formData.append(`BillList[${index}].ptmscd`, this.originalBills.length > 0 ? this.originalBills[0].PTMSCD : "");

      const netamt = (Number(b.collection) || 0) - (Number(b.tds) || 0) + (Number(b.bankChg) || 0) - (Number(b.roundOffMinus) || 0) + (Number(b.roundOffPlus) || 0);
      formData.append(`BillList[${index}].netamt`, String(netamt));
      
      formData.append(`BillList[${index}].paybas`, b.PAYMode || "");
      formData.append(`BillList[${index}].roundOffM`, String(b.roundOffMinus || 0));
      formData.append(`BillList[${index}].roundOffP`, String(b.roundOffPlus || 0));
      formData.append(`BillList[${index}].bank_Charges`, String(b.bankChg || 0));
      formData.append(`BillList[${index}].uploadedFile`, b.attachment || this.selectedFileName || "");
      formData.append(`BillList[${index}].cess_rate`, "0");
      formData.append(`BillList[${index}].pendamt`, String(b.pending || 0));
      
      const balanceAmt = (Number(b.pending) || 0) - (Number(b.collection) || 0);
      formData.append(`BillList[${index}].unexpded`, String(balanceAmt));
    });

    formData.append('PC.ChequeNo', formVal.chequeNo || "-");
    formData.append('PC.ChequeDate', formatCustomDate(chequeDateObj));
    formData.append('PC.PayAmount', String(this.netReceived));
    // const finalPaymentMode = formVal.paymentMode === 'bank' ? formVal.bankMode : formVal.paymentMode;
    formData.append('PC.PaymentMode', formVal.paymentMode || "-");
    
    const isCash = formVal.paymentMode === 'cash';
    formData.append('PC.ChequeAmount', String(isCash ? 0 : this.netReceived));
    formData.append('PC.CashAmount', String(isCash ? this.netReceived : 0));

    formData.append('PC.BankLedger', !isCash ? (formVal.depositedInBank || "-") : "-");
    formData.append('PC.Collection_Amt_From_Cheque', String(this.netReceived));
    formData.append('PC.ChequeAmount_Fromcheque', String(this.netReceived));
    formData.append('PC.Bank_Branch', formVal.bankBranch || "-");
    formData.append('PC.NET_RECEIVED', String(this.netReceived));
    formData.append('PC.CashLedger', isCash ? (formVal.cashAccountCode || "-") : "-");
    formData.append('PC.DepositedInBank', formVal.depositedInBank || "-");
    formData.append('PC.TDSType', formVal.tdsType || "-");
    formData.append('PC.ISDepositedInBank', formVal.paymentMode === 'bank' ? 'true' : 'false');
    formData.append('PC.totTDSAmt', String(this.totalTds));

    formData.append('CCP.TransactionType', formVal.paymentMode || "-");
    formData.append('CCP.Amount', String(this.netReceived));
    formData.append('CCP.CashAccountCode', isCash ? (formVal.cashAccountCode || "-") : "-");
    formData.append('CCP.ChequeAmount', String(isCash ? 0 : this.netReceived));
    formData.append('CCP.CashAmount', String(isCash ? this.netReceived : 0));
    formData.append('CCP.IsChequeDeposited', formVal.paymentMode === 'bank' ? 'true' : 'false');
    formData.append('CCP.ChequeNo', formVal.chequeNo || "-");
    formData.append('CCP.ChequeDate', formatCustomDate(chequeDateObj));
    formData.append('CCP.ChequeBankName', formVal.receivedFromBank || "-");
    formData.append('CCP.ChequeBankBranchName', formVal.bankBranch || "-");
    formData.append('CCP.OnAccountBalance', "-");

    formData.append('BillCoupon', '[]');
    formData.append('CnotList', '[]');

    formData.append('BaseLocationCode', this.docketService.loginUserList?.LocationCode || "-");
    formData.append('BaseCompanyCode', this.docketService.loginUserList?.Companycode || "-");
    formData.append('BaseYearVal', this.docketService.loginUserList?.FinYear || "-");
    formData.append('BaseUserName', this.docketService.baseUsername || "-");

    this.dynamicDataService.submitBillCollection(formData).subscribe({
      next: (res: any) => {
        const msg = res.message || res.Message || 'Operation completed.';
        if (res.success || res.isSuccess || res.Status === 200 || res.status === 200) {
          this.sweetalertService.success(msg);
          this.closePopup();
        } else {
          this.sweetalertService.error(msg);
        }
      },
      error: (err) => {
        console.error("Submit Error:", err);
        const msg = err.error?.message || err.error?.Message || err.message || 'Failed to submit the bill receipt.';
        this.sweetalertService.error(msg);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  onBillFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const billsFormArray = this.receiptForm.get('bills') as FormArray;
      const billGroup = billsFormArray.at(index) as FormGroup;
      billGroup.patchValue({ attachment: file.name }, { emitEvent: false });
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  dateAccess() {
    const payload = {
      moduleCode: '03',
      baseUserName: this.docketService.baseUsername
    };

    this.commonDateService.userDateSelection(payload).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          const rule = res[0];
          this.minDate = new Date(rule.min_Date);
          if (rule.backDate_Days && rule.backDate_Days > 0) {
            const today = new Date();
            this.minDate = new Date(today.setDate(today.getDate() - rule.backDate_Days));
          }

          this.maxDate = new Date();
        }
      }
    });
  }
}
