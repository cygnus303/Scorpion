import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { MasterService } from 'app/shared/services/master.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-vendor-contract-profile',
  standalone: true,
  imports: [NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './vendor-contract-profile.component.html',
  styleUrl: './vendor-contract-profile.component.scss'
})
export class VendorContractProfileComponent {
  public vendorProfileForm !: FormGroup;

  constructor(
    private masterService:MasterService,
    private docketService:DocketService
  ){}

  ngOnInit() {
    this.buildForm()
  }

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
      TDSAppl_YN: new FormControl(false),
      VendorCategory: new FormControl(null),
      VendorContractCat: new FormControl(null),
      TDS_Rate: new FormControl(null),
      Security_deposit_chq: new FormControl(null),
      Payment_interval: new FormControl(null),
      Security_deposit_date: new FormControl(null),
      Security_deposit_Amt: new FormControl(null),
      Payment_Basis: new FormControl(null),
      Payment_loc: new FormControl(null),
      Monthly_Phone_Charges: new FormControl(null),
    })
  }
  
  getVendorContractList(){
    this.masterService.getVendorContractTypeWise(this.docketService.loginUserList.Type).subscribe({
      next:(response)=>{

      }
    })
  }

}
