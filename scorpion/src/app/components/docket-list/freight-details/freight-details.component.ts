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
  public originalCharges: any[] = [];

 
  chargeAmounts: { [key: string]: any } = {};
  focusedCharge: any;
  constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService
  ) { }

  ngOnInit() {
   
    this.docketService.getIGSTchargesDetail();
    this.docketService.freightbuild();

    this.docketService.basicDetailForm.get('IsMAllDeliveryN')?.valueChanges.subscribe(value => {
    // this.updateCharge('SCHG17', value); // Mall Delivery Charges
    this.docketService.freightForm.patchValue({SCHG17:0})
    if(value){
      this.docketService.getOtherChargesDetail();
    }
    this.docketService.getGSTCalculation();
    this.docketService.subTotalCalculation();
  });

  this.docketService.basicDetailForm.get('iscsdDelivery')?.valueChanges.subscribe(value => {
    // this.updateCharge('SCHG10', value); // CSD Delivery Charges
     this.docketService.freightForm.patchValue({SCHG10:0})
    if(value){
      this.docketService.getOtherChargesDetail();
    }
    this.docketService.getGSTCalculation();
    this.docketService.subTotalCalculation();
  });

  this.docketService.basicDetailForm.get('isAppointmentDelivery')?.valueChanges.subscribe(value => {
    // this.updateCharge('UCHG08', value); // Appointment Charges
     this.docketService.freightForm.patchValue({UCHG08:0})
    if(value){
      this.docketService.getOtherChargesDetail();
    }
    this.docketService.getGSTCalculation();
    this.docketService.subTotalCalculation();
  });
   this.getChargesData();
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
        this.docketService.freightchargingData = response;
       this.originalCharges = JSON.parse(JSON.stringify(response));
        // Form controls banavva
        this.docketService.freightchargingData.forEach((item: any) => {
          if (!this.docketService.freightForm.contains(item.chargeCode)) {
            this.docketService.freightForm.addControl(
              item.chargeCode,
              new FormControl(item.chargeAmount || 0)
            );
          } else {
            // Already control hoy to value update karvi
            this.docketService.freightForm
              .get(item.chargeCode)
              ?.setValue(item.chargeAmount || 0);
          }
        });
      }
    }
  });
}

updateCharge(chargeCode: string, isSelected: boolean) {
  // Get original charge from originalCharges array
  const originalItem = this.originalCharges.find(c => c.chargeCode === chargeCode);
  if (originalItem) {
    const amount = isSelected ? originalItem.chargeAmount : 0;
    this.docketService.freightForm.get(chargeCode)?.setValue(amount);
  }
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
