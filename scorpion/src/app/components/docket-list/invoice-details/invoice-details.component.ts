import { Component } from '@angular/core';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { DocketService } from '../../../shared/services/docket.service';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'invoice-details',
  standalone: false,
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.scss'
})
export class InvoiceDetailsComponent {
  public freightData:any;
 
 constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService
  ) { }
 
  ngOnInit() {
   this.docketService.invoicebuild()
  }

  removeRow(index: number): void {
    this.docketService.invoiceRows.removeAt(index);
  }

// calculateSummary() {
//   const volMeasureType = this.docketService.contractservicecharge; // 'INCHES' | 'CM' | 'FEET'
//   const cftWtRatio = +this.docketService.CFTWtRatio || 0; // you can bind from service
//   const rows = this.docketService.invoiceRows.value;

//   let totalDeclaredValue = 0;
//   let totalNoOfPkgs = 0;
//   let totalCubicWeight = 0;
//   let totalActualWeight = 0;

//   const updatedRows = rows.map((r: any) => {
//     const length = +r.length || 0;
//     const width = +r.width || 0;
//     const height = +r.height || 0;
//     const pkgsNo = +r.noOfPkgs || 0;

//     let volume = 0;

//     if (volMeasureType === 'INCHES') {
//       volume = (length * width * height * cftWtRatio) / 1728;
//     } else if (volMeasureType === 'CM') {
//       volume = (length * width * height * cftWtRatio) / 27000;
//     } else if (volMeasureType === 'FEET') {
//       volume = length * width * height * cftWtRatio;
//     }

//     const cubicWeight = +(volume * pkgsNo).toFixed(2);

//     totalDeclaredValue += +r.declaredValue || 0;
//     totalNoOfPkgs += pkgsNo;
//     totalCubicWeight += cubicWeight;
//     totalActualWeight += +r.actualWeight || 0;

//     return {
//       ...r,
//       cubicWeight // update cubic weight in row
//     };
//   });

//   // Push updated cubic weights back to form array
//   this.docketService.invoiceRows.patchValue(updatedRows);

//   // Patch totals to the form
//   this.docketService.invoiceform.patchValue({
//     totalDeclaredValue,
//     totalNoOfPkgs,
//     totalCubicWeight,
//     totalActualWeight,
//     chargeWeightPerPkg: totalNoOfPkgs ? totalActualWeight / totalNoOfPkgs : 0,
//     finalActualWeight: totalActualWeight
//   });
// }



  GetFreightContractDetails(event: any) {
    const noOfPkgs = event.target.value;
    const data = {
      chargeRule: 'NONE',
      baseCode1: 'NONE',
      chargeSubRule: 'NONE',
      baseCode2: 'NONE',
      chargedWeight: 'NONE',
      contractID: this.docketService.step2DetailsList.contractid,
      destination: this.docketService.basicDetailForm.value.destination,
      depth: 'CLRMS',
      flagProceed: 'p',
      fromCity: this.docketService.basicDetailForm.value.fromCity,
      ftlType: '67',
      noOfPkgs: noOfPkgs,
      chargedWeright: ' 20.66',
      origin: this.docketService.basicDetailForm.value.origin,
      payBase: this.docketService.basicDetailForm.value.billingType,
      serviceType: this.docketService.basicDetailForm.value.serviceType,
      toCity: this.docketService.basicDetailForm.value.toCity,
      transMode: this.docketService.basicDetailForm.value.mode,
      orderID: this.docketService.step2DetailsList.contractid,
      invAmt: '88',
      dockdt: new Date().toISOString(),
      prodcd: '',
      isPerPieceRate: false
    }

    this.basicDetailService.GetFreightContractDetails(data).subscribe({
      next: (response: any) => {
        if (response) {
          this.freightData = response.result[0];
          this.getOtherChargesDetail(this.freightData)
        }
      },
    });
  }

  getOtherChargesDetail(freightData: any) {
    const payload = {
      "chargeRule": 'NONE',
      "baseCode1": 'NONE',
      "chargeSubRule": "NONE",
      "baseCode2": "NONE",
      "chargedWeight": freightData?.chargedWeight.toString(),
      "contractID":this.docketService.step2DetailsList.contractid,
      "destination": this.docketService.basicDetailForm.value.destination,
      "depth": "string",
      "flagProceed": "string",
      "fromCity": this.docketService.basicDetailForm.value.fromCity,
      "ftlType": this.docketService.step2DetailsList.ftlType,
      "noOfPkgs": freightData?.noOfPkgs.toString(),
      "origin": this.docketService.basicDetailForm.value.origin,
      "payBase": this.docketService.basicDetailForm.value.billingType,
      "serviceType": this.docketService.basicDetailForm.value.serviceType,
      "toCity": this.docketService.basicDetailForm.value.toCity,
      "transMode": this.docketService.basicDetailForm.value.mode,
      "orderID": this.docketService.step2DetailsList.contractid,
      "invAmt": "string",
      "dockdt": this.docketService.basicDetailForm.value.cNoteDate,
      "prodType": "string",
      "packType": this.docketService.basicDetailForm.value.packingType,
      "riskType": this.docketService.step2DetailsList.risktype,
      "originPincode": 0,
      "destPincode": 0,
      "floorNo": 0
    }
    debugger
    this.basicDetailService.getOtherChargesDetail(payload).subscribe({
      next: (response) => {
        if (response.success) {

        }
      },
    });
  }
}
