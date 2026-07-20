import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-lr-exceptions-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-exceptions-tab.component.html',
  styles: []
})
export class LrExceptionsTabComponent implements OnInit, OnChanges {
  @Input() lrDetails: any;
  public isLoading: boolean = false;
  public tickets: any[] = [];

  constructor(private lrService: LrService) {}

  ngOnInit() {
    // Data is fetched via ngOnChanges when lrDetails is passed
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lrDetails'] && this.lrDetails) {
      this.fetchExceptionData();
    }
  }

  fetchExceptionData() {
    const lrNumber = this.lrDetails?.lR_Number;
    if (!lrNumber) return;

    this.isLoading = true;
    this.lrService.getExceptionTracking(lrNumber).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.tickets = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        }
      },
      error: () => {
        this.isLoading = false;
        this.tickets = [];
      }
    });
  }

  getIconForExceptionType(type: string): string {
    const lowerType = (type || '').toLowerCase();
    if (lowerType.includes('damage')) return '📦';
    if (lowerType.includes('shortage')) return '➖';
    if (lowerType.includes('excess')) return '➕';
    if (lowerType.includes('pilferage')) return '🕵️‍♂️';
    return '⚠️';
  }
}
