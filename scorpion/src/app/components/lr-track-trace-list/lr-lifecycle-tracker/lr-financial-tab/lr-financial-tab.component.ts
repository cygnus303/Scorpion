import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-lr-financial-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-financial-tab.component.html',
  styles: []
})
export class LrFinancialTabComponent implements OnChanges {
  @Input() lrDetails: any;
  public financialData: any = null;
  public isLoading: boolean = false;
  private loadedLrNo: string = '';

  constructor(private lrService: LrService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lrDetails']) {
      this.fetchFinancialData();
    }
  }

  fetchFinancialData() {
    if (!this.lrDetails) return;
    const lrNo = this.lrDetails.LrNumber || this.lrDetails.lrNumber || this.lrDetails.lR_Number;
    if (!lrNo || this.loadedLrNo === lrNo) return;

    this.loadedLrNo = lrNo;

    this.isLoading = true;
    this.lrService.getFinancialTracking(lrNo).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.financialData = res.data || res;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get regularCharges(): any[] {
    if (!this.financialData?.charges) return [];
    return this.financialData.charges.filter((c: any) => 
      !c.chargeHead?.toUpperCase().includes('CGST') && 
      !c.chargeHead?.toUpperCase().includes('SGST') && 
      !c.chargeHead?.toUpperCase().includes('IGST') &&
      !c.chargeHead?.toUpperCase().includes('GST')
    );
  }

  get taxCharges(): any[] {
    if (!this.financialData?.charges) return [];
    return this.financialData.charges.filter((c: any) => 
      c.chargeHead?.toUpperCase().includes('CGST') || 
      c.chargeHead?.toUpperCase().includes('SGST') || 
      c.chargeHead?.toUpperCase().includes('IGST') ||
      c.chargeHead?.toUpperCase().includes('GST')
    );
  }

  get subTotal(): number {
    return this.regularCharges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  }

  get grandTotal(): number {
    if (!this.financialData?.charges) return 0;
    return this.financialData.charges.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0);
  }

  formatDueDate(dateStr?: string): string {
    if (!dateStr || dateStr.includes('1900')) return 'N/A';
    return dateStr;
  }
}
