import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { BillReceiptComponent } from './bill-receipt/bill-receipt.component';

@Component({
  selector: 'app-bill-collection',
  standalone: true,
  imports: [CommonModule, BillReceiptComponent],
  templateUrl: './bill-collection.component.html',
  styleUrl: './bill-collection.component.scss'
})
export class BillCollectionComponent {
  @ViewChild('BillReceiptComponent') BillReceiptComponent!: BillReceiptComponent;

  openPopup() {
    this.BillReceiptComponent.showPopup();
  }
}
