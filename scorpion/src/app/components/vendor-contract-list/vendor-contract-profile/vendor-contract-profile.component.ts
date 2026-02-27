import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-vendor-contract-profile',
  standalone: true,
  imports: [NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './vendor-contract-profile.component.html',
  styleUrl: './vendor-contract-profile.component.scss'
})
export class VendorContractProfileComponent {
  vendorProfileForm !: FormGroup;

  buildForm() {
    this.vendorProfileForm = new FormGroup({
      CONTRACTCD: new FormControl(null),
      VendorName: new FormControl(null),
      VendorTypeName: new FormControl(null),
      ContractDt: new FormControl(null),
      Valid_uptodt: new FormControl(null),
      Start_Dt: new FormControl(null),
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


    })
  }

}
