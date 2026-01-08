import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'default-contract',
  standalone: false,
  templateUrl: './default-contract.component.html',
  styleUrl: './default-contract.component.scss'
})
export class DefaultContractComponent {
  public getPincodeMaster: any;
  DefaultcontractForm!:FormGroup;

  constructor(
    public docketService:DocketService,
    public basicDetailService:BasicDetailService
  ){}

  ngOnInit(){
    this.buildForm();
    this.docketService.getTransportModeData()
  }

  buildForm(){
    this.DefaultcontractForm=new FormGroup({
      originPincode:new FormControl(null, Validators.required),
      PickupArea:new FormControl(''),
      PickupODA:new FormControl(''),
      originCity:new FormControl(''),
      fromState:new FormControl(''),
      originZone:new FormControl(''),
      ODA_pickUp:new FormControl(''),
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
      TATNormal:new FormControl(''),
      TATODA:new FormControl(''),
      transitDays:new FormControl(''),
      weightKG:new FormControl('', Validators.required),
      Pkgs:new FormControl('', Validators.required),
      VolumetricAppl:new FormControl(false),
      AppointmentDeliver:new FormControl(false),
      CSDDelivery:new FormControl(false),
      MallDelAppl:new FormControl(false),
      invoiceValue:new FormControl('', Validators.required),
      chargeWeightKG:new FormControl(''),
      CFTweight:new FormControl(''),
      rate:new FormControl(''),
      length:new FormControl(''),
      breadth:new FormControl(''),
      height:new FormControl(''),
      CFTRatio:new FormControl(''),
      fuelSurcharge:new FormControl('',Validators.required),
      freightRs:new FormControl(''),
      fuelSurchargeRs:new FormControl(''),
      ODARate:new FormControl(''),
      gst:new FormControl(''),
      stateChargesDetail:new FormControl(''),
      stateCharges:new FormControl(''),
      ODAAmount:new FormControl(''),
      docketCharge:new FormControl(''),
      mallDeliveryCharge:new FormControl(''),
      appoinmentCharge:new FormControl(''),
      CSDCharge:new FormControl(''),
      InsuranceCharge:new FormControl(''),
      Disc_Rate:new FormControl(''),
      Disc_amount:new FormControl(''),
      Disc_Sub_Total:new FormControl(''),
      subTotal:new FormControl(''),
      GrandTotal:new FormControl('')
    })
  }

  getPincodeMasterList(event: any,type:string) {
    this.basicDetailService.getPincodeMasterList(event.value).subscribe({
      next: (response: any) => {
        if (response) {
          this.getPincodeMaster = response;
          if(type==='origin'){
          this.DefaultcontractForm.patchValue({
            PickupArea:this.getPincodeMaster.area,
            PickupODA:this.getPincodeMaster.is_ODA_Apply,
            originCity:this.getPincodeMaster.location,
            originZone:'',
            fromState:''
          })
        }
        if(type==='destination'){
          this.DefaultcontractForm.patchValue({
            destinationArea:this.getPincodeMaster.area,
            ODA:this.getPincodeMaster.is_ODA_Apply,
            destinationCity:this.getPincodeMaster.location,
            destinationZone:'',
            toState:'',
            deliveryBranchCode:this.getPincodeMaster.locCode
          })
        }
        }
      }
    });
  }

  OnSubmit(){
    if(this.DefaultcontractForm.valid){
      console.log(this.DefaultcontractForm.value);
    }else{
      this.DefaultcontractForm.markAllAsTouched();
    }
  }

}
