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
    loadingDate:new FormControl(new Date()),
    isEmpty:new FormControl(),
    routeType:new FormControl(),
    routeName:new FormControl(),
    actualDeptDate:new FormControl(new Date()),
    scheduleDeptDate:new FormControl(new Date()),
    CityRouteKM:new FormControl(),
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
    flightCode:new FormControl(),
    airportCode:new FormControl(),
    trainNo:new FormControl(),
    trainName:new FormControl(),
    RRNo:new FormControl(),
    airLine:new FormControl(),
    flightScheduleTime:new FormControl(),
    airWayBillNo:new FormControl()
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
    "CTH":{
    THCNO:"",
    ManualTHCNo:this.challanForm.value.manualTHCNo,
    THCSF:"",
    THCDate:this.challanForm.value.tHCDate,
    THCBRCD:"",
    THCDESTCD:"",
    FROMCITY:this.challanForm.value.from_City,
    TOCITY:this.challanForm.value.to_City,
    THCType:"",
    RouteCategory:"",
    RouteType:this.challanForm.value.routeType,
    PKDLYType:"",
    RouteCode:"",
    RouteName:this.challanForm.value.routeName,
    VehicleNO:this.challanForm.value.vehicleNO,
    IsMarketVehicle:true,
    IsExtraVehicle:true,
    OpenKM:this.challanForm.value.openKM,
    CloseKM:this.challanForm.value.closeKM,
    TotalManifest:"",
    TotalDockets:this.challanForm.value.totalDockets,
    TotalPackages:"",
    TotalActualWt:"",
    TotalChargeWt:"",
    FreeSpace:this.challanForm.value.freeSpace,
    WtLoaded:this.challanForm.value.wtLoaded,
    IsOverLoad:this.challanForm.value.isOverLoad,
    OverLoadReason:this.challanForm.value.overLoadReason,
    WtAdjust:"",
    TOTALWtAdjust:"",
    TOTALWithWtAdjust:"",
    WithWtAdjustPM:"",
    VendorCode:this.challanForm.value.vendorCode,
    VendorName:"",
    VendorType:this.challanForm.value.vendorType,
    VendorAddress:"",
    VENDORMOBNO:"",
    VENDORPHONENO:"",
    SUPPLYERMOBNO:"",
    SUPPLYERCODE:"",
    SUPPLYERNAME:"",
    AIRAGENT:"",
    IsBrokerMemo:true,
    BrokerMemoPath:"",
    TripSheetNo:this.challanForm.value.tripSheetNo,
    FleetNo:"",
    TAMNO:"",
    TRACKNO:"",
    AckDays:"",
    AckPenalyRate:"",
    LaterPenalyRate:"",
    ScheduleType:"",
    AirportCode:this.challanForm.value.airportCode,
    AirportName:"",
    AirportDestination:"",
    FlightCode:this.challanForm.value.flightCode,
    FlightScheduleTime:this.challanForm.value.flightScheduleTime,
    FlightDepatureDate:"",
    AirportDepatureDate:"",
    IsFlightUpdat:true,
    AirWayBillNo:this.challanForm.value.AirWayBillNo,
    IsBCProcess:true,
    IsFinancialEdit:true,
    IsFinalized:true,
    IsClosed:true,
    THCRemarks:this.challanForm.value.THCRemarks,
    OperationalStatus:"",
    ClosedBy:"",
    ClosedDate:"",
    IsCancelled:true,
    IsQuickChallan:"",
    CancelBy:"",
    CancelDate:"",
    CancelReason:"",
    EntryBy:this.challanForm.value.entryBy,
    EntryDate:"",
    UpdatBy:"",
    UpdatDate:"",
    LorryOwnerName:"",
    LorryOwnerAddress:"",
    LorryOwnerMobileNo:"",
    LorryOwnerPanNo:this.challanForm.value.lorryOwnerPanNo,
    IsSafeEx:true,
    IsReassign:true,
    ReassignBy:"",
    ReassignDate:"",
    IsVehDecRequired:true,
    FirmName:"",
    PaymentBy:"",
    ThirdPartyName:"",
    ThirdPartyPANNO:"",
    NoOfVehicle:"",
    Lat:"",
    Long:"",
    VehicleGPSStatus:"",
    ProprietorName:"",
    OWNERPANNOPATH:"",
    OWNERVEHDEPATH:"",
    BROKERPANNOPATH:"",
    THIRDPARTYPANNOPATH:"",
    RCBOOKPATH:"",
    IsOwnerPanRequired:"",
    IsBrokerPanRequired:"",
    BROKERVEHDEPATH:"",
    PaymentByType:"",
    IsOperationallyClose:"",
    OperationallyCloseBy:"",
    IsOperationallyClosebySMS:"",
    OperationallyCloseDate:"",
    IsEditMode:"",
    PickUpLocation:"",
    DropLocaion:"",
    SealType:"",
    SealNo:this.challanForm.value.sealNo,
    ActualDeptDate:this.challanForm.value.actualDeptDate,
    ScheduleDeptDate:this.challanForm.value.scheduleDeptDate,
    LateEarly:"",
    ScheduleNo:"",
    ScheduleTime:"",
    LateDepaturereason:this.challanForm.value.lateDepaturereason,
    IsEmpty:this.challanForm.value.isEmpty,
    IsCityEnabled:"",
    DeliveryZone:this.challanForm.value.deliveryZone,
    MKTVehicleNo:this.challanForm.value.mKTVehicleNo,
    ScheduleDay:"",
    VehicleCapacity:this.challanForm.value.vehicleCapacity,
    VehicleCapacityUti:this.challanForm.value.vehicleCapacityUti,
    TrainName:this.challanForm.value.trainName,
    TrainNo:this.challanForm.value.trainNo,
    RRNo:this.challanForm.value.RRNo,
    AirLine:this.challanForm.value.airLine,
    FromAddress:this.challanForm.value.fromAddress,
    From_City:this.challanForm.value.from_City,
    To_City:this.challanForm.value.to_City,
    Location:"",
    city_code:"",
    FromAddLat:"",
    FromAddLng:"",
    ToAddLat:"",
    ToAddress:this.challanForm.value.toAddress,
    ToAddLng:"",  
    distanceInKM:this.challanForm.value.distanceInKM,
    approxAPITime:"",
    EWayBillNo:this.challanForm.value.eWayBillNo,
    EWayBillExpiredDate:this.challanForm.value.eWayBillExpiredDate,
    IsMonthlyBillAllow:this.challanForm.value.isMonthlyBillAllow,
    DeliveryAgent:this.challanForm.value.deliveryAgent,
    DeliveryAgentMoNo:this.challanForm.value.deliveryAgentMoNo,
    LoadingDate:this.challanForm.value.loadingDate,
    CityRouteCode:"",
    CityRouteKM:"",
    LoadingSlipAttachment:this.challanForm.value.loadingSlipAttachment,
    ApprovedBy:"",
    ERD:this.challanForm.value.ERD,
    DAVendor:"",
    },
    "CMR":{
      Module_Title_desc:"",
      RULEID:"",
      Srno:"",
      Module_Name:"",
      RULE_Y_N:"",
      ModuleID:"",
      RULE_VALUE:"",
      RULE_DESC:"",
      IsFromTocityRequird:"",
      IsFromTocityRequirdinthc:"",
    },
    "CTFD":{
      THCNO:"",
      THCSF:"",
      ContractType:"",
      ContractAmount:this.challanForm.value.contractAmount,
      StandardContractAmount:this.challanForm.value.standardContractAmount,
      TotalCharges:"",
      NetAmount:this.challanForm.value.netAmount,
      AdvanceAmount:this.challanForm.value.advanceAmount,
      PendingAdvanceAmount:"",
      CollectedAdvanceAmount:"",
      AdvanceLocation:this.challanForm.value.advanceLocation,
      AdvanceAmountPaid:"",
      AdvanceAmountPending:"",
      IsAdvancePaid:"",
      AdvancePaidOn:"",
      AdvancePaidBy:"",
      AdvanceVoucherNo:"",
      AdvanceVoucherDate:"",
      AdvanceCollMode:"",
      AdvanceChequeNo:"",
      AdvanceChequeDate:"",
      AdvanceLedger:"",
      BalanceAmount:this.challanForm.value.balanceAmount,
      PendingBalanceAmount:"",
      CollectedBalanceAmount:"",
      BalanceLocation:this.challanForm.value.balanceLocation,
      BalanceAmountPaid:"",
      BalanceAmountPending:"",
      BalanceCollMode:"",
      BalanceChequeNo:"",
      BalanceChequeDate:"",
      BalanceLedger:"",
      IsBalancePaid:"",
      BalancePaidOn:"",
      BalancePaidBy:"",
      BalanceVoucherNo:"",
      BalanceVoucherDate:"",
      SCDebitVoucher:"",
      SCDebitVoucherAmount:"",
      SCCreditVoucher:"",
      SCCreditVoucherAmount:"",
      FianacialRemark:"",
      FianacialStatus:"",
      Narration:"",
      PANNO:this.challanForm.value.PANNO,
      VendorBillNo:"",
      CENVATRATE:"",
      CENVATAMT:"",
      ServiceTaxAmount:"",
      TotalBill:"",
      InvoiceNo:"",
      WayBillNo:"",
      DFRClosed:"",
      DFRClosedBy:"",
      DFRClosedDate:"",
      TotalTDSAmount:this.challanForm.value.totalTDSAmount,
      AdvanceTDSAmount:"",
      BalanceTDSAmount:"",
      TDSPercent:this.challanForm.value.TDSPercent,
      AdvanceAmountWOTDS:"",
      BalanceAmountWOTDS:"",
      Comment:"",
      PendingAdvanceTDSAmount:"",
      CollectedAdvanceTDSAmount:"",
      PendingBalanceTDSAmount:"",
      CollectedBalanceTDSAmount:"",
      IsFromPRQ:"",
      Loadingcharge:this.challanForm.value.Loadingcharge,
      LoadedRateType:"",
      LoadedBy:"",
      Rate:"",
      MaxLimit:"",
      VendorCode:"",
      IsMonthly:"",
      VendName:"",
      hdnRate:"",
      IsMathadi:"",
      MathadiSlipNo:"",
      MathadiDate:"",
      MathadiAmt:"",
      Is_Local_ODA_id:this.challanForm.value.is_Local_ODA_id,
      Check_Dockno:"",
      Type:"",
      AttachedRateType:"",
      IsTDSEnabled:this.challanForm.value.isTDSEnabled,
      TDSAcccode:this.challanForm.value.TDSAcccode,
      TDSAccdesc:"",
      TDSOnAmount:this.challanForm.value.tDSOnAmount,
    },
    "CTVD":{
      THCNO:"",
      THCSF:"",
      VehicleNO:this.challanForm.value.vehicleNO,
      VehicleType:this.challanForm.value.vehicleType,
      FTLType:this.challanForm.value.fTLType,
      VehicleCapacity:this.challanForm.value.VehicleCapacity,
      VehicleSize:"",
      Driver1Name:this.challanForm.value.driver1Name,
      Driver1MobileNo:this.challanForm.value.driver1MobileNo,
      Driver1RTONo:this.challanForm.value.driver1RTONo,
      Driver1Licence:this.challanForm.value.driver1Licence,
      D1_DOB:this.challanForm.value.d1_DOB,
      Driver1LicenceValDate:this.challanForm.value.driver1LicenceValDate,
      Driver2Name:this.challanForm.value.driver2Name,
      Driver2MobileNo:this.challanForm.value.driver2MobileNo,
      Driver2RTONo:this.challanForm.value.driver2RTONo,
      Driver2Licence:this.challanForm.value.driver2Licence,
      Driver2LicenceValDate:this.challanForm.value.driver2LicenceValDate,
      DriverPhotoPath:"",
      Make:"",
      Model:"",
      VehicleVolume:"",
      VehicleColor:"",
      CHASISNO:this.challanForm.value.cHASISNO,
      ENGINENO:this.challanForm.value.eNGINENO,
      MODELNo:"",
      RCBOOKNO:this.challanForm.value.rCBOOKNO,
      CertificateNo:"",
      InsuranceNo:"",
      RTONo:"",
      RegistrationDate:this.challanForm.value.registrationDate,
      FitnessDate:this.challanForm.value.fitnessDate,
      PermitDate:this.challanForm.value.permitDate,
      InsuranceDate:this.challanForm.value.insuranceDate,
      CAPACITY:"",
      MarketVehImage:"",
      tabletNumber:"",
      StaffName:"",
      StaffMobileNo:"",
      VehicleTypeSize:"",
      CustomerName:"",
      Driver:"",
    },
    "CPML":{
      Id:"",
      BRCD:"",
      RatePerGM:"",
      VehicleSize:"",
    },
    "GC":{
      FromDate:"",
      ToDate:"",
      GCNO:"",
      PAYBAS:"",
      TRNMOD:"",
      BUSTYPE:"",
      DATETYPE:"",
      BookedByType:"",
      BookedBy:"",
      DOCTYP:"",
      TYP:"",
      isBookedby:"",
      LoadingBy:"",
      ChargeType:"",
      VendorCode:"",
      ODAType:"",
      DRSType:"",
    }
  }
  const formData = new FormData();
   formData.append("CVM.THCNo", "");
   formData.append("CVM.IsMathadi", "");
   formData.append("CVM.BookedByType", "");
   formData.append("CVM.RatePerGram", "");
   formData.append("CVM.RatePerGramContractAmount", "");
   formData.append("CVM.ISAttechedVendor", "");
   formData.append("CVM.ISContractualVendor", "");
   formData.append("CVM.RateType", "");
   formData.append("CVM.IsMobileUser", "");
   formData.append("CVM.DemurrageCharge", "");
   formData.append("CVM.DiscountRatio", "");
   formData.append("CVM.FinalAmt", "");
   formData.append("LoadingSlipAttachmentFile", "");
   formData.append("BaseFinYear", this.docketService.loginUserList.FinYear);
   formData.append("BaseCompanyCode", this.docketService.loginUserList.Companycode);
   formData.append("BaseUserName", this.docketService.BaseUserCode);
   formData.append("BaseUserType", '');
   formData.append("BaseLocationCode", this.docketService.loginUserList.LocationCode);

  if(this.challanForm.valid){

  }else{
    this.challanForm.markAllAsTouched();
  }
}

 
}
