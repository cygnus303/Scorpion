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
  invoiceform!: FormGroup;
 noOfRows: number = 1;
 constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService
  ) { }
  addRows(): void {
    for (let i = 0; i < this.noOfRows; i++) {
      this.invoiceRows.push(this.createInvoiceRow());
    }
  }

  removeRow(index: number): void {
    this.invoiceRows.removeAt(index);
  }

   ngOnInit(): void {
    this.invoiceform = new FormGroup({
      invoiceRows: new FormArray([]),
        // Summary row 1
    totalDeclaredValue: new FormControl(0),
    totalNoOfPkgs: new FormControl(0),
    totalCubicWeight: new FormControl(0),
    totalActualWeight: new FormControl(0),

    // Summary row 2
    chargeWeightPerPkg: new FormControl(0),
    finalActualWeight: new FormControl(0)
    });

    // Add default 1 row
    this.addRows();
  }

  get invoiceRows(): FormArray {
    return this.invoiceform.get('invoiceRows') as FormArray;
  }

   createInvoiceRow(): FormGroup {
    return new FormGroup({
      ewayBillNo: new FormControl(''),
      ewayBillExpiry: new FormControl(''),
      invoiceValue: new FormControl(0),
      invoiceDate: new FormControl(''),
      invoiceNo: new FormControl(''),
      declaredValue: new FormControl(0),
      noOfPkgs: new FormControl(0),
      actualWeight: new FormControl(0),
      length: new FormControl(0),
      breadth: new FormControl(0),
      height: new FormControl(0),
      cubicWeight: new FormControl(0),
      invoicedate:new FormControl(0),
      declaredvalue:new FormControl(0),
      cubicweight:new FormControl(0),
    });
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
