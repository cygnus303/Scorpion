import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-lr-operational-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-operational-tab.component.html',
  styles: []
})
export class LrOperationalTabComponent implements OnChanges {
  @Input() lrDetails: any;
  public operationData: any = null;
  public isLoading: boolean = false;
  private lastFetchedLrNo: string | null = null;

  constructor(private lrService: LrService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lrDetails'] && this.lrDetails) {
      const lrNo = this.lrDetails.lR_Number || this.lrDetails.lrNumber || this.lrDetails.LrNumber;
      if (lrNo && lrNo !== this.lastFetchedLrNo) {
        this.lastFetchedLrNo = lrNo;
        this.fetchCycleData(lrNo);
      }
    }
  }

  fetchCycleData(lrNo: string) {
    this.isLoading = true;
    this.lrService.getOperationCycle(lrNo).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.data) {
          this.operationData = res.data;
        } else {
          this.operationData = res;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error fetching operation cycle", err);
      }
    });
  }
}

