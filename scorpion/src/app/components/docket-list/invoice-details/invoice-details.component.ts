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
  constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService,
    private sweetAlertService:SweetAlertService
  ) { }

  ngOnInit() {
    this.docketService.invoicebuild();
      this.subscription = this.docketService.ewayBill$.subscribe(ewayBillNo => {
      this.getEwayBillData(ewayBillNo,0);
    });

  }

  handleDeclaredValueChange(row: AbstractControl) {
    row.get('declaredvalue')?.valueChanges.subscribe((value) => {
      const declared = value ?? 0;
      const originState = this.docketService.basicDetailForm.get('originState')?.value;
      const destState = this.docketService.basicDetailForm.get('destinationState')?.value;

      if (declared > 100000 && originState && destState && originState === destState) {
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
  removeRow(index: number): void {
    this.docketService.invoiceRows.removeAt(index);
     this.docketService.reIndexSrNo(); 
  }


calculateSummary(i: number) {
  const serviceType = this.docketService?.basicDetailForm?.get('serviceType')?.value;

  // ✅ if serviceType = 2 → only reset Length, Breadth, Height, CubicWeight
  if (serviceType === '2') {
    this.docketService.invoiceRows.controls[i].patchValue({
      length: 0,
      breadth: 0,
      height: 0,
      cubicweight: 0
    }, { emitEvent: false });
    return; // stop further calculation
  }

  let volMeasureType = '';
  let cftWtRatio = 0;
  if (this.docketService?.contractservicecharge) {
    volMeasureType = this.docketService?.contractservicecharge[0]?.cft_Measure; // 'INCHES' | 'CM' | 'FEET'
    cftWtRatio = +this.docketService?.contractservicecharge[0]?.cft_Ratio || 0;
  }

  const rows = this.docketService?.invoiceRows.value;

  let totalDeclaredValue = 0;
  let totalNoOfPkgs = 0;
  let totalCubicWeight = 0;
  let totalActualWeight = 0;

  rows.forEach((r: any, idx: number) => {
    const length = +r.length || 0;
    const breadth = +r.breadth || 0;
    const height = +r.height || 0;
    const pkgsNo = +r.noOfPkgs || 0;

    let volume = 0;
    if (volMeasureType === 'INCHES') {
      volume = (length * breadth * height * cftWtRatio) / 1728;
    } else if (volMeasureType === 'CM') {
      volume = (length * breadth * height * cftWtRatio) / 27000;
    } else if (volMeasureType === 'FEET') {
      volume = length * breadth * height * cftWtRatio;
    }

    const cubicweight = +(volume * pkgsNo).toFixed(2);

    // ✅ Only update cubicweight for changed row
    if (idx === i) {
      this.docketService.invoiceRows.controls[i].patchValue({
        cubicweight: cubicweight
      }, { emitEvent: false });
    }

    totalDeclaredValue += +r.declaredvalue || 0;
    totalNoOfPkgs += pkgsNo;
    totalCubicWeight += cubicweight;
    totalActualWeight += +r.actualWeight || 0;
  });

  // update totals
  this.docketService.invoiceform.patchValue({
    totalDeclaredValue,
    totalNoOfPkgs,
    totalCubicWeight,
    totalActualWeight,
    chargeWeightPerPkg: totalNoOfPkgs,
    finalActualWeight: Math.max(totalActualWeight || 0, totalCubicWeight || 0)
  }, { emitEvent: false });
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

  getCFTCalculation(i: number) {
    let totalCFT = 0;

    // Get CFT ratio from main form
    const cftRatio = +this.docketService.invoiceform?.get('cft_Ratio')?.value || 0;

    this.docketService.invoiceRows.controls.forEach((ctrl) => {
      const length = Number(ctrl.get('length')?.value) || 0;
      const breadth = Number(ctrl.get('breadth')?.value) || 0;
      const height = Number(ctrl.get('height')?.value) || 0;
      const noOfPkgs = Number(ctrl.get('noOfPkgs')?.value) || 0;

      // Row CFT calculation
      const cftTotal = length * breadth * height * cftRatio * noOfPkgs;
      totalCFT += cftTotal;

      // Update row CFT without rounding
      ctrl.patchValue({ cftTotal }, { emitEvent: false });
    });

    // Update grand total without rounding
    this.docketService.invoiceform.patchValue(
      { cftTotal: totalCFT },
      { emitEvent: false }
    );

  }

getEwayBillData(event: any, index: number,isInvoice?:boolean) {
  const search = event.target.value;
 
  if (search.length.toString() === "12") {
    const invoiceRows = this.docketService.invoiceform.get('invoiceRows') as FormArray;
    const row = invoiceRows.at(index) as FormGroup;
 
     const isDuplicate = invoiceRows.controls.some((ctrl, i) =>
    i !== index && ctrl.get('ewayBillNo')?.value === search
  );
 
  if (isDuplicate) {
    this.sweetAlertService.error("Message !! cannot select Duplicate EWayBillNo.");
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
                  this.sweetAlertService.error("Error !! Please Check it EWayBill Expired Date !!!!");
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
                row.patchValue({
                  ewayinvoiceDate: invoiceDate,
                  ewayBillExpiry: expiryDate,
                  invoicedate: invDate,
                  ewayBillNo: search,
                  invoiceNo:response.invno,
                  declaredvalue:response.decval
                });
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
                consigneePincode: response.toPincode,
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
                mode: response.transMode.toString(),
                pincode: response.toPincode.toString(),
                // fromCity: response.fromCity,
                // toCity: response.toCity,
                destination: response.destcd,
              });
              this.docketService.GetPincodeOrigin('Origin');
              this.docketService.GetGSTFromTrnMode()
            }
                row.updateValueAndValidity();
              } else {
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
          this.sweetAlertService.error("Error !! This EWay Bill Already Exist IN ERP !!!");
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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  }

