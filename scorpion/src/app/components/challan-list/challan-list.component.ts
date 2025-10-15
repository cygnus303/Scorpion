import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChallanService } from 'app/shared/services/challan.service';

@Component({
  selector: 'app-challan-list',
  standalone: false,
  templateUrl: './challan-list.component.html',
  styleUrl: './challan-list.component.scss'
})
export class ChallanListComponent {
public challanForm!:FormGroup;
public selectedDigit: number = 10; 
constructor(public challanService:ChallanService){}
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
  }

buildForm(){
  this.challanForm = new FormGroup({
    manualTHCNo:new FormControl(),
    tHCDate:new FormControl(),
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
    driver1Licence:new FormControl(),
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
    netAmount : new FormControl(),
    advanceAmount : new FormControl(),
    balanceAmount : new FormControl(),
    advanceLocation : new FormControl(),
    balanceLocation : new FormControl(),
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
}

}
