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
  public chargingData:any;
  public pincodeMatrixData:any;
 
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
  calculateSummary(i: number) {
    const volMeasureType = this.docketService?.contractservicecharge[0]?.cft_Measure; // 'INCHES' | 'CM' | 'FEET'
    const cftWtRatio = +this.docketService?.contractservicecharge[0]?.cft_Ratio || 0; // you can bind from service
    const rows = this.docketService?.invoiceRows?.value;

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
      finalActualWeight: totalActualWeight
    });
  }

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
      depth: this.docketService.depth,
      flagProceed: this.docketService.flagprocedd,
      fromCity: this.docketService.basicDetailForm.value.fromCity,
      ftlType: this.docketService.step2DetailsList.ftlType,
      noOfPkgs: noOfPkgs,
      chargedWeright: Math.max(this.docketService.invoiceform.value.finalActualWeight || 0, this.docketService.invoiceform.value.totalCubicWeight || 0).toString(),
      origin: this.docketService.basicDetailForm.value.origin,
      payBase: this.docketService.basicDetailForm.value.billingType,
      serviceType: this.docketService.basicDetailForm.value.serviceType,
      toCity: this.docketService.basicDetailForm.value.toCity,
      transMode: this.docketService.basicDetailForm.value.mode,
      orderID: this.docketService.step2DetailsList.contractid,
      invAmt: this.docketService.invoiceform.value.totalDeclaredValue.toString(),
      dockdt: new Date().toISOString(),
      prodcd: '',
      isPerPieceRate: false
    }
    this.basicDetailService.GetFreightContractDetails(data).subscribe({
      next: (response: any) => {
        if (response) {
          this.freightData = response.result[0];
          this.docketService.freightForm.patchValue({
            freightCharges: this.freightData.freightCharge,
            rateType:this.freightData.rateType,
            freightRate:this.freightData.freightRate,
            EDD:new Date(this.freightData.edd)
  .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  .toUpperCase()
  .replace(/ /g, '-')
          })
        }
      },
    });
  }

  // getOtherChargesDetail(event: any) {
  //   const payload = {
  //     "chargeRule": 'NONE',
  //     "baseCode1": 'NONE',
  //     "chargeSubRule": "NONE",
  //     "baseCode2": "NONE",
  //     "chargedWeight":  Math.max(this.docketService.invoiceform.value.finalActualWeight || 0, this.docketService.invoiceform.value.totalCubicWeight || 0).toString(),
  //     "contractID":this.docketService.step2DetailsList.contractid,
  //     "destination": this.docketService.basicDetailForm.value.destination,
  //     "depth": "string",
  //     "flagProceed": "string",
  //     "fromCity": this.docketService.basicDetailForm.value.fromCity,
  //     "ftlType": this.docketService.step2DetailsList.ftlType,
  //     "noOfPkgs": event.target.value.toString(),
  //     "origin": this.docketService.basicDetailForm.value.origin,
  //     "payBase": this.docketService.basicDetailForm.value.billingType,
  //     "serviceType": this.docketService.basicDetailForm.value.serviceType,
  //     "toCity": this.docketService.basicDetailForm.value.toCity,
  //     "transMode": this.docketService.basicDetailForm.value.mode,
  //     "orderID": this.docketService.step2DetailsList.contractid,
  //     "invAmt": this.docketService.invoiceform.value.totalDeclaredValue.toString(),
  //     "dockdt": this.docketService.basicDetailForm.value.cNoteDate,
  //     "prodType": this.docketService.basicDetailForm.value.contents,
  //     "packType": this.docketService.basicDetailForm.value.packingType,
  //     "riskType": this.docketService.step2DetailsList.risktype,
  //     "originPincode":this.docketService.consignorForm.value.consignorPincode,
  //     "destPincode": this.docketService.consignorForm.value.consigneePincode,
  //     "floorNo": 0
  //   }
  //   this.basicDetailService.getOtherChargesDetail(payload).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //       }
  //     },
  //   });
  // }

  getOtherChargesDetail(event: any) {
    const chargedWeight = Math.max(
      this.docketService.invoiceform.value.finalActualWeight || 0,
      this.docketService.invoiceform.value.totalCubicWeight || 0
    ).toString();

    const payload = {
      "chargeRule": 'NONE',
      "baseCode1": 'NONE',
      "chargeSubRule": "NONE",
      "baseCode2": "NONE",
      "chargedWeight": chargedWeight,
      "contractID": this.docketService.step2DetailsList.contractid,
      "destination": this.docketService.basicDetailForm.value.destination,
      "depth":this.docketService.depth,
      "flagProceed": this.docketService.flagprocedd,
      "fromCity": this.docketService.basicDetailForm.value.fromCity,
      "ftlType": this.docketService.step2DetailsList.ftlType,
      "noOfPkgs": event?.target?.value?.toString(),
      "origin": this.docketService.basicDetailForm.value.origin,
      "payBase": this.docketService.basicDetailForm.value.billingType,
      "serviceType": this.docketService.basicDetailForm.value.serviceType,
      "toCity": this.docketService.basicDetailForm.value.toCity,
      "transMode": this.docketService.basicDetailForm.value.mode,
      "orderID": this.docketService.step2DetailsList.contractid,
      "invAmt": this.docketService.invoiceform.value.totalDeclaredValue?.toString(),
      "dockdt": this.docketService.basicDetailForm.value.cNoteDate,
      "prodType": this.docketService.basicDetailForm.value.contents,
      "packType": this.docketService.basicDetailForm.value.packingType,
      "riskType": this.docketService.step2DetailsList.risktype,
      "originPincode": this.docketService.consignorForm.value.consignorPincode || 0,
      "destPincode":this.docketService.basicDetailForm.value.pincode || 0,
      "floorNo": 0
    };

    // Required fields check
    const allFieldsFilled = Object.values(payload).every(
      value => value !== null && value !== undefined && value !== '' && value !== '0'
    );

    if (!allFieldsFilled) {
      console.warn('Required fields are missing. Skipping API call.');
      return;
    }

    // Call API only if all fields are filled
    this.basicDetailService.getOtherChargesDetail(payload).subscribe({
      next: (response) => {
        if (response) {
          this.chargingData = response;
          this.chargingData.forEach((item: any) => {
            if (this.docketService.freightForm.contains(item.chargecode)) {
              this.docketService.freightForm.patchValue({
                [item.chargecode]: item.charge
              });
            }
          });
        }
      },
    });
  }


  // getPincodeMatrixData() {
  //   const payload = {
  //     KM_From_Location: 0,
  //     CHRGWT: 1
  //   }
  //   this.basicDetailService.getPincodematrix(payload).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         this.pincodeMatrixData = response
  //       }
  //     },
  //   });
  // }
}
