import { Component } from '@angular/core';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { IGSTchargesDetailResponse } from '../../../shared/models/general-master.model';
import { DocketService } from '../../../shared/services/docket.service';
import { ChargingRepsonse } from '../../../shared/models/general-master.model';
import { FormControl, FormGroup } from '@angular/forms';

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
      // Loop through charges and add controls dynamically
      response.forEach((item: any) => {
        if (!this.docketService.freightForm.contains(item.chargeCode)) {
          this.docketService.freightForm.addControl(
            item.chargeCode,
            new FormControl(0)
          );
        }
      });
    }
  }
});
}

onFocus(chargeCode: string) {
  const control = this.docketService.freightForm.get(chargeCode);
  if (control?.value === 0) {
    control.setValue(null);
  }
}

onBlur(chargeCode: string) {
  const control = this.docketService.freightForm.get(chargeCode);
  if (control && (control.value === null || control.value === '' || isNaN(control.value))) {
    control.setValue(0);
  }
}
}
