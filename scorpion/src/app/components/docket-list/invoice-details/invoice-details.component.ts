import { Component } from '@angular/core';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { DocketService } from '../../../shared/services/docket.service';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

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

  constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService
  ) { }

  ngOnInit() {
    this.docketService.invoicebuild();
    //     this.docketService.invoiceform.valueChanges.subscribe(() => {
    //   this.applyEwayBillValidation();
    // });
    //  this.docketService.basicDetailForm.get('pincode')?.valueChanges.subscribe(() => {
    //   this.applyEwayBillValidation();
    // });
    //    this.docketService.basicDetailForm.get('destinationState')?.valueChanges.subscribe(() => {
    //   this.applyEwayBillValidation();
    // });
    //    this.docketService.basicDetailForm.get('originState')?.valueChanges.subscribe(() => {
    //   this.applyEwayBillValidation();
    // });

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
  }


  //   applyEwayBillValidation() {
  //   const totalDeclaredValue = this.docketService.invoiceform.get('totalDeclaredValue')?.value;
  //   const originState = this.docketService.basicDetailForm.get('originState')?.value;
  //   const destState = this.docketService.basicDetailForm.get('destinationState')?.value;

  //   this.docketService.invoiceRows.controls.forEach((row: any) => {
  //     const ewayBillNo = row.get('ewayBillNo');
  //     if (totalDeclaredValue > 100000 && originState && destState && originState === destState) {
  //       ewayBillNo?.setValidators([Validators.required]);
  //     } else {
  //       ewayBillNo?.clearValidators();
  //         ewayBillNo?.setErrors(null);
  //     }

  //     ewayBillNo?.updateValueAndValidity({ emitEvent: false });
  //   });
  // }
  calculateSummary(i: number) {
    const serviceType = this.docketService.basicDetailForm.get('serviceType')?.value;

    // ✅ if serviceType = 2 → only reset Length, Breadth, Height, CubicWeight
    if (serviceType === '2') {
      this.docketService.invoiceRows.controls[i].patchValue({
        length: 0,
        breadth: 0,
        height: 0,
        cubicweight: 0
      });
      // return; // stop further calculation
    }

    const volMeasureType = this.docketService?.contractservicecharge[0]?.cft_Measure; // 'INCHES' | 'CM' | 'FEET'
    const cftWtRatio = +this.docketService?.contractservicecharge[0]?.cft_Ratio || 0; // you can bind from service
    const rows = this.docketService?.invoiceRows.value;

    let totalDeclaredValue = 0;
    let totalNoOfPkgs = 0;
    let totalCubicWeight = 0;
    let totalActualWeight = 0;

    const updatedRows = rows.map((r: any) => {
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
      this.docketService.invoiceRows.controls[i].patchValue({
        cubicweight: cubicweight
      });
      totalDeclaredValue += +r.declaredvalue || 0;
      totalNoOfPkgs += pkgsNo;
      totalCubicWeight += cubicweight;
      totalActualWeight += +r.actualWeight || 0;
    });
    this.docketService.invoiceRows.patchValue(updatedRows);
    this.docketService.invoiceform.patchValue({
      totalDeclaredValue,
      totalNoOfPkgs,
      totalCubicWeight,
      totalActualWeight,
      chargeWeightPerPkg: totalNoOfPkgs,
      finalActualWeight: Math.max(totalActualWeight || 0, totalCubicWeight || 0)
      // finalActualWeight: this.docketService.freightData?.chargedWeight ? (totalActualWeight < this.docketService.freightData.chargedWeight  ? this.docketService.freightData.chargedWeight : totalActualWeight): totalActualWeight
    });
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

  // openDatePicker(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   input.showPicker?.();
  // }


  getEwayBillData(event: any, index: number) {
    const search = event.target.value;
    if (search.length === 12) {
      this.basicDetailService.eWayBillData(search).subscribe({
        next: (response: any) => {
          if (response.status === 1) {
            const invoiceRows = this.docketService.invoiceform.get('invoiceRows') as FormArray;
            const row = invoiceRows.at(index) as FormGroup;

            // always keep Date object for bsDatepicker
            const invoiceDate = response.eWayBillInvoiceDate ? new Date(response.eWayBillInvoiceDate) : null;
            const expiryDate =
              response.eWayBillExpiredDate && response.eWayBillExpiredDate !== '1900-01-01T00:00:00'
                ? new Date(response.eWayBillExpiredDate)
                : null;
            const invDate = response.invdt ? new Date(response.invdt) : null;

            row.patchValue({
              ewayinvoiceDate: invoiceDate,
              ewayBillExpiry: expiryDate,
              invoicedate: invDate
            });

            this.docketService.consignorForm.patchValue({
              consignorSelection: response.csgncd,
              consigneeSelection: response.csgecd,
              consigneeName: response.csgenm,
              consignorName: response.csgnm,
              consignorAddress: response.csgnAdd,
              consigneeAddress: response.csgeAdd,
              consigneePincode: response.toPincode,
              consignorCity: response.toCity,
              consignorGSTNo: response.consignor,
              consigneeGSTNo: response.consignee
            })

            this.docketService.basicDetailForm.patchValue({
              billingParty: response.partyCode,
              billingName: response.partyName,
              billingType: response.paybas,
              mode: response.transMode,
              pincode: response.pincode,
              fromCity: response.fromCity,
              toCity: response.toCity,
              destination: response.destcd,
            })
          } else {

          }
        }
      });
    }

  }
}
