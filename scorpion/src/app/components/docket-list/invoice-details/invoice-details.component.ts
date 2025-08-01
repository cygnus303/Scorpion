import { Component } from '@angular/core';

@Component({
  selector: 'invoice-details',
  standalone: false,
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.scss'
})
export class InvoiceDetailsComponent {
 noOfRows: number = 1;
  invoiceRows: any[] = [{}]; // default 2 rows

  addRows() {
    for (let i = 0; i < this.noOfRows; i++) {
      this.invoiceRows.push({});
    }
  }

  removeRow(index: number) {
    this.invoiceRows.splice(index, 1);
  }
}
