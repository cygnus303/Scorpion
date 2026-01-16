import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { DefaultContractService } from 'app/shared/services/default-contract.service';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
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
    public defaultContractService: DefaultContractService,
    private sweetAlertService:SweetAlertService
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
      weightKG:new FormControl(25, Validators.required),
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
      orgncd:new FormControl(''),
      orgArea:new FormControl(''),
      destArea:new FormControl(''),

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
              fromState: this.getPincodeMaster.stnm,
              orgncd: this.getPincodeMaster.locCode,
              orgArea: this.getPincodeMaster.area
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
              ODACategory: this.getPincodeMaster.category,
              destArea: this.getPincodeMaster.area
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
  const chargeFields = [
    'freightCharge','schG20','ODARate','stateChargesDetail',
    'stateCharges','schG08','schG04','schG17','uchG08',
    'schG10','ichG01','schG07'
  ];

  const subTotal = chargeFields.reduce((sum, field) => {
    const value = Number(this.DefaultcontractForm.get(field)?.value) || 0;
    return sum + value;
  }, 0);

  const discAmount = Number(this.DefaultcontractForm.get('Disc_amount')?.value) || 0;

  this.DefaultcontractForm.patchValue({
    subTotal,
    GrandTotal: subTotal - discAmount
  }, { emitEvent: false });

  this.originalSubtotal = subTotal;
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
    const data = this.DefaultcontractForm.value
    const payload = {
      enquiryID: 0,
      enquiryNo: "",
      enquiryDate: new Date().toISOString(),
      orgncd:data.orgncd,
      destcd: data.deliveryBranchCode,
      fromloc: data.originCity,
      toloc: data.destinationCity,
      fromState: data.fromState,
      toState: data.toState,
      orgPincode: data.originPincode,
      desTPincode: data.destination_pincode,
      orgArea: data.orgArea,
      destArea: data.destArea,
      orgZone: data.originZone,
      destZone: data.destinationZone,
      pickup_From_ODA: data.PickupODA,
      oda: data.ODA,
      odA_Category: data.ODACategory,
      taT_Normal:  Number(data.tatNormal),
      taT_ODA:  Number(data.tatoda),
      transDays:  Number(data.trDays),
      transMode:  data.mode,
      isVolumetric:  data.VolumetricAppl,
      declval:  data.invoiceValue || 0,
      pkgsno:  data.Pkgs || 0,
      actuwt:  data.weightKG || 0, //puchvanu
      chrgwt:  data.chrgwt || 0,
      voL_L:  data.length || 0,
      voL_B:  data.breadth || 0,
      voL_H:  data.height || 0,
      toT_CFT:  data.cftTotal || 0,
      vol_cft:  data.cftTotal || 0,//puchvanu
      ratE_TYPE: this.defaultContractList.rateType,
      frT_RATE: data.freightRate,
      freighT_CALC: data.freightRate,//puchvanu
      freight: data.freightCharge,
      subTotal: data.subTotal,
      isGSTApplied: true, //puchvanu
      gstType: "", //puchvanu
      igstRate: data.freightRate,
      igstAmount: 0, //puchvanu
      cgstRate: 0, //puchvanu
      cgstAmount: 0, //puchvanu
      sgstRate: 0, //puchvanu
      sgstAmount: 0, //puchvanu
      utgstRate: 0, //puchvanu
      utgstAmount: 0, //puchvanu
      discount: data.Disc_Rate || 0, //puchvanu
      discountValue: 0, //puchvanu
      discountAmt: data.Disc_amount, 
      discountType: "P",
      disSubTotal: data.Disc_Sub_Total || 0,
      quotTOT:data.GrandTotal || 0,
      isAppointmentDelivery:data.AppointmentDeliver,
      isCSDDelivery: data.CSDDelivery,
      isMAllDelivery: data.MallDelAppl,

      schG01:data.schG01, //puchvanu
      schG25:data.schG25, //puchvanu
      schG28:data.schG28, //puchvanu
      schG10:data.schG10,
      schG20:data.schG20,
      schG07:data.schG07,
      schG08:data.schG08,
      schG04:data.schG04,
      schG17:data.schG17,
      uchG08:data.uchG08,
      uchG06:data.uchG06, //puchvanu
      ichG01:data.ichG01,
      customerEmail: data.email,
      quotationStatus: "",
      entryBy: ""
    }
    console.log(payload)
    if (this.DefaultcontractForm.valid) {
      console.log(this.DefaultcontractForm.value);
      this.defaultContractService.DocketEnquirySubmit(payload).subscribe({next: (response: any) => {
          if (response) {
            this.buildForm();
            this.sweetAlertService.success('Successfully Submitted!!!');
          }else{
            this.sweetAlertService.error('Error');
          }
        }
      })
    } else {
      this.DefaultcontractForm.markAllAsTouched();
    }
  }

}
