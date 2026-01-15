import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { DefaultContractService } from 'app/shared/services/default-contract.service';
import { DocketService } from 'app/shared/services/docket.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'default-contract',
  standalone: false,
  templateUrl: './default-contract.component.html',
  styleUrl: './default-contract.component.scss'
})
export class DefaultContractComponent {
  public getPincodeMaster: any;
  public DefaultcontractForm!: FormGroup;
  public contractcharge:any;
  public defaultContractList: any;
  public originalSubtotal:any;

  constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService,
    public defaultContractService: DefaultContractService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.docketService.getTransportModeData();

    this.DefaultcontractForm.get('AppointmentDeliver')?.valueChanges.subscribe(() => {this.setAppointmentCharge()});
    this.DefaultcontractForm.get('CSDDelivery')?.valueChanges.subscribe(() => {this.setCSDDeliveryCharge()});
    this.DefaultcontractForm.get('MallDelAppl')?.valueChanges.subscribe(() => {this.setMallDeliveryCharge()});
  }

  buildForm(){
    this.DefaultcontractForm=new FormGroup({
      originPincode:new FormControl(null, Validators.required),
      PickupArea:new FormControl(''),
      PickupODA:new FormControl(''),
      originCity:new FormControl(''),
      fromState:new FormControl(''),
      originZone:new FormControl(''),
      email:new FormControl('',[Validators.required, Validators.email]),
      destination_pincode:new FormControl(null, Validators.required),
      destinationArea:new FormControl(''),
      ODA:new FormControl(''),
      destinationCity:new FormControl(''),
      toState:new FormControl(''),
      destinationZone:new FormControl(''),
      deliveryBranchCode:new FormControl(''),
      ODACategory:new FormControl(''),
      mode:new FormControl(null),
      tatNormal:new FormControl(''),
      tatoda:new FormControl(''),
      trDays:new FormControl(''),
      weightKG:new FormControl(0, Validators.required),
      Pkgs:new FormControl(0, Validators.required),
      VolumetricAppl:new FormControl(false),
      AppointmentDeliver:new FormControl(false),
      CSDDelivery:new FormControl(false),
      MallDelAppl:new FormControl(false),
      invoiceValue:new FormControl(0, Validators.required),
      chrgwt:new FormControl(0),
      cftTotal:new FormControl(0),
      freightRate:new FormControl(0),
      length:new FormControl(''),
      breadth:new FormControl(''),
      height:new FormControl(''),
      CFTRatio:new FormControl(''),
      fuelSurchrg:new FormControl(0,Validators.required),

      freightCharge:new FormControl(0),
      schG07:new FormControl(0),
      schG20:new FormControl(0),
      ODARate:new FormControl(0),
      gstRate:new FormControl(0),
      stateChargesDetail:new FormControl(0),
      stateCharges:new FormControl(0),
      schG08:new FormControl(0),
      schG04:new FormControl(0),
      schG17:new FormControl(0),
      uchG08:new FormControl(0),
      schG10:new FormControl(0),
      ichG01:new FormControl(0),

      Disc_Rate:new FormControl(0),
      Disc_amount:new FormControl(0),
      Disc_Sub_Total:new FormControl(0),
      subTotal:new FormControl(0),
      GrandTotal:new FormControl(0),
      fuelSurchrgBas:new FormControl()
    });
    this.listenDefaultContractChanges();
  }

  listenDefaultContractChanges() {
    this.DefaultcontractForm.valueChanges.pipe(debounceTime(500), map(form => ({
      mode: form.mode,
      invoiceValue: form.invoiceValue,
      Pkgs: form.Pkgs,
      originPincode: form.originPincode,
      destinationPincode: form.destination_pincode
    })),distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe(() => {
        this.calculateRate();
      });
  }


  clearOnFocus(controlName: string) {
    const control = this.DefaultcontractForm.get(controlName);
    if (control && control.value === 0) {
      control.setValue('');
    }
  }

  resetOnBlur(controlName: string) {
    const control = this.DefaultcontractForm.get(controlName);
    if (control && !control.value) {
      control.setValue(0);
    }
  }

  getPincodeMasterList(event: any, type: string) {
    this.basicDetailService.getPincodeMasterList(event.value).subscribe({
      next: (response: any) => {
        if (response) {
          this.getPincodeMaster = response;
          if (type === 'origin') {
            this.DefaultcontractForm.patchValue({
              PickupArea: this.getPincodeMaster.area,
              PickupODA: this.getPincodeMaster.is_ODA_Apply,
              originCity: this.getPincodeMaster.location,
              originZone: this.getPincodeMaster.regionName,
              fromState: this.getPincodeMaster.stnm
            })
          }
          if (type === 'destination') {
            this.DefaultcontractForm.patchValue({
              destinationArea: this.getPincodeMaster.area,
              ODA: this.getPincodeMaster.is_ODA_Apply,
              destinationCity: this.getPincodeMaster.location,
              destinationZone:this.getPincodeMaster.regionName,
              toState:  this.getPincodeMaster.stnm,
              deliveryBranchCode: this.getPincodeMaster.locCode,
              ODACategory: this.getPincodeMaster.category
            })
          }
        }
      }
    });
  }

  calculateRate() {
    const payload = {
      trnMode: this.DefaultcontractForm.value.mode,
      contractID: "P018888",
      invoiceAmount: this.DefaultcontractForm.value.invoiceValue || 0,
      actualWeight: this.DefaultcontractForm.value.chargeWeightKG || 0,
      totalCFT: 0,
      packageCount: this.DefaultcontractForm.value.Pkgs || 0,
      originPincode: this.DefaultcontractForm.value.originPincode,
      destinationPincode: this.DefaultcontractForm.value.destination_pincode
    }
    if (!payload.trnMode || !payload.invoiceAmount || !payload.packageCount || !payload.originPincode || !payload.destinationPincode) {
      return;
    }
    this.defaultContractService.calculateRate(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.defaultContractList = response;
          this.DefaultcontractForm.patchValue(response);
          this.setAppointmentCharge();
          this.setCSDDeliveryCharge();
          this.setMallDeliveryCharge();
          this.calculateSubTotal();
        }
      }
    })
  }

setAppointmentCharge() {
  if (this.DefaultcontractForm.get('AppointmentDeliver')?.value) {
    this.DefaultcontractForm.get('uchG08')?.setValue(this.defaultContractList.uchG08);
  } else {
    this.DefaultcontractForm.get('uchG08')?.setValue(0);
  }
}

setCSDDeliveryCharge() {
  if (this.DefaultcontractForm.get('CSDDelivery')?.value) {
    this.DefaultcontractForm.get('schG10')?.setValue(this.defaultContractList.schG10);
  } else {
    this.DefaultcontractForm.get('schG10')?.setValue(0);
  }
}

setMallDeliveryCharge() {
  if (this.DefaultcontractForm.get('MallDelAppl')?.value) {
    this.DefaultcontractForm.get('schG17')?.setValue(this.defaultContractList.schG17);
  } else {
    this.DefaultcontractForm.get('schG17')?.setValue(0);
  }
}

calculateSubTotal() {
  const chargeFields = ['freightCharge','schG20','ODARate','stateChargesDetail','stateCharges','schG08',
    'schG04','schG17','uchG08','schG10','ichG01','schG07','Disc_amount'];
  const subTotal = chargeFields.reduce((sum, field) => {
    const value = this.DefaultcontractForm.get(field)?.value || 0;
    return sum + value;
  }, 0);
  const discAmount = this.DefaultcontractForm.get('Disc_amount')?.value || 0;
  const grandTotal = subTotal - discAmount;
  this.DefaultcontractForm.patchValue({
    subTotal: subTotal,
    GrandTotal: grandTotal
  }, { emitEvent: false }); 
  this.originalSubtotal = this.DefaultcontractForm.value.subTotal;
}

  getcontractservicecharge() {
    if (this.DefaultcontractForm.value.mode) {
      this.basicDetailService
        .contractservicecharge('P018888', this.DefaultcontractForm.value.mode)
        .subscribe({
          next: (response: any) => {
            if (response) {
              this.contractcharge=response[0];
              this.DefaultcontractForm.patchValue({
                CFTRatio: response[0].cft_Ratio,
                fuelSurchrg:response[0].fuelSurchrg,
                fuelSurchrgBas:response[0].fuelSurchrgBas
              });
            }
          },
          error: (err) => {
            console.error("Error in contractservicecharge:", err);
          },
        });
    }
  }

  getCFTCalculation() {

  let volMeasureType = '';
  let cftWtRatio = 0;
  if (this.contractcharge) {
    volMeasureType = this.contractcharge?.cft_Measure; // 'INCHES' | 'CM' | 'FEET'
    cftWtRatio = this.contractcharge?.cft_Ratio || 0;
  }

    let length = this.DefaultcontractForm.value.length || 0;
    let breadth = this.DefaultcontractForm.value.breadth || 0;
    let height = this.DefaultcontractForm.value.height || 0;
    const pkgsNo = this.DefaultcontractForm.value.Pkgs || 0;

    let cubicweight = 0;

      // Normal volume calculation
      let volume = 0;
      if (volMeasureType === 'INCHES') {
        volume = (length * breadth * height * cftWtRatio) / 1728;
      } else if (volMeasureType === 'CM') {
        volume = (length * breadth * height * cftWtRatio) / 27000;
      } else if (volMeasureType === 'FEET') {
        volume = length * breadth * height * cftWtRatio;
      }

      cubicweight = +(volume * pkgsNo).toFixed(2);

      this.DefaultcontractForm.patchValue({
        cftTotal:cubicweight
      })
  }

  calculateDiscount() {
  let Subtotal = this.originalSubtotal || 0;

  let discounts = this.DefaultcontractForm.value.Disc_Rate;
  let gstRate = this.DefaultcontractForm.value.gstRate;
  discounts = parseFloat(Subtotal.toString()) * parseFloat(discounts) / 100;

  const discountSubTotal=Subtotal - discounts;
  const grandTotal= discountSubTotal - gstRate;

  this.DefaultcontractForm.patchValue({
    Disc_amount: discounts.toFixed(2),
    Disc_Sub_Total:discountSubTotal.toFixed(2),
    GrandTotal :grandTotal.toFixed(2)
  });

}


  OnSubmit() {
    const data ={
      ...this.DefaultcontractForm.value
    }
    console.log(data);
    if (this.DefaultcontractForm.valid) {
      console.log(this.DefaultcontractForm.value);
    } else {
      this.DefaultcontractForm.markAllAsTouched();
    }
  }

}
