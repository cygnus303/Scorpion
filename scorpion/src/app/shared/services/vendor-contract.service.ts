import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class VendorContractService {
  public vendorProfileForm !: FormGroup;

  constructor() { }

   buildForm() {
    this.vendorProfileForm = new FormGroup({
      CONTRACTCD: new FormControl(null),
      VendorName: new FormControl(null),
      VendorTypeName: new FormControl(null),
      ContractDt: new FormControl(new Date()),
      Valid_uptodt: new FormControl(new Date()),
      Start_Dt: new FormControl(new Date()),
      Contract_loccode: new FormControl(null),
      VendorPerName: new FormControl(null),
      VendorWitness: new FormControl(null),
      VendorPerDesg: new FormControl(null),
      CompEmpDesg: new FormControl(null),
      CompEmpName: new FormControl(null),
      CompWitness: new FormControl(null),
      VendorCity: new FormControl(null),
      VendorPin: new FormControl(null),
      Vendor_Address: new FormControl(null),
      TDSAppl_YN: new FormControl(false),
      VendorCategory: new FormControl(null),
      VendorContractCat: new FormControl(null),
      TDS_Rate: new FormControl(0),
      Security_deposit_chq: new FormControl(null),
      Payment_interval: new FormControl(null),
      Security_deposit_date: new FormControl(new Date()),
      Security_deposit_Amt: new FormControl(0),
      Payment_Basis: new FormControl(null),
      Payment_loc: new FormControl(null),
      Monthly_Phone_Charges: new FormControl(0),
      Default_Charge:new FormControl(0),
      VendorType:new FormControl(null),
      routeBasedContracts: new FormArray([]), 
      distanceBasedContracts: new FormArray([]),
      cnoteBasedContracts: new FormArray([]),
      cnoteDeliveryCharges: new FormArray([]) 
    })
  }

  get routeBasedContracts(): FormArray {
    return this.vendorProfileForm.get('routeBasedContracts') as FormArray;
  }

  addRouteBasedContract() {
    const routeContract = new FormGroup({
      TransMode: new FormControl(null),
      RouteCode: new FormControl(null),
      FTL_Type: new FormControl(null),
      Min_Charge: new FormControl(0),
      Max_Charge: new FormControl(0),
      Rate_Type: new FormControl(null),
      Chg_Rate: new FormControl(0)
    });
    this.routeBasedContracts.push(routeContract);
  }

 removeRouteBasedContract(index: number) {
    this.routeBasedContracts.removeAt(index);
  }

  addRouteContract() {
    this.addRouteBasedContract();
  }

  get distanceBasedContracts(): FormArray {
    return this.vendorProfileForm.get('distanceBasedContracts') as FormArray;
  }

   addDistanceBasedContract() {
    const distanceContract = new FormGroup({
      FTL_Type: new FormControl(null),
      Vehicle_Type: new FormControl(null),
      Vehicle_Number: new FormControl(null),
      Min_Amt_Committed: new FormControl(0),
      Committed_Km: new FormControl(0),
      Chg_Per_Add_Km: new FormControl(0),
      Max_Amt_Committed: new FormControl(0),
      Trips_PM: new FormControl(0)
    });
    this.distanceBasedContracts.push(distanceContract);
  }

  removeDistanceBasedContract(index: number) {
    this.distanceBasedContracts.removeAt(index);
  }

   addDistanceContract() {
    this.addDistanceBasedContract();
  }

  get cnoteBasedContracts(): FormArray {
    return this.vendorProfileForm.get('cnoteBasedContracts') as FormArray;
  }

  addCnoteBasedContract() {
    const group = new FormGroup({
      City: new FormControl(null),
      Location: new FormControl(null),
      PayBas: new FormControl(null),
      TransMode: new FormControl(null),
      Min_Charge: new FormControl(null),
      ServiceType: new FormControl(null),
      Rate_Type: new FormControl(null),
      Chg_Rate: new FormControl(null),
      Max_Charge: new FormControl(null),
    });

    this.cnoteBasedContracts.push(group);
  }

  removeCnoteBasedContract(index: number) {
    this.cnoteBasedContracts.removeAt(index);
  }

  addCnoteContract() {
    this.addCnoteBasedContract();
  }

  
  get cnoteDeliveryCharges(): FormArray {
    return this.vendorProfileForm.get('cnoteDeliveryCharges') as FormArray;
  }

  addCnoteDeliveryCharges() {
    const group = new FormGroup({
      Location: new FormControl(null),
      City: new FormControl(null),
      PayBas: new FormControl(null),
      TransMode: new FormControl(null),
      Oda: new FormControl(null),
      Min_Charge: new FormControl(null),
      ServiceType: new FormControl(null),
      Rate_Type: new FormControl(null),
      Chg_Rate: new FormControl(null),
      Max_Charge: new FormControl(null),
    });

    this.cnoteDeliveryCharges.push(group);
  }

  removeCnoteDeliveryCharges(index: number) {
    this.cnoteDeliveryCharges.removeAt(index);
  }

  addDeliveryCharges() {
    this.addCnoteDeliveryCharges();
  }
}
