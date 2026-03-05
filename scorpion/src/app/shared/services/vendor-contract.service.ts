import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

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
      Default_Charge:new FormControl(0)
    })
  }
}
