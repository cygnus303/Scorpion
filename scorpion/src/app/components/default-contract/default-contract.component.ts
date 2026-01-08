import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'default-contract',
  standalone: false,
  templateUrl: './default-contract.component.html',
  styleUrl: './default-contract.component.scss'
})
export class DefaultContractComponent {
  contractPage!:FormGroup;

  ngOnInit(){
    this.buildForm()
  }

  buildForm(){
    this.contractPage=new FormGroup({
      originPincode:new FormControl(''),
      PickupArea:new FormControl(''),
      PickupODA:new FormControl(''),
      originCity:new FormControl(''),
      fromState:new FormControl(''),
      originZone:new FormControl(''),
      ODA_pickUp:new FormControl(''),
      email:new FormControl(''),
      destination_pincode:new FormControl(''),
      destinationArea:new FormControl(''),
      ODA:new FormControl(''),
      destinationCity:new FormControl(''),
      toState:new FormControl(''),
      destinationZone:new FormControl(''),
      deliveryBranchCode:new FormControl(''),
      ODACategory:new FormControl(''),
      mode:new FormControl(''),
      TATNormal:new FormControl(''),
      TATODA:new FormControl(''),
      transitDays:new FormControl(''),
      weightKG:new FormControl(''),
      Pkgs:new FormControl(''),
      VolumetricAppl:new FormControl(false),
      AppointmentDeliver:new FormControl(false),
      CSDDelivery:new FormControl(false),
      MallDelAppl:new FormControl(false),
    })
  }

}
