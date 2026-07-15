import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-lr-docket-pl-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-docket-pl-tab.component.html',
  styles: []
})
export class LrDocketPlTabComponent implements OnInit, OnChanges {
  @Input() lrDetails: any;
  public isLoading: boolean = false;
  private lastFetchedLrNumber: string | null = null;

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

  public expenses: any[] = [];

  constructor(private lrService: LrService) {}

  ngOnInit() {
    this.fetchExpenseData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lrDetails']) {
      this.fetchExpenseData();
    }
  }

  fetchExpenseData() {
    const lrNumber = this.lrDetails?.lR_Number || this.lrDetails?.lrNumber || this.lrDetails?.LrNumber || this.lrDetails?.dockNo || this.lrDetails?.docket_No || this.lrDetails?.docketNo || '61247251';
    if (!lrNumber || lrNumber === this.lastFetchedLrNumber) return;

    this.lastFetchedLrNumber = lrNumber;
    this.isLoading = true;
    this.lrService.getExpenseDetailTracking(lrNumber).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.expenses = res.data || res || [];
          this.incomeDetails.totalExpense = this.totalExpense;
          this.incomeDetails.totalProfit = this.incomeDetails.totalIncome - this.totalExpense;
          this.incomeDetails.profitPercentage = Number(((this.incomeDetails.totalProfit / this.incomeDetails.totalIncome) * 100).toFixed(2));
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public get totalExpense(): number {
    return this.expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }
}
