import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lr-docket-pl-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-docket-pl-tab.component.html',
  styles: []
})
export class LrDocketPlTabComponent {
  @Input() lrDetails: any;

  public topMetaData = {
    dockNo: '63378343',
    docketDate: '3/6/2025',
    edd: '5/14/2025',
    deliveryDate: '5/21/2026',
    originDest: 'PRM — GWT'
  };

  public incomeDetails = {
    subTotal: 1025.00,
    supBillNo: '—',
    supBillAmt: 0.00,
    totalIncome: 1025.00,
    totalExpense: 678.03,
    totalProfit: 346.97,
    profitPercentage: 33.85
  };

  public expenses = [
    { type: 'PRS', docNo: 'PRS/PRM/2627/000765', amount: 50.00 },
    { type: 'PRS L HCC NO', docNo: 'HC/PRM/2627/001740', amount: 35.00 },
    { type: 'PRS UL HCC NO', docNo: '—', amount: 0.00 },
    { type: 'DRS', docNo: 'DRS/GWT/2627/001211', amount: 70.18 },
    { type: 'DRS L HCC NO', docNo: 'HC/GWT/2627/000917', amount: 7.50 },
    { type: 'DRS UL HCC NO', docNo: 'HC/GWT/2627/000918', amount: 15.85 },
    { type: 'THC', docNo: 'VH/BWH/2627/000872, VH/SLH/2627/000462', amount: 478.35 },
    { type: 'THC L HCC NO', docNo: 'HC/BWH/2627/003468, HC/SLH/2627/000941', amount: 7.14 },
    { type: 'THC UL HCC NO', docNo: 'HC/SLH/2627/000930, HC/GWT/2627/000962', amount: 13.80 }
  ];

  public get totalExpense(): number {
    return this.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }
}
