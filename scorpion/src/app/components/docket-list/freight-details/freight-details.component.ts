import { Component } from '@angular/core';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { IGSTchargesDetailResponse } from '../../../shared/models/general-master.model';

@Component({
  selector: 'freight-details',
  standalone: false,
  templateUrl: './freight-details.component.html',
  styleUrl: './freight-details.component.scss'
})
export class FreightDetailsComponent {
toPayAmount: string = '0.00';
groupedCharges: { [ids: number]: any[] } = {};
constructor( private basicDetailService: BasicDetailService) {}
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

  ngOnInit(): void {
    this.getIGSTchargesDetail();
  }

   getIGSTchargesDetail() {
  this.basicDetailService.getIGSTchargesDetail().subscribe({
    next: (response) => {
      if (response) {
        this.groupedCharges = response.reduce((acc:any, item:any) => {
          if (!acc[item.ids]) acc[item.ids] = [];
          acc[item.ids].push(item);
          return acc;
        }, {} as { [ids: number]: any[] });
      }
    }
  });
}
}
