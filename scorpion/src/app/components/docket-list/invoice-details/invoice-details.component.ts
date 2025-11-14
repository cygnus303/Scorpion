import { Component } from '@angular/core';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { DocketService } from '../../../shared/services/docket.service';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SweetAlertService } from '../../../shared/services/sweet-alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'invoice-details',
  standalone: false,
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.scss'
})
export class InvoiceDetailsComponent {
  public freightData: any;
  public chargingData: any;
  public pincodeMatrixData: any;
  private subscription!: Subscription;
  private calculateSummarySubscription!: Subscription;
  private invoiceMasterMap: { [invNo: string]: number } = {};
  public minDate: Date = new Date();
  constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService,
    private sweetAlertService:SweetAlertService
  ) { }
  
  ngOnInit() {
    this.docketService.invoicebuild();
      this.subscription = this.docketService.ewayBill$.subscribe(ewayBillNo => {
      this.getEwayBillData(ewayBillNo,0,false);
    });
    this.calculateSummarySubscription = this.docketService.calculateSummary.subscribe(response => {
      if(response){
        for (let i = 0; i < this.docketService.boxDetailRows.length; i++) {
          this.calculateSummary(i);
        }
      }
    });
    this.docketService.basicDetailForm.get('serviceType')?.valueChanges.subscribe(value => {
      const lengthControl = this.docketService.boxDetailRows.get('length');
      const breadthControl = this.docketService.boxDetailRows.get('breadth');
      const heightControl = this.docketService.boxDetailRows.get('height');

      if (value === '1') {
      lengthControl?.setValidators([Validators.required, Validators.min(1)]);
      breadthControl?.setValidators([Validators.required, Validators.min(1)]);
      heightControl?.setValidators([Validators.required, Validators.min(1)]);

      } else {
      lengthControl?.clearValidators();
      lengthControl?.setErrors(null);
      breadthControl?.clearValidators();
      breadthControl?.setErrors(null);
      heightControl?.clearValidators();
      heightControl?.setErrors(null);
      }
      lengthControl?.updateValueAndValidity();
      breadthControl?.updateValueAndValidity();
      heightControl?.updateValueAndValidity();
      });
  }

checkDuplicateInvoices(i: number,row: AbstractControl) {
  const rows = this.docketService.invoiceRows.controls;
  const currentInv = rows[i].get('invoiceNo')?.value?.trim();
 
  if (!currentInv) return;
 
  // 1) jo already koi master nathi to aa row master banav
  if (this.invoiceMasterMap[currentInv] === undefined) {
    this.invoiceMasterMap[currentInv] = i;
  }
 
  // 2) master index find karo
  const masterIndex = this.invoiceMasterMap[currentInv];
 
  // 3) loop all rows with same invoice
  rows.forEach((row, idx) => {
    if (row.get('invoiceNo')?.value?.trim() === currentInv) {
      const declaredCtrl = row.get('declaredvalue');
      if (!declaredCtrl) return;
 
      if (idx === masterIndex) {
        // master → enable
        if (declaredCtrl.disabled) {
          declaredCtrl.enable({ emitEvent: false });
        }
      } else {
        // duplicate → 0 + disable
        declaredCtrl.setValue(0, { emitEvent: false });
        declaredCtrl.disable({ emitEvent: false });
      }
    }
  });
  this.calculateSummary(i);
  this.docketService.freightAndOtherChar('')
  // this.docketService.getGSTCalculation()
  this.handleDeclaredValueChange(row)
}

handleDeclaredValueChange(row: AbstractControl) {
  row.get('declaredvalue')?.valueChanges.subscribe((value) => {
    const declared = value ?? 0;
    const originState = this.docketService.basicDetailForm.get('originState')?.value;
    const destState = this.docketService.basicDetailForm.get('destinationState')?.value;

    let requireValidators = false;

    // Rule 1: Same state + declared > 100000
    if (declared >= 100000 && originState && destState && originState === destState) {
      requireValidators = true;
    }

    // Rule 2: Different states + declared > 50000
    if (declared >= 50000 && originState && destState && originState !== destState) {
      requireValidators = true;
    }
    if (requireValidators) {
      row.get('ewayBillNo')?.setValidators([Validators.required]);
      row.get('ewayBillExpiry')?.setValidators([Validators.required]);
      row.get('ewayinvoiceDate')?.setValidators([Validators.required]);
    } else {
      row.get('ewayBillNo')?.clearValidators();
      row.get('ewayBillExpiry')?.clearValidators();
      row.get('ewayinvoiceDate')?.clearValidators();
    }

    row.get('ewayBillNo')?.updateValueAndValidity({ emitEvent: false });
    row.get('ewayBillExpiry')?.updateValueAndValidity({ emitEvent: false });
    row.get('ewayinvoiceDate')?.updateValueAndValidity({ emitEvent: false });
  });
}

isEwayRequired(row: AbstractControl): boolean {
  const declared = row.get('declaredvalue')?.value ?? 0;
  const originState = this.docketService.basicDetailForm.get('originState')?.value;
  const destState = this.docketService.basicDetailForm.get('destinationState')?.value;
  if (!originState || !destState) return false;
  // Rule 1: Same state + declared > 100000
  if (declared >= 100000 && originState === destState) {
    return true;
  }
  // Rule 2: Different states + declared > 50000
  if (declared >= 50000 && originState !== destState) {
    return true;
  }
  return false;
}


removeRow(index: number): void {
    this.docketService.invoiceRows.removeAt(index);
    this.docketService.reIndexSrNo();
    this.calculateSummary(index);
     this.docketService.calculateChargeWeight()
    this.docketService.freightAndOtherChar('');
    // this.docketService.getGSTCalculation()
  }
 
   removeboxDetailRow(index: number): void {
    this.docketService.boxDetailRows.removeAt(index);
     this.docketService.boxDetailIndexSrNo();
     this.calculateSummary(index);
     this.docketService.calculateChargeWeight()
      this.docketService.freightAndOtherChar('');
      // this.docketService.getGSTCalculation()
   }



calculateSummary(i: number) {
  const serviceType = this.docketService?.basicDetailForm?.get('serviceType')?.value;

  let volMeasureType = '';
  let cftWtRatio = 0;
  if (this.docketService?.contractservicecharge) {
    volMeasureType = this.docketService?.contractservicecharge[0]?.cft_Measure; // 'INCHES' | 'CM' | 'FEET'
    cftWtRatio = +this.docketService?.contractservicecharge[0]?.cft_Ratio || 0;
  }
  const boxDetailRows = this.docketService?.boxDetailRows.value;
  const invoiceDetailRows = this.docketService?.invoiceRows.value;

  let totalDeclaredValue = 0;
  let totalNoOfPkgs = 0;
  let totalCubicWeight = 0;
  let totalActualWeight = 0;

  boxDetailRows.forEach((r: any, idx: number) => {
    let length = +r.length || 0;
    let breadth = +r.breadth || 0;
    let height = +r.height || 0;
    const pkgsNo = +r.noOfPkgs || 0;

    let cubicweight = 0;

    // 👉 serviceType=2 → force reset
    if (serviceType === '2') {
      if (idx === i) {
        this.docketService.boxDetailRows.controls[i].patchValue({
          length: 0,
          breadth: 0,
          height: 0,
          cubicweight: 0
        }, { emitEvent: false });
      }
      length = breadth = height = 0;
      cubicweight = 0;
    } else {
      // Normal volume calculation
      let volume = 0;
      if (volMeasureType === 'INCHES') {
        volume = (length * breadth * height * cftWtRatio) / 1728;
      } else if (volMeasureType === 'CM') {
        volume = (length * breadth * height * cftWtRatio) / 27000;
      } else if (volMeasureType === 'FEET') {
        volume = length * breadth * height * cftWtRatio;
      }

      cubicweight = +(volume * pkgsNo).toFixed(2);

      if (idx === i) {
        this.docketService.boxDetailRows.controls[i].patchValue({
          cubicweight: cubicweight
        }, { emitEvent: false });
      }
    }
    // totalDeclaredValue += +r.declaredvalue || 0;
    totalNoOfPkgs += pkgsNo;
    totalCubicWeight += cubicweight;
    totalActualWeight += +r.actualWeight || 0;
    // if (r.declaredvalue) {
    //   totalDeclaredValue += +r.declaredvalue || 0;
    // }
  });

 invoiceDetailRows.forEach((r: any) => {
    if (r.declaredvalue) {
      totalDeclaredValue += +r.declaredvalue || 0;
    }
  });

  this.docketService.invoiceform.patchValue({
  totalDeclaredValue: +totalDeclaredValue.toFixed(2),
  totalNoOfPkgs,
  totalCubicWeight: +totalCubicWeight.toFixed(2),
  totalActualWeight: +totalActualWeight.toFixed(2),
  chargeWeightPerPkg: totalNoOfPkgs,
  finalActualWeight: +Math.max(totalActualWeight || 0, totalCubicWeight || 0).toFixed(2)
}, { emitEvent: false });
  this.getCFTCalculation(i);
  this.docketService.calculateChargeWeight()

}
 

  clearZero(row: any, controlName: string) {
    const control = row.get(controlName);
    if (control?.value === 0) {
      control.setValue('');
    }
  }
  restoreIfEmpty(form: any, controlName: string) {
    const control = form.get(controlName);
    if (control?.value === '' || control?.value == null) {
      control.setValue(0);
    }
  }

  //for new invoice detail form
   getCFTCalculation(i: number) {
    let totalCFT = 0;
 
    // Get CFT ratio from main form
    const cftRatio = +this.docketService.invoiceform?.get('cft_Ratio')?.value || 0;
 
    this.docketService.boxDetailRows.controls.forEach((ctrl) => {
      const length = Number(ctrl.get('length')?.value) || 0;
      const breadth = Number(ctrl.get('breadth')?.value) || 0;
      const height = Number(ctrl.get('height')?.value) || 0;
      const noOfPkgs = Number(ctrl.get('noOfPkgs')?.value) || 0;
 
      // Row CFT calculation
      const cftTotal = length * breadth * height * cftRatio * noOfPkgs;
      totalCFT += cftTotal;
 
      // Update row CFT without rounding
      ctrl.patchValue( { cftTotal: parseFloat(cftTotal.toFixed(2)) }, { emitEvent: false });
    });
 
    // Update grand total without rounding
    this.docketService.invoiceform.patchValue(
      { cftTotal: parseFloat(totalCFT.toFixed(2)) },
      { emitEvent: false }
    );
 
  }

getEwayBillData(event: any, index: number,isInvoice?:boolean) {
  const search = event.target.value;
  if (search.length.toString() === "12") {
    const invoiceRows = this.docketService.invoiceform.get('invoiceRows') as FormArray;
    const row = invoiceRows.at(index) as FormGroup;
 
 const oldValue = (row as any).initialEwayBillNo;
    if (oldValue && oldValue === search) {
      return; // No popup on auto-loaded edit data
    }

     const isDuplicate = invoiceRows.controls.some((ctrl, i) =>
    i !== index && ctrl.get('ewayBillNo')?.value === search
  );
 
  if (isDuplicate) {
    this.sweetAlertService.warning("Message !! cannot select Duplicate EWayBillNo.");
      if(!isInvoice){
        this.docketService.basicDetailForm.patchValue({ewayBillNo:null});
      }
    row.patchValue({
      ewayinvoiceDate: null,
      ewayBillExpiry: null,
      invoicedate: null,
      ewayBillNo: null,
      invoiceNo: null,
      declaredvalue: null
    });
    return;
  }else{
    this.basicDetailService.checkEWayBill(search).subscribe({
      next: (checkRes: any) => {
        if (checkRes.status === "N" && search.length.toString() === "12") {
          // If not exist in ERP, call eWayBillData API
          this.basicDetailService.eWayBillData(search).subscribe({
            next: (response: any) => {
              if (response.status === 1) {
                // always keep Date object for bsDatepicker
                const invoiceDate = response.eWayBillInvoiceDate ? new Date(response.eWayBillInvoiceDate) : null;
                const expiryDate =
                  response.eWayBillExpiredDate && response.eWayBillExpiredDate !== '1900-01-01T00:00:00'
                    ? new Date(response.eWayBillExpiredDate)
                    : null;
                const invDate = response.invdt ? new Date(response.invdt) : null;
               
                // check expiry date
                if (expiryDate && expiryDate < new Date()) {
                  this.sweetAlertService.warning("Please Check EWayBill Expired Date !!!!");
                  if(!isInvoice){
                    this.docketService.basicDetailForm.patchValue({ewayBillNo:null});
                  }
                  row.patchValue({
                    ewayinvoiceDate: null,
                    ewayBillExpiry: null,
                    invoicedate: null,
                    ewayBillNo: null,
                    invoiceNo:null,
                    declaredvalue:null
                  });
                  return; // stop further execution if expired
                }
                this.docketService.invoiceRows.controls[index].patchValue({
                  ewayinvoiceDate: invoiceDate,
                  ewayBillExpiry: expiryDate,
                  // invoicedate: invDate,
                  ewayBillNo: search,
                  invoiceNo: response.invno,
                  declaredvalue: response.decval
                })
                this.calculateSummary(index)
               if(!isInvoice){
           this.docketService.getpincodeData(response.pincode.toString())
              this.docketService.consignorForm.patchValue({
                consignorName: response.csgncd,
                consigneeName: response.csgecd,
                consigneeMasterName: response.csgenm,
                consignorMasterName: response.csgnm,
                consignorAddress: response.csgnAdd,
                consigneeAddress: response.csgeAdd,
                consigneePincode: response.toPincode.toString(),
                consignorCity: response.fromCity,
                consigneeCity:response.toCity,
                consignorGSTNo: response.consignor,
                consigneeGSTNo: response.consignee,
                consignorPincode:response.pincode.toString()
              });
            this.docketService.getpincodeData(response.toPincode.toString())
            this.docketService.getTransportModeData(response.transMode.toString())
            this.docketService.basicDetailForm.patchValue({
                billingName: response.partyName,
                // mode: response.transMode.toString(),
                pincode: response.toPincode.toString(),
                // fromCity: response.fromCity,
                // toCity: response.toCity,
                destination: response.destcd,
              });
              this.docketService.GetPincodeOrigin('Origin');
              this.docketService.GetGSTFromTrnMode();
            }
                row.updateValueAndValidity();
              } else {
                 if(!isInvoice){
                    this.docketService.basicDetailForm.patchValue({ewayBillNo:null});
                  }
                row.patchValue({
                  ewayinvoiceDate: null,
                  ewayBillExpiry: null,
                  invoicedate: null,
                  ewayBillNo: null,
                  invoiceNo:null,
                  declaredvalue:null
                });
              }
            },
            error: () => {
              this.sweetAlertService.error("Error !! Unable to fetch EWayBill data.");
            }
          });
        } else {
          this.sweetAlertService.warning("This EWay Bill Already Exist in ERP !!!");
          if(!isInvoice){
            this.docketService.basicDetailForm.patchValue({ewayBillNo:null});
          }
          row.patchValue({
            ewayinvoiceDate: null,
            ewayBillExpiry: null,
            invoicedate: null,
            ewayBillNo: null,
            invoiceNo:null,
            declaredvalue:null
          });
        }
      },
      error: () => {
        this.sweetAlertService.error("Error !! Failed to check EWay Bill in ERP.");
      }
    });
  }
  }
}

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe() }
    if (this.calculateSummarySubscription) { this.calculateSummarySubscription.unsubscribe(); }
  }
  
  }

