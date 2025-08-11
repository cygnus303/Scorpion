import { Component } from '@angular/core';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { IGSTchargesDetailResponse } from '../../../shared/models/general-master.model';
import { DocketService } from '../../../shared/services/docket.service';
import { ChargingRepsonse } from '../../../shared/models/general-master.model';

@Component({
  selector: 'freight-details',
  standalone: false,
  templateUrl: './freight-details.component.html',
  styleUrl: './freight-details.component.scss'
})
export class FreightDetailsComponent {
  toPayAmount: string = '0.00';

  chargingData: any[] = [];
  chargeAmounts: { [key: string]: any } = {};
  focusedCharge: any;
  constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService
  ) { }

  ngOnInit() {
    this.getChargesData();
    this.docketService.getIGSTchargesDetail();
    this.docketService.freightbuild()
  }

  // getChargesData() {
  //   this.basicDetailService.getChargeDetail().subscribe({
  //     next: (response) => {
  //       if (response) {
  //         this.chargingData = response;
  //       } else {
  //       }
  //     },
  //     error: () => {
  //     }
  //   });
  // }

  getChargesData() {
  this.basicDetailService.getChargeDetail().subscribe({
    next: (response) => {
      if (response) {
        this.chargingData = response;
        // Keep values null so placeholder is visible initially
        response.forEach((item: any) => {
          this.chargeAmounts[item.chargeCode] = 0; // <-- Default null
        });
      }
    }
  });
}

onFocus(chargeCode: string) {
  this.focusedCharge = chargeCode;
  if (this.chargeAmounts[chargeCode] === 0) {
    this.chargeAmounts[chargeCode] = null; // Clear on focus if zero
  }
}




onBlur(chargeCode: string) {
  if (
    this.chargeAmounts[chargeCode] === 0 ||
    this.chargeAmounts[chargeCode] === null ||
    isNaN(this.chargeAmounts[chargeCode])
  ) {
    this.chargeAmounts[chargeCode] = 0; // Set 0 if empty
  }
  this.focusedCharge = 0;
}
}
