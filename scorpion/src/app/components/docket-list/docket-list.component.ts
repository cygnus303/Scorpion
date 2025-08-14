import { Component } from '@angular/core';
import { DocketService } from '../../shared/services/docket.service';

@Component({
  selector: 'app-docket-list',
  standalone: false,
  templateUrl: './docket-list.component.html',
  styleUrl: './docket-list.component.scss'
})
export class DocketListComponent {
constructor(
  public docketService:DocketService
){}

onSubmit(){

}

// createPayload() {
//   const payload = {
//     dvm: {
//       listCCH: [
//         {
//           chargeCode: this.form.value.chargeCode,
//           description: this.form.value.description,
//           amount: this.form.value.amount
//         }
//       ]
//     },
//     wmd: {
//       origin: this.form.value.origin,
//       destination: this.form.value.destination,
//       noOfPkgs: this.form.value.noOfPkgs,
//       actualWeight: this.form.value.actualWeight,
//       chargedWeight: this.form.value.chargedWeight,
//       customerCode: this.form.value.customerCode,
//       gstApplicable: this.form.value.gstApplicable,
//       // ... add other wmd fields
//     },
//     wmdc: {
//       freightAmount: this.form.value.freightAmount,
//       cgst: this.form.value.cgst,
//       sgst: this.form.value.sgst,
//       totalAmount: this.form.value.totalAmount
//       // ... add other wmdc fields
//     },
//     listInvoice: this.docketService.invoiceform.map((inv:any) => ({
//       invoiceNo: inv.invoiceNo,
//       invoiceDate: inv.invoiceDate,
//       invoiceAmount: inv.invoiceAmount
//     })),
//     listCharges: this.charges.map(ch => ({
//       chargeCode: ch.chargeCode,
//       amount: ch.amount
//     })),
//     listDocument: this.documents.map(doc => ({
//       documentType: doc.documentType,
//       documentNo: doc.documentNo
//     })),
//     objPRQ: {
//       pickupRequestNo: this.form.value.pickupRequestNo,
//       pickupDate: this.form.value.pickupDate
//       // ... add PRQ fields
//     }
//   };

//   return payload;
// }

}
