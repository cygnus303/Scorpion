import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DocketService {
 docketForm: FormGroup;

  billingTypes = ['Paid', 'To Pay', 'FOC'];
  transitModes = ['Air', 'Road', 'Train'];
  serviceTypes = ['Express', 'Surface'];
  packagingTypes = ['Box', 'Bag', 'Loose'];
  movementTypes = ['Intra', 'Inter'];
  businessTypes = ['B2B', 'B2C'];
  cities = ['Ahmedabad', 'Mumbai', 'Delhi', 'Bangalore'];
  states = ['Gujarat', 'Maharashtra', 'Karnataka', 'Delhi'];

  billingParties = ['Party A', 'Party B', 'Party C'];
  destinations = ['Destination X', 'Destination Y', 'Destination Z'];
  pickupDeliveries = ['Pickup', 'Delivery', 'Both'];

  constructor() {
    this.docketForm = this.createDocketForm();
  }

  createDocketForm(): FormGroup {
    return new FormGroup({
      entryType: new FormControl('Normal'),
      cnoteNo: new FormControl(''),
      billingType: new FormControl(''),
      billingParty: new FormControl(''),
      origin: new FormControl(''),
      destination: new FormControl(''),
      transitMode: new FormControl(''),
      pickupDelivery: new FormControl(''),
      contents: new FormControl(''),
      specialInstruction: new FormControl(''),
      applyReferenceDkt: new FormControl(true),
      sacCode: new FormControl(''),
      appointmentDelivery: new FormControl(true),
      odaApplicable: new FormControl(false),

      ewaybillNumber: new FormControl(''),
      cnoteDate: new FormControl(new Date().toISOString().substring(0,10)),
      pincode: new FormControl(''),
      billingName: new FormControl(''),
      originStateName: new FormControl(''),
      destStateName: new FormControl(''),
      fromCity: new FormControl(''),
      toCity: new FormControl(''),
      serviceType: new FormControl(''),
      packagingType: new FormControl(''),
      exemptServices: new FormControl(''),
      referenceDocket: new FormControl(''),
      sacCodeDesc: new FormControl(''),
      csdDelivery: new FormControl(false),
      isLocalCnote: new FormControl(false),
      isDocketPayment: new FormControl(false),
      mallDelivery: new FormControl(false),
      appointmentDate: new FormControl(new Date().toISOString().substring(0,10)),
      fromTime: new FormControl(''),
      toTime: new FormControl(''),
      nameOfPerson: new FormControl(''),
      contactNumber: new FormControl(''),
      remarks: new FormControl('')
    });
  }

  onSubmit(): void {
    if (this.docketForm.valid) {
      console.log('Submitted CNote Entry:', this.docketForm.value);
    } else {
      console.warn('Form is invalid');
    }
  }

  getStatusLabel(value: boolean): string {
    return value ? 'YES' : 'NO';
  }
}
