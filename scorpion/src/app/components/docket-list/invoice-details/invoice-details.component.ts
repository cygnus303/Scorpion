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
//   calculateSummary() {
//   const rows = this.invoiceRows.value;

//   const totalDeclaredValue = rows.reduce((sum, r) => sum + (+r.declaredValue || 0), 0);
//   const totalNoOfPkgs = rows.reduce((sum, r) => sum + (+r.noOfPkgs || 0), 0);
//   const totalCubicWeight = rows.reduce((sum, r) => sum + (+r.cubicWeight || 0), 0);
//   const totalActualWeight = rows.reduce((sum, r) => sum + (+r.actualWeight || 0), 0);

//   this.invoiceform.patchValue({
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
      chargedWeright:' 20.66',
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
      next: (response) => {
        if (response.success) {
          // this.serviceData = response.data;
        }
      },
    });
  }
}
