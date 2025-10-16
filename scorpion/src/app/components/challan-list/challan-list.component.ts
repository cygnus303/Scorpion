import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { cityResponse } from 'app/shared/models/general-master.model';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { ChallanService } from 'app/shared/services/challan.service';
import { DeliveryAgentService } from 'app/shared/services/delivery-agent.service';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';

@Component({
  selector: 'app-challan-list',
  standalone: false,
  templateUrl: './challan-list.component.html',
  styleUrl: './challan-list.component.scss'
})
export class ChallanListComponent {
public challanForm!:FormGroup;
public selectedDigit: number = 10; 
public typeName : string='';
public today: Date = new Date();
public vehicleNoList:any[]=[];

constructor(
  public challanService:ChallanService,
  public docketService:DocketService,
  public basicDetailService:BasicDetailService,
  public sweetAlertService:SweetAlertService,
  private deliveryAgentService:DeliveryAgentService,
  public THCService:THCMasterService
){}
cNoteAvailable =
[
  {
    "index": 1,
    "DOCKNO": "62970877",
    "PayBas": "P02",
    "Bkg_Date": "05 Oct 25",
    "Delivery_Date": "10 Oct 25",
    "ArrPkgQty": 2,
    "PendPkgQty": 2,
    "PKGSNO": 2.00,
    "ArrWeightQty": 18.00,
    "ACTUWT": 18.00,
    "CHRGWT": 20.00,
    "ratetype": "",
    "NewRate": 0.000,
    "ContractAmount": 0.00
  },
  {
    "index": 2,
    "DOCKNO": "62970878",
    "PayBas": "P02",
    "Bkg_Date": "05 Oct 25",
    "Delivery_Date": "10 Oct 25",
    "ArrPkgQty": 10,
    "PendPkgQty": 10,
    "PKGSNO": 10.00,
    "ArrWeightQty": 120.00,
    "ACTUWT": 120.00,
    "CHRGWT": 120.00,
    "ratetype": "",
    "NewRate": 0.000,
    "ContractAmount": 0.00
  },
  {
    "index": 3,
    "DOCKNO": "62970879",
    "PayBas": "P02",
    "Bkg_Date": "06 Oct 25",
    "Delivery_Date": "11 Oct 25",
    "ArrPkgQty": 2,
    "PendPkgQty": 2,
    "PKGSNO": 2.00,
    "ArrWeightQty": 18.00,
    "ACTUWT": 18.00,
    "CHRGWT": 20.00,
    "ratetype": "",
    "NewRate": 0.000,
    "ContractAmount": 0.00
  }
]

 ngOnInit(){
    this.buildForm();
    this.challanService.getVendtyData();
    this.challanService.getCityList();
    this.docketService.getTypeofMovementData();
    this.challanService.getRouteMode();
    this.challanService.getDepartmentReason();
    this.challanService.getTDSLedgerList();
    this.challanService.getLocationData()
    const type = this.docketService.loginUserList.Type;
    this.typeName = type === '3' ? 'DRS' :
                    type === '1' ? 'THC' :
                    type === '2' ? 'PRS' : '';
  }

buildForm(){
  this.challanForm = new FormGroup({
    manualTHCNo:new FormControl(),
    tHCDate:new FormControl(new Date()),
    loadingDate:new FormControl(),
    isEmpty:new FormControl(),
    routeType:new FormControl(),
    routeName:new FormControl(),
    actualDeptDate:new FormControl(),
    scheduleDeptDate:new FormControl(),
    vendorType:new FormControl(),
    vendorCode:new FormControl(),
    lorryOwnerPanNo:new FormControl(),
    fromAddress:new FormControl(),
    toAddress:new FormControl(),
    distanceInKM:new FormControl(),
    from_City:new FormControl(),
    to_City:new FormControl(),
    ERD:new FormControl(),
    loadingSlipAttachment:new FormControl(),
    vehicleNo:new FormControl(),
    mKTVehicleNo:new FormControl(),
    tripSheetNo : new FormControl(),
    vehicleType : new FormControl(),
    fTLType : new FormControl(),
    registrationDate : new FormControl(),
    eNGINENO : new FormControl(),
    cHASISNO : new FormControl(),
    rCBOOKNO : new FormControl(),
    permitDate : new FormControl(),
    insuranceDate : new FormControl(),
    fitnessDate : new FormControl(),
    driver1Licence:new FormControl('',[Validators.required,Validators.pattern(/^[A-Za-z]{2}\d{2}\s?\d{11}$/)]),
    d1_DOB:new FormControl(),
    driver1Name:new FormControl(),
    driver1RTONo:new FormControl(),
    driver1LicenceValDate:new FormControl(),
    driver1MobileNo:new FormControl(),
    driver2Name:new FormControl(),
    driver2MobileNo:new FormControl(),
    driver2Licence:new FormControl(),
    driver2RTONo:new FormControl(),
    driver2LicenceValDate:new FormControl(),
    deliveryAgent : new FormControl(),
    deliveryAgentMoNo : new FormControl(),
    eWayBillNo : new FormControl(),
    eWayBillExpiredDate : new FormControl(),
    is_Local_ODA_id : new FormControl(),
    totalDockets: new FormControl(),
    contractAmount : new FormControl(),
    isTDSEnabled : new FormControl(),
    tDSOnAmount : new FormControl(),
    totalTDSAmount : new FormControl(),
    netAmount : new FormControl(0),
    advanceAmount : new FormControl(0),
    balanceAmount : new FormControl(0),
    advanceLocation : new FormControl(),
    balanceLocation : new FormControl(),
    entryBy:new FormControl(),
    openKM:new FormControl(),
    closeKM:new FormControl(),
    vehicleCapacity:new FormControl(),
    THCRemarks:new FormControl(),
    isOverLoad:new FormControl(),
    wtLoaded:new FormControl(),
    vehicleCapacityUti:new FormControl(),
    overLoadReason:new FormControl(),
    deliveryZone:new FormControl(),
    lateDepaturereason:new FormControl(),
    freeSpace:new FormControl(),
    sealNo:new FormControl(),
    standardContractAmount:new FormControl(),
    isMonthlyBillAllow:new FormControl(),
    TDSAcccode:new FormControl(),
    vehicleNO:new FormControl()
  });
}

onDigitChange(digit: number) {
  this.selectedDigit = digit;
  this.challanForm.get('mKTVehicleNo')?.reset('');
}

validateVehicleNo() {
  const control = this.challanForm.get('mKTVehicleNo');
  if (!control) return;
  let value = (control.value || '').toUpperCase();
  let filtered = '';
  const patternMap: { [key: number]: RegExp[] } = {
    7:  [/[A-Z]/, /[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/], // GJ01A12
    8:  [/[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/], // GJ01AB12
    9:  [/[A-Z]/, /[A-Z]/, /\d/, /\d/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/], // GJ01AB123
    10: [/[A-Z]/, /[A-Z]/, /\d/, /\d/, /[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/], // GJ01AB1234
    11: [/[A-Z]/, /[A-Z]/, /\d/, /\d/, /[A-Z]/, /[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/] // GJ01ABC1234
  };
  const pattern = patternMap[this.selectedDigit];
  if (pattern) {
    for (let i = 0; i < value.length && i < pattern.length; i++) {
      const ch = value[i];
      if (pattern[i].test(ch)) {
        filtered += ch;
      }
    }
  } else {
    filtered = value.replace(/[^A-Z0-9]/g, '').slice(0, this.selectedDigit);
  }
  control.setValue(filtered, { emitEvent: false });
  if (filtered.length === this.selectedDigit) {
    this.getVehicleDetail(filtered);
  }
}

  getVehicleDetail(vehicleNo:string) {
    const params = {
      vehNo: vehicleNo.toUpperCase(),
      baseUserName: this.docketService.loginUserList.BaseUserName
    };
    this.deliveryAgentService.getVehicleDetail(params).subscribe({
      next: (response: any) => {
        if (response) {
          this.challanForm.patchValue({
            eNGINENO: response.rc_eng_no || '',
            cHASISNO: response.rc_chasi_no || '',
            rCBOOKNO: response.rc_regn_no || '',
            registrationDate: response.rc_regn_dt ? new Date(response.rc_regn_dt) : null,
            permitDate: response.rc_permit_valid_upto ? new Date(response.rc_permit_valid_upto) : null,
            insuranceDate: response.rc_insurance_upto ? new Date(response.rc_insurance_upto) : null,
            fitnessDate: response.rc_fit_upto ? new Date(response.rc_fit_upto) : null
          });
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  onChangeLicenceNumber(event: any) {
     const dob = this.challanForm.value.d1_DOB;
     const licenseNo = event ? event.target.value?.trim() : this.challanForm.value.driver1Licence?.trim();
     const licenseControl = this.challanForm.get('driver1Licence');
      if (!licenseControl || licenseControl.invalid || !dob) {
      licenseControl?.markAsTouched();
      this.challanForm.get('d1_DOB')?.markAsTouched();
      return;
    }
    const params = {
      dlnumber: licenseNo.toUpperCase(),
      dob: this.challanForm.value.d1_DOB ? this.challanForm.value.d1_DOB.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      baseUserName: this.docketService.loginUserList.BaseUserName
    };
    this.deliveryAgentService.getLicenceDetail(params).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.challanForm.patchValue({
            driver1Name:response.data.bioFullName, 
            driver1RTONo: response.data.omRtoFullname || '',
            driver1LicenceValDate: response.data.validTillDate || ''
          });
        }
      },
      error: (err) => {
        console.error('Error fetching license detail:', err);
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  getTripSheetList(event:any){
    this.THCService.getTripSheet(event.value).subscribe({
      next: (response: any) => {
        if (response && response.data) {
         
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
   this.getVehicleCapacity(event.value)
  if(event.value!=='O'){
  this.getNewVehicleDetail(event.value)
  }
}

getVehicleCapacity(vehicleNo:string){
  this.THCService.getVahicleCapacity(vehicleNo).subscribe({
    next: (response: any) => {
      if (response && response.data) {
       this.challanForm.patchValue({
        vehicleCapacity:response.data.capacity
       })
      }
    },
  });
}


getPANnumberData(event:any){
  this.THCService.getPANnumber(event.vendor_Code).subscribe({
      next: (response: any) => {
        if (response && response.data) {
         this.challanForm.patchValue({
          lorryOwnerPanNo:response.data[0].panno
         })
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
    this.getVehicleFromVendorList(event.vendor_Code)
}

getVehicleFromVendorList(vendor:string){
  this.THCService.getvehicleDetailFromVendor(this.challanForm.value.vendorType,vendor).subscribe({
      next: (response: any) => {
        if (response && response.data) {
         this.vehicleNoList=response.data;
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
}

getNewVehicleDetail(vehicleNo:string){
    this.THCService.getNewVehicleDetail(vehicleNo.toUpperCase()).subscribe({
      next: (response: any) => {
        if (response) {
           this.challanForm.patchValue({
            vehicleType:response.data.vehicle_Type,
            fTLType:response.data.ftltyPe,
            eNGINENO: response.data.engineNo || '',
            cHASISNO: response.data.chasisNo || '',
            rCBOOKNO: response.data.rcBookNo || '',
            registrationDate: response.data.registrationDt ? new Date(response.data.registrationDt) : null,
            permitDate: response.data.vehprmdt ? new Date(response.data.vehprmdt) : null,
            insuranceDate: response.data.insuranceValDt ? new Date(response.data.insuranceValDt) : null,
            fitnessDate: response.data.fitnessValDt ? new Date(response.data.fitnessValDt) : null
          });
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
}

}
