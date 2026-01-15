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
  public defaultContractList: any;

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
}

  getcontractservicecharge() {
    if (this.DefaultcontractForm.value.mode) {
      this.basicDetailService
        .contractservicecharge('P018888', this.DefaultcontractForm.value.mode)
        .subscribe({
          next: (response: any) => {
            if (response) {
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
    let totalCFT = 0;
    const cftRatio = this.DefaultcontractForm?.get('CFTRatio')?.value || 0;
      const length = Number(this.DefaultcontractForm.get('length')?.value) || 0;
      const breadth = Number(this.DefaultcontractForm.get('breadth')?.value) || 0;
      const height = Number(this.DefaultcontractForm.get('height')?.value) || 0;
      const noOfPkgs = Number(this.DefaultcontractForm.get('Pkgs')?.value) || 0;
      const cftTotal = length * breadth * height * cftRatio * noOfPkgs;
      totalCFT += cftTotal;
      this.DefaultcontractForm.patchValue( { cftTotal: parseFloat(cftTotal.toFixed(2)) }, { emitEvent: false });
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
