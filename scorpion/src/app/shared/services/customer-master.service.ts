import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DocketService } from './docket.service';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerMasterService {
public customerForm !:FormGroup;
public billingForm !:FormGroup;
public KAMForm !:FormGroup;
public gstForm!: FormGroup;


  constructor(
    private docketService:DocketService,
    private customerService:CustomerService
  ) { }

  ngOnInit(){

  }

  buildCustomerForm(){
     if (this.customerForm) return;
    this.customerForm= new FormGroup({
      CUSEntryType:new FormControl('registered'),
      GSTNO:new FormControl(null),
      pan_no:new FormControl(null),
      CUSTNM:new FormControl(null),
      CUSTCD:new FormControl(null),
      CUSTPASS:new FormControl(null),
      TaxpayerType:new FormControl(null),
      GRPCD:new FormControl(null),
      telno:new FormControl(null),
      EMAILIDS:new FormControl(null),
      MOBILENO:new FormControl(null),
      Cust_State:new FormControl(null),
      EmployeeID:new FormControl(null),
      Website:new FormControl(null),
      Businessname:new FormControl(null),
      OwnershipStatus:new FormControl(null),
      Ownership:new FormControl(null),
      Remark:new FormControl(null),
      Industry:new FormControl(null),
      Cust_Date:new FormControl(new Date()),
      Consignnor:new FormControl(null),
      Consignee:new FormControl(null),
      ThirdParty:new FormControl(null),
      MOBSERV_ENABLED:new FormControl(true),
      AutoBillAllowed:new FormControl(null),
      CUST_ACTIVE:new FormControl(true),
      BillingAtDestination:new FormControl(null),
      EInvoice:new FormControl(null),
      EWayBillAPIEnable:new FormControl(null),
      SEZ:new FormControl(null),
      DRSCLO_SMS:new FormControl(null),
      PONumber_Active:new FormControl(null),
      ActiveFlagForBlockBooking:new FormControl(null),
      ActiveFlagForBlockDelivery:new FormControl(null),
      OutstandingMailEnable:new FormControl(null),
      OutstandingEmailIds:new FormControl(null),
      AutoMISMailEnable:new FormControl(null),
      CUSTClassification:new FormControl(null),
      CRMEmailIds:new FormControl(null),
      AutoMISEmailIds:new FormControl(null),
      DRSGEN_SMS:new FormControl(null),
      IsGstEnable:new FormControl(null),
      IsTransporter:new FormControl(null),
      TransId:new FormControl(null),
      CUSTLOC:new FormControl(null),
      IsBusiness:new FormControl(true),
      IsGTA:new FormControl(null),
      LoadingSlipRecieved:new FormControl(null),
      IsBillAudit:new FormControl(null)
    })
  }

  buildBillingForm(){
    if (this.billingForm) return;
    this.billingForm=new FormGroup({
      CustAddress:new FormControl(null),
      city:new FormControl(null),
      pincode:new FormControl(null),
      Address_Bill:new FormControl(null),
      City_Bill:new FormControl(null),
      Pincode_Bill:new FormControl(null),
      CustAddBillAdd:new FormControl(null),
      MAP_CSGN:new FormControl(null),
      MAP_CSGE:new FormControl(null),
      BankName:new FormControl(null),
      BranchName:new FormControl(null),
      BankAccountNo:new FormControl(null),
      Turnover:new FormControl(null),
      TIN_No:new FormControl(null),
      TANNo:new FormControl(null),
      BusinessType:new FormControl(null),
      TDSPercentage:new FormControl(null),
      IsAllowForChequeCollection:new FormControl(null),
      IsSpecialBill_YN:new FormControl(null),
      IsTDSApplicable:new FormControl(null),
      Decision_Name:new FormControl(null),
      Decision_Designation:new FormControl(null),
      Decision_Mobile:new FormControl(null),
      Decision_Email:new FormControl(null),
      BookedByFraVendor:new FormControl(null),
      BookedByBaVendor :new FormControl(null),
      BookedType:new FormControl(null),
    })
  }

 buildKAMForm() {
 this.KAMForm= new FormGroup({
    EmployeeName: new FormControl(null),
    EmployeeID: new FormControl(null),
    Designation: new FormControl(null),
    Mobile: new FormControl(null),
    Email: new FormControl(null)
  });
}



  get KAMArray(): FormArray {
  return this.KAMForm.get('KAMArray') as FormArray;
}

buildGSTForm() {
    if (this.gstForm) return;

  this.gstForm = new FormGroup({
    gstDetails: new FormArray([])
  });
   this.addGSTRow();
}

get gstDetails(): FormArray {
  return this.gstForm.get('gstDetails') as FormArray;
}

get gstControls() {
  return this.gstDetails.controls;
}

createGSTRow(): FormGroup {
  return new FormGroup({
    gst_registration_no: new FormControl(null, Validators.required),
    statename: new FormControl(null),
    CSGEAddress: new FormControl(null),
    pincode: new FormControl(null),
    city_code: new FormControl(null)
  });
}

addGSTRow() {
this.gstDetails.push(this.createGSTRow());
}

removeGSTRow(index: number) {
  this.gstDetails.removeAt(index);
}

  getGSTData(gstNo: string){
    const payload={
      gstNo: gstNo,
      type: "C",
      code: "",
      entryBy:'cygnusteam'
    }

    this.customerService.getTypewiseGSTDetail(payload).subscribe({
      next:(response)=>{
        if(response){
          const gstDetail=response.data;
          this.customerForm.patchValue({
            CUSTNM:gstDetail.tradeNam,
            Businessname:gstDetail.lgnm,
            pan_no:gstDetail.panno,
            Cust_State:gstDetail.stcd
          });

          this.billingForm.patchValue({
            CustAddress:gstDetail.address,
            pincode:gstDetail.pincodeArea,
            city:gstDetail.city
          })

           if (this.gstDetails.length === 0) {
          this.addGSTRow();
        }

        const firstRow = this.gstDetails.at(0) as FormGroup;

        firstRow.patchValue({
          gst_registration_no: gstNo,
          statename: gstDetail.stcd,
          CSGEAddress: gstDetail.address,
          pincode: gstDetail.pncd,
          // city_code: gstDetail.city_code
        });

        }
      }
    })
  }



}
