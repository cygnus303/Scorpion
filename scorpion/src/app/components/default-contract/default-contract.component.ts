import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { DefaultContractService } from 'app/shared/services/default-contract.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'default-contract',
  standalone: false,
  templateUrl: './default-contract.component.html',
  styleUrl: './default-contract.component.scss'
})
export class DefaultContractComponent {
  public getPincodeMaster: any;
  public DefaultcontractForm!: FormGroup;

  constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService,
    public defaultContractService: DefaultContractService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.docketService.getTransportModeData()
  }

  buildForm() {
    this.DefaultcontractForm = new FormGroup({
      originPincode: new FormControl(null, Validators.required),
      PickupArea: new FormControl(''),
      PickupODA: new FormControl(''),
      originCity: new FormControl(''),
      fromState: new FormControl(''),
      originZone: new FormControl(''),
      ODA_pickUp: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      destination_pincode: new FormControl(null, Validators.required),
      destinationArea: new FormControl(''),
      ODA: new FormControl(''),
      destinationCity: new FormControl(''),
      toState: new FormControl(''),
      destinationZone: new FormControl(''),
      deliveryBranchCode: new FormControl(''),
      ODACategory: new FormControl(''),
      mode: new FormControl(null),
      TATNormal: new FormControl(''),
      TATODA: new FormControl(''),
      transitDays: new FormControl(''),
      weightKG: new FormControl(0, Validators.required),
      Pkgs: new FormControl(0, Validators.required),
      VolumetricAppl: new FormControl(false),
      AppointmentDeliver: new FormControl(false),
      CSDDelivery: new FormControl(false),
      MallDelAppl: new FormControl(false),
      invoiceValue: new FormControl(0, Validators.required),
      chargeWeightKG: new FormControl(0),
      CFTweight: new FormControl(0),
      rate: new FormControl(0),
      length: new FormControl(''),
      breadth: new FormControl(''),
      height: new FormControl(''),
      CFTRatio: new FormControl(''),
      fuelSurcharge: new FormControl('', Validators.required),
      freightRs: new FormControl(0),
      fuelSurchargeRs: new FormControl(0),
      ODARate: new FormControl(0),
      gst: new FormControl(0),
      stateChargesDetail: new FormControl(0),
      stateCharges: new FormControl(0),
      ODAAmount: new FormControl(0),
      docketCharge: new FormControl(''),
      mallDeliveryCharge: new FormControl(0),
      appoinmentCharge: new FormControl(0),
      CSDCharge: new FormControl(0),
      InsuranceCharge: new FormControl(0),
      Disc_Rate: new FormControl(0),
      Disc_amount: new FormControl(0),
      Disc_Sub_Total: new FormControl(0),
      subTotal: new FormControl(0),
      GrandTotal: new FormControl(0),
      fuelSurchrgBas:new FormControl()
    })
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
              originZone: '',
              fromState: ''
            })
          }
          if (type === 'destination') {
            this.DefaultcontractForm.patchValue({
              destinationArea: this.getPincodeMaster.area,
              ODA: this.getPincodeMaster.is_ODA_Apply,
              destinationCity: this.getPincodeMaster.location,
              destinationZone: '',
              toState: '',
              deliveryBranchCode: this.getPincodeMaster.locCode
            })
          }
        }
      }
    });
    this.calculateRate()
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

    if (!this.DefaultcontractForm.value.mode || !this.DefaultcontractForm.value.invoiceValue ||
      !this.DefaultcontractForm.value.Pkgs || !this.DefaultcontractForm.value.originPincode || !this.DefaultcontractForm.value.destination_pincode
    ) {
      return;
    }
    this.defaultContractService.calculateRate(payload).subscribe({
      next: (response: any) => {
        if (response) {
          console.log(response);
          const csdCharge = response.otherCharges?.find((x: any) => x.chargecode === 'SCHG10')?.charge || 0;
          const malldelivery = response.otherCharges?.find((x: any) => x.chargecode === 'SCHG17')?.charge || 0;
          const appoinment = response.otherCharges?.find((x: any) => x.chargecode === 'UCHG08')?.charge || 0;
          const fuelSurcharge = response.otherCharges?.find((x: any) => x.chargecode === 'SCHG20')?.charge || 0;
          this.DefaultcontractForm.patchValue({
            freightRs: response.freight.freightCharge,
            chargeWeightKG: response.freight.chrgwt,
            CSDCharge: csdCharge,
            mallDeliveryCharge: malldelivery,
            appoinmentCharge: appoinment,

          })

        }

      }
    })
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
                fuelSurcharge:response[0].fuelSurchrg,
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

  OnSubmit() {
    if (this.DefaultcontractForm.valid) {
      console.log(this.DefaultcontractForm.value);
    } else {
      this.DefaultcontractForm.markAllAsTouched();
    }
  }

}
