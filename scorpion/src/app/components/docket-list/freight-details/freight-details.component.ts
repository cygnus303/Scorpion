import { Component } from '@angular/core';

@Component({
  selector: 'freight-details',
  standalone: false,
  templateUrl: './freight-details.component.html',
  styleUrl: './freight-details.component.scss'
})
export class FreightDetailsComponent {
toPayAmount: string = '0.00';

  onFocus(): void {
    if (this.toPayAmount === '0.00') {
      this.toPayAmount = '';
    }
  }

  onBlur(): void {
    if (this.toPayAmount.trim() === '') {
      this.toPayAmount = '0.00';
    }
  }
}
