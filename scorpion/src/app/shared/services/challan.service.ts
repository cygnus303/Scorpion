import { Injectable } from '@angular/core';
import { BasicDetailService } from './basic-detail.service';
import { generalMasterResponse } from '../models/general-master.model';
import { CityResponse, VehicleTyperesponse, VendeorsResponse } from '../models/thc-master.model';
import { THCMasterService } from './thc-master.service';
import { DocketService } from './docket.service';
import { DeliveryAgentService } from './delivery-agent.service';
import { LocationListResponse } from '../models/delivery-agent.model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ChallanService {
public challanForm!:FormGroup;
public vendtyData:generalMasterResponse[]=[]
public vendorsList:VendeorsResponse[]=[]
public cityList:CityResponse[]=[];
public routeModeList:generalMasterResponse[]=[];
public locationData:LocationListResponse[]=[];
public latereasonList:generalMasterResponse[]=[];
public TDSLedgerData:VehicleTyperesponse[]=[];
public rateTypeData:generalMasterResponse[]=[];
  constructor(private basicDetailService: BasicDetailService,private THCService:THCMasterService,private docketService:DocketService,private deliveryAgentService:DeliveryAgentService) { }

    getVendtyData() {
    this.basicDetailService.getGeneralMasterList('VENDTY', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.vendtyData = response.data;
        }
      },
    });
  }

   getVendorsList(event:any) {
    const data = {
     vendorType:event.codeId,
     branchCode:this.docketService.loginUserList.LocationCode,
     userName: this.docketService.loginUserList.BaseUserName,
     documentType:this.docketService.loginUserList.Type
    }
    this.THCService.getVendorsList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.vendorsList = response.data;
        }
      },
    });
  }

  getCityList() {
    this.THCService.getCityList().subscribe({
      next: (response) => {
        if (response) {
          this.cityList = response;
        }
      },
    });
  }

  getRouteMode(){
    this.basicDetailService.getGeneralMasterList('RTMD', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.routeModeList = response.data;
        }
      },
    });
  }

    getLocationData() {
    this.deliveryAgentService.getLocation().subscribe({next: (response) => {
        if (response) {
          this.locationData = response
          this.challanForm.patchValue({
            balanceLocation:this.docketService.loginUserList.LocationCode,
            advanceLocation:this.docketService.loginUserList.LocationCode
          })
        }
      },
    })
  }
  
  getTDSLedgerList(){
    this.THCService.getTDSLedger().subscribe({
      next: (response) => {
        if (response.success) {
          this.TDSLedgerData = response.data;
        }
      },
    });
  }

    getDepartmentReason(){
    this.basicDetailService.getGeneralMasterList('LTDEP', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.latereasonList = response.data;
        }
      },
    });
  }

  getRateTypeData(){
    this.basicDetailService.getGeneralMasterList('HANDCHRG', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.rateTypeData = response.data;
        }
      },
    });
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
    d1_DOB:new FormControl('',Validators.required),
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
    is_Local_ODA_id : new FormControl('local'),
    totalDockets: new FormControl(0),
    contractAmount : new FormControl(0),
    isTDSEnabled : new FormControl(),
    tDSOnAmount : new FormControl(),
    totalTDSAmount : new FormControl(),
    netAmount : new FormControl(0),
    advanceAmount : new FormControl(0),
    balanceAmount : new FormControl(0),
    advanceLocation : new FormControl(),
    balanceLocation : new FormControl(),
    entryBy:new FormControl(this.docketService.loginUserList.BaseUserName),
    openKM:new FormControl(0),
    closeKM:new FormControl(),
    vehicleCapacity:new FormControl(),
    THCRemarks:new FormControl(),
    isOverLoad:new FormControl(),
    wtLoaded:new FormControl(0),
    vehicleCapacityUti:new FormControl(0),
    overLoadReason:new FormControl(),
    deliveryZone:new FormControl(),
    lateDepaturereason:new FormControl(),
    freeSpace:new FormControl(),
    sealNo:new FormControl(),
    standardContractAmount:new FormControl(),
    isMonthlyBillAllow:new FormControl(),
    TDSAcccode:new FormControl(),
    vehicleNO:new FormControl(),
    avalabledocketinPRS:new FormArray([]),
    TDSPercent:new FormControl(),
    Loadingcharge:new FormControl(),
    PANNO:new FormControl(),
    telephoneCharges: new FormControl(0),
    humaliCharges: new FormControl(0),
    mamulCharges: new FormControl(0),
  });
}

 get avalabledocket(): FormArray {
    return this.challanForm.get('avalabledocketinPRS') as FormArray;
  }

patchAvailableDockets(data: any[]) {
  this.avalabledocket.clear();

  data.forEach((docket) => {
    let tatInHrs = '-';
    if (docket.arrival_Date) {
      const arrival = new Date(docket.arrival_Date);
      const now = new Date();
      const diffMs = now.getTime() - arrival.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      tatInHrs = diffHrs.toString();
    }

    const group = new FormGroup({
      isSelected: new FormControl(false),
      dockno: new FormControl(docket.dockno),
      paybaS_Str: new FormControl(docket.paybaS_Str),
      bkg_Date: new FormControl(docket.bkg_Date),
      commited_Dely_Date: new FormControl(docket.commited_Dely_Date),
      arrPkgQty: new FormControl(docket.arrPkgQty),
      pendPkgQty: new FormControl(docket.pendPkgQty),
      actuwt: new FormControl(docket.actuwt),
      chrgwt: new FormControl(docket.chrgwt),
      pkgsno: new FormControl(docket.pkgsno),
      arrival_Date: new FormControl(docket?.arrival_Date),
      eWayBillNo: new FormControl(docket?.eWayBillNo),
      subreasoncode: new FormControl(docket?.subreasoncode),
      arrWeightQty: new FormControl(docket.arrWeightQty),
      message: new FormControl(docket.message),
      contractAmount: new FormControl(docket.contractAmount),
      bcSerialNo: new FormControl(docket.bcSerialNo),
      stock_Update_DT: new FormControl(docket.stock_Update_DT),
      orgncd: new FormControl(docket.orgncd),
      party_name: new FormControl(docket.party_name),
      consignor_Name: new FormControl(docket.consignor_Name),
      tatInHrs: new FormControl(tatInHrs),
      rateType: new FormControl(''),
      newRate: new FormControl(0),
      charge: new FormControl(0),  
    });
    group.get('rateType')?.valueChanges.subscribe(() => this.calculateCharge(group));
    group.get('newRate')?.valueChanges.subscribe(() => this.calculateCharge(group));
    this.avalabledocket.push(group);
  });
}

calculateCharge(group: FormGroup) {
  const rateType = group.get('rateType')?.value;
  const newRate = parseFloat(group.get('newRate')?.value || 0);
  const actuwt = parseFloat(group.get('actuwt')?.value || 0);
  const pkgsno = parseFloat(group.get('pkgsno')?.value || 0);
  let charge = 0;
  switch (rateType) {
    case '1': // PER KG
      charge = actuwt * newRate;
      break;
    case '3': // PER PACKAGES
      charge = pkgsno * newRate;
      break;
    case '4': // FLAT
      charge = newRate;
      break;
    default:
      charge = 0;
  }
  group.get('charge')?.setValue(charge.toFixed(2), { emitEvent: false });
  this.updateTotalLoadingCharge()
}


updateTotalLoadingCharge() {
   const total = this.avalabledocket.controls.reduce((sum, ctrl) => {
    if (ctrl.get('isSelected')?.value) { // ✅ only include checked rows
      return sum + parseFloat(ctrl.get('charge')?.value || 0);
    }
    return sum;
  }, 0);

  this.challanForm.get('Loadingcharge')?.setValue(total.toFixed(2), { emitEvent: false });
}

onSubmit(){
  const payload={
  //   "CTH":{
  //     "THCNO":"",
  //     "ManualTHCNo":"",
  //     "THCSF":"",
  //     "THCDate":"",
  //     "THCBRCD":""
  //     "THCDESTCD"
  //     "FROMCITY"
  //     "TOCITY"
  //     "THCType"
  //     "RouteCategory"
  //     "RouteType"
  //     "PKDLYType"
  //     "RouteCode"
  //     "RouteName"
  //     "VehicleNO"
  //     "IsMarketVehicle":true,
  //     "IsExtraVehicle":true,
  //     "OpenKM"
  //     "CloseKM"
  //     "TotalManifest"
  //     "TotalDockets"
  //     "TotalPackages"
  // "TotalActualWt"
  // "TotalChargeWt"
  // "FreeSpace"
  // "WtLoaded"
  // "IsOverLoad":true,
  // "OverLoadReason"
  // "WtAdjust"
  // "TOTALWtAdjust"
  // "TOTALWithWtAdjust"
  // "WithWtAdjustPM"
  // "VendorCode"
  // "VendorName"
  // "VendorType"
  // "VendorAddress"
  // "VENDORMOBNO"
  // "VENDORPHONENO"
  // "SUPPLYERMOBNO"
  // "SUPPLYERCODE"
  // "SUPPLYERNAME"
  // "AIRAGENT"
  // "IsBrokerMemo":true,
  // "BrokerMemoPath":
  // "TripSheetNo"
  // "FleetNo"
  // "TAMNO"
  // "TRACKNO"
  // "AckDays"
  // "AckPenalyRate"
  // "LaterPenalyRate"
  // "ScheduleType"
  // "AirportCode"
  // "AirportName"
  // "AirportDestination"
  // "FlightCode"
  // "FlightScheduleTime"
  // "FlightDepatureDate"
  // "AirportDepatureDate"
  // "IsFlightUpdated":true,
  // "AirWayBillNo"
  // "IsBCProcess":true,
  // "IsFinancialEdit":true,
  // "IsFinalized":true,
  // "IsClosed":true,
  // "THCRemarks"
  // "OperationalStatus"
  // "ClosedBy"
  // "ClosedDate"
  // "IsCancelled":true,
  // "IsQuickChallan":
  // "CancelBy"
  // "CancelDate"
  // "CancelReason"
  // "EntryBy"
  // "EntryDate"
  // "UpdatedBy"
  // "UpdatedDate"
  // "LorryOwnerName"
  // "LorryOwnerAddress"
  // "LorryOwnerMobileNo"
  // "LorryOwnerPanNo"
  // "IsSafeEx":true,
  // "IsReassign":true,
  // "ReassignBy",
  // "ReassignDate"
  // "IsVehDecRequired":true,
  // "FirmName"
  // "PaymentBy"
  // "ThirdPartyName"
  // "ThirdPartyPANNO"
  // "NoOfVehicle"
  //   }
  }
  if(this.challanForm.valid){

  }else{
    this.challanForm.markAllAsTouched();
  }
}
 
}
