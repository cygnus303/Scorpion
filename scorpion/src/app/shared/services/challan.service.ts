import { Injectable } from '@angular/core';
import { BasicDetailService } from './basic-detail.service';
import { generalMasterResponse } from '../models/general-master.model';
import { CityResponse, VehicleTyperesponse, VendeorsResponse } from '../models/thc-master.model';
import { THCMasterService } from './thc-master.service';
import { DocketService } from './docket.service';
import { DeliveryAgentService } from './delivery-agent.service';
import { LocationListResponse } from '../models/delivery-agent.model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { json } from 'stream/consumers';

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
public selectedFile: File | null = null;

constructor(
  private basicDetailService: BasicDetailService,
  private THCService:THCMasterService,
  private docketService:DocketService,
  private deliveryAgentService:DeliveryAgentService,
) { }

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
  const isType1 = this.docketService.loginUserList.Type === '1';
  this.challanForm = new FormGroup({
    manualTHCNo:new FormControl('N/A'),
    tHCDate:new FormControl(new Date()),
    loadingDate:new FormControl(new Date()),
    isEmpty:new FormControl(),
    routeType:new FormControl(null, isType1 ? Validators.required : null),
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
    FROMCITY:new FormControl(null, isType1 ? Validators.required : null),
    TOCITY:new FormControl(null, isType1 ? Validators.required : null),
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
    driver1MobileNo:new FormControl(null, isType1 ? Validators.required : null),
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
    totalDockets: new FormControl(0, !isType1 ? Validators.required : null),
    contractAmount : new FormControl(0),
    isTDSEnabled : new FormControl(),
    tDSOnAmount : new FormControl(0),
    totalTDSAmount : new FormControl(0),
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
    avalableForTHC:new FormArray([]),
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
    airWayBillNo:new FormControl(),
    TotalManifest:new FormControl(0, isType1 ? Validators.required : null),
    routeCode:new FormControl(null, isType1 ? Validators.required : null),
    customerName:new FormControl()
  });
}

 get avalableForTHC(): FormArray {
    return this.challanForm.get('avalableForTHC') as FormArray;
  }

public buildMfGroup(item: any): FormGroup {
  return new FormGroup({
    selected: new FormControl(false),
    tcno: new FormControl(item.tcno || ''),
    manual: new FormControl(item.manual || ''),
    tcbr: new FormControl(item.tcbr || ''),
    tC_Date: new FormControl(item.tC_Date || item.tcdt_ddmmyyyy || ''),
    toBH_CODE: new FormControl(item.toBH_CODE || ''),
    toT_DKT: new FormControl(item.toT_DKT ?? 0),
    packages: new FormControl(item.packages || ''),
    weight: new FormControl(item.weight || ''),
    totalInternalDocument: new FormControl(item.totalInternalDocument ?? 0),
    vehicleNo: new FormControl(item.vehicleNo || ''),
    toT_LOAD_PKGS:new FormControl(item.toT_LOAD_PKGS || ''),
    toT_LOAD_ACTWT:new FormControl(item.toT_LOAD_ACTWT || ''),
    myRouteName:new FormControl(item.myRouteName || ''),
    tcdt_ddmmyyyy:new FormControl(item.tcdt_ddmmyyyy || '')
  });
}

 get avalabledocket(): FormArray {
    return this.challanForm.get('avalabledocketinPRS') as FormArray;
  }

patchAvailableDockets(data: any[]) {
  this.avalabledocket.clear();

  data.forEach((item) => {
    let tatInHrs = '-';
    if (item.arrival_Date) {
      const arrival = new Date(item.arrival_Date);
      const now = new Date();
      const diffMs = now.getTime() - arrival.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      tatInHrs = diffHrs.toString();
    }

    const group = new FormGroup({
      isSelected: new FormControl(false),
      id: new FormControl(item.id ?? 0),
    dockno: new FormControl(item.dockno || ''),
    docksf: new FormControl(item.docksf || ''),
    manual_dockno: new FormControl(item.manual_dockno || ''),
    docket_Mode: new FormControl(item.docket_Mode || ''),
    bkg_Date: new FormControl(item.bkg_Date || ''),
    arrival_Date: new FormControl(item.arrival_Date || ''),
    commited_Dely_Date: new FormControl(item.commited_Dely_Date || ''),
    orgncd: new FormControl(item.orgncd || ''),
    desT_CD: new FormControl(item.desT_CD || ''),
    curr_Loc: new FormControl(item.curr_Loc || ''),
    pendPkgQty: new FormControl(item.pendPkgQty ?? 0),
    arrPkgQty: new FormControl(item.arrPkgQty ?? 0),
    pkgsno: new FormControl(item.pkgsno ?? 0),
    payBas: new FormControl(item.payBas || ''),
    paybaS_Str: new FormControl(item.paybaS_Str || ''),
    atad: new FormControl(item.atad || ''),
    cdeldt: new FormControl(item.cdeldt || ''),
    businesstype: new FormControl(item.businesstype || ''),
    trN_MOD: new FormControl(item.trN_MOD || ''),
    actuwt: new FormControl(item.actuwt ?? 0),
    arrWeightQty: new FormControl(item.arrWeightQty ?? 0),
    chrgwt: new FormControl(item.chrgwt ?? 0),
    freight: new FormControl(item.freight ?? 0),
    dkttot: new FormControl(item.dkttot ?? 0),
    handlingchrg: new FormControl(item.handlingchrg ?? 0),
    svctax: new FormControl(item.svctax ?? 0),
    cnd: new FormControl(item.cnd ?? 0),
    isEnabled: new FormControl(item.isEnabled ?? false),
    rate: new FormControl(item.rate ?? 0),
    maxLimit: new FormControl(item.maxLimit ?? 0),
    newRate: new FormControl(item.newRate ?? 0),
    cnt: new FormControl(item.cnt ?? 0),
    message: new FormControl(item.message || ''),
    eWayBillNo: new FormControl(item.eWayBillNo || ''),
    pkgsnO_Load: new FormControl(item.pkgsnO_Load ?? 0),
    chrgwT_Load: new FormControl(item.chrgwT_Load ?? 0),
    isRemoved: new FormControl(item.isRemoved ?? false),
    subreasoncode: new FormControl(item.subreasoncode || ''),
    party_name: new FormControl(item.party_name || ''),
    consignor_Name: new FormControl(item.consignor_Name || ''),
    stock_Update_DT: new FormControl(item.stock_Update_DT || ''),
    freeStorageDays: new FormControl(item.freeStorageDays || ''),
    demurrageCharge: new FormControl(item.demurrageCharge ?? 0),
    damcnt: new FormControl(item.damcnt ?? 0),
    requestCNT: new FormControl(item.requestCNT ?? 0),
    contractAmount: new FormControl(item.contractAmount ?? 0),
    bcSerialNo: new FormControl(item.bcSerialNo),
    tatInHrs: new FormControl(tatInHrs),
    rateType: new FormControl(''),
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
  const DocketList = (this.avalabledocket.controls as FormGroup[])
  .filter((group) => group.get('isSelected')?.value)
  .map((group) => group.value);
  console.log(DocketList)


const ListVendorType:any=[
  {
  "vendor_Type_Code": "string",
  "vendor_Type": "string",
  "displayIndex": 0
}
];

const ListCharges:any=[
  {
  "chargecode": "string",
  "chargename": "string",
  "operator": "string",
  "acccode": "string",
  "chargeAmount": 0,
  "cnt": 0
}
];

const THCCharge:any=[
  {
  "chargecode": "string",
  "chargename": "string",
  "operator": "string",
  "acccode": "string",
  "chargeAmount": 0,
  "cnt": 0
}
];
const MFList = (this.avalableForTHC.controls as FormGroup[])
  .filter(group => group.get('selected')?.value)
  .map(group => {
    return {
      ...group.value,
      id:0,
      isEnabled: true,
      isRemoved: false
    };
  });


  const PRSDRSDocketList = (this.avalabledocket.controls as FormGroup[])
  .filter(group => group.get('isSelected')?.value)
  .map(group => {
    const docket = { ...group.value, IsEnabled: true };
    return docket;
  });

  const payload={
    "CTH":{
    THCNO:"N/A",
    ManualTHCNo:this.challanForm.value.manualTHCNo,
    THCSF:"0",
    THCDate:this.challanForm.value.tHCDate,
    THCBRCD:this.docketService.loginUserList.LocationCode,
    THCDESTCD:"",
    FROMCITY:this.challanForm.value.FROMCITY?this.challanForm.value.FROMCITY:this.challanForm.value.from_City,
    TOCITY:this.challanForm.value.TOCITY?this.challanForm.value.TOCITY:this.challanForm.value.to_City,
    THCType:this.docketService.loginUserList.Type,
    RouteCategory:"",
    RouteType:this.challanForm.value.routeType,
    PKDLYType:"",
    RouteCode:this.challanForm.value.routeCode,
    RouteName:this.challanForm.value.routeName,
    VehicleNO:this.challanForm.value.vehicleNO,
    IsMarketVehicle:true,
    IsExtraVehicle:true,
    OpenKM:Number(this.challanForm.value.openKM),
    CloseKM:Number(this.challanForm.value.closeKM),
    TotalManifest:"",
    TotalDockets:Number(this.challanForm.value.totalDockets),
    TotalPackages:0,
    TotalActualWt:0,
    TotalChargeWt:0,
    FreeSpace:Number(this.challanForm.value.freeSpace),
    WtLoaded:Number(this.challanForm.value.wtLoaded),
    IsOverLoad:this.challanForm.value.isOverLoa?true:false,
    OverLoadReason:this.challanForm.value.overLoadReason,
    WtAdjust:0,
    TOTALWtAdjust:0,
    TOTALWithWtAdjust:0,
    WithWtAdjustPM:"",
    VendorCode:this.challanForm.value.vendorCode,
    VendorName:this.challanForm.value.vendorCode,
    VendorType:this.challanForm.value.vendorType,
    VendorAddress:"",
    VENDORMOBNO:"",
    VENDORPHONENO:"0",
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
    AckPenalyRate:0,
    LaterPenalyRate:0,
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
    IsQuickChallan:true,
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
    PaymentBy:0,
    ThirdPartyName:"",
    ThirdPartyPANNO:"",
    NoOfVehicle:0,
    Lat:"",
    Long:"",
    VehicleGPSStatus:"",
    ProprietorName:"",
    OWNERPANNOPATH:"",
    OWNERVEHDEPATH:"",
    BROKERPANNOPATH:"",
    THIRDPARTYPANNOPATH:"",
    RCBOOKPATH:"",
    IsOwnerPanRequired:true,
    IsBrokerPanRequired:true,
    BROKERVEHDEPATH:"",
    PaymentByType:0,
    IsOperationallyClose:true,
    OperationallyCloseBy:"",
    IsOperationallyClosebySMS:true,
    OperationallyCloseDate:"",
    IsEditMode:true,
    PickUpLocation:"",
    DropLocaion:"",
    SealType:0,
    SealNo:this.challanForm.value.sealNo,
    ActualDeptDate:this.challanForm.value.actualDeptDate,
    ScheduleDeptDate:this.challanForm.value.scheduleDeptDate,
    LateEarly:"",
    ScheduleNo:"",
    ScheduleTime:"",
    LateDepaturereason:this.challanForm.value.lateDepaturereason,
    IsEmpty:this.challanForm.value.isEmpty?true:false,
    IsCityEnabled:true,
    DeliveryZone:this.challanForm.value.deliveryZone,
    MKTVehicleNo:this.challanForm.value.mKTVehicleNo,
    ScheduleDay:"",
    VehicleCapacity:this.challanForm.value.vehicleCapacity?Number(this.challanForm.value.vehicleCapacity):0,
    VehicleCapacityUti:Number(this.challanForm.value.vehicleCapacityUti),
    TrainName:this.challanForm.value.trainName,
    TrainNo:this.challanForm.value.trainNo,
    RRNo:this.challanForm.value.RRNo,
    AirLine:this.challanForm.value.airLine,
    FromAddress:this.challanForm.value.fromAddress,
    From_City:this.challanForm.value.from_City,
    To_City:this.challanForm.value.to_City,
    Location:"",
    city_code:0,
    FromAddLat:"",
    FromAddLng:"",
    ToAddLat:"",
    ToAddress:this.challanForm.value.toAddress,
    ToAddLng:"",  
    distanceInKM:this.challanForm.value.distanceInKM,
    approxAPITime:"",
    EWayBillNo:this.challanForm.value.eWayBillNo,
    EWayBillExpiredDate:this.challanForm.value.eWayBillExpiredDate,
    IsMonthlyBillAllow:this.challanForm.value.isMonthlyBillAllow?true:false,
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
      Srno:0,
      Module_Name:"",
      RULE_Y_N:"",
      ModuleID:"",
      RULE_VALUE:"",
      RULE_DESC:"",
      IsFromTocityRequird:"",
      IsFromTocityRequirdinthc:"",
    },
    "CTFD":{
      THCNO:"N/A",
      THCSF:"0",
      ContractType:"",
      ContractAmount:Number(this.challanForm.value.contractAmount),
      StandardContractAmount:Number(this.challanForm.value.standardContractAmount),
      TotalCharges:0,
      NetAmount:this.challanForm.value.netAmount,
      AdvanceAmount:this.challanForm.value.advanceAmount,
      PendingAdvanceAmount:0,
      CollectedAdvanceAmount:0,
      AdvanceLocation:Number(this.challanForm.value.advanceLocation),
      AdvanceAmountPaid:0,
      AdvanceAmountPending:0,
      IsAdvancePaid:true,
      AdvancePaidOn:"",
      AdvancePaidBy:"",
      AdvanceVoucherNo:"",
      AdvanceVoucherDate:"",
      AdvanceCollMode:"",
      AdvanceChequeNo:"",
      AdvanceChequeDate:"",
      AdvanceLedger:"",
      BalanceAmount:Number(this.challanForm.value.balanceAmount),
      PendingBalanceAmount:0,
      CollectedBalanceAmount:0,
      BalanceLocation:this.challanForm.value.balanceLocation?this.challanForm.value.balanceLocation:'1',
      BalanceAmountPaid:0,
      BalanceAmountPending:0,
      BalanceCollMode:"",
      BalanceChequeNo:"",
      BalanceChequeDate:"",
      BalanceLedger:"",
      IsBalancePaid:true,
      BalancePaidOn:"",
      BalancePaidBy:"",
      BalanceVoucherNo:"",
      BalanceVoucherDate:"",
      SCDebitVoucher:"",
      SCDebitVoucherAmount:0,
      SCCreditVoucher:"",
      SCCreditVoucherAmount:0,
      FianacialRemark:"",
      FianacialStatus:"",
      Narration:"",
      PANNO:this.challanForm.value.PANNO,
      VendorBillNo:"",
      CENVATRATE:0,
      CENVATAMT:0,
      ServiceTaxAmount:0,
      TotalBill:0,
      InvoiceNo:"",
      WayBillNo:"",
      DFRClosed:"",
      DFRClosedBy:"",
      DFRClosedDate:"",
      TotalTDSAmount:Number(this.challanForm.value.totalTDSAmount),
      AdvanceTDSAmount:0,
      BalanceTDSAmount:0,
      TDSPercent:this.challanForm.value.TDSPercent ? Number(this.challanForm.value.TDSPercent): 0,
      AdvanceAmountWOTDS:0,
      BalanceAmountWOTDS:0,
      Comment:"",
      PendingAdvanceTDSAmount:0,
      CollectedAdvanceTDSAmount:0,
      PendingBalanceTDSAmount:0,
      CollectedBalanceTDSAmount:0,
      IsFromPRQ:"",
      Loadingcharge:Number(this.challanForm.value.Loadingcharge),
      LoadedRateType:"",
      LoadedBy:"",
      Rate:0,
      MaxLimit:0,
      VendorCode:"",
      IsMonthly:true,
      VendName:"",
      hdnRate:0,
      IsMathadi:true,
      MathadiSlipNo:"",
      MathadiDate:"2025-10-28T09:44:12.384Z",
      MathadiAmt:0,
      Is_Local_ODA_id:this.challanForm.value.is_Local_ODA_id,
      Check_Dockno:"",
      Type:0,
      AttachedRateType:0,
      IsTDSEnabled:this.challanForm.value.isTDSEnabled,
      TDSAcccode:this.challanForm.value.TDSAcccode,
      TDSAccdesc:"",
      TDSOnAmount:Number(this.challanForm.value.tDSOnAmount),
    },
    "CTVD":{
      THCNO:"N/A",
      THCSF:"0",
      VehicleNO:this.challanForm.value.vehicleNO,
      VehicleType:this.challanForm.value.vehicleType,
      FTLType:this.challanForm.value.fTLType,
      VehicleCapacity:this.challanForm.value.VehicleCapacity?this.challanForm.value.VehicleCapacity:'0',
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
      Make:0,
      Model:0,
      VehicleVolume:0,
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
      CAPACITY:0,
      MarketVehImage:"",
      tabletNumber:"",
      StaffName:"",
      StaffMobileNo:"",
      VehicleTypeSize:"",
      CustomerName:this.challanForm.value.customerName,
      Driver:"",
    },
    "CPML":{
      Id:0,
      BRCD:"",
      RatePerGM:0,
      VehicleSize:"",
    },
    "GC":{
      FromDate:"",
      ToDate:"",
      GCNO:"",
      PAYBAS:"",
      TRNMOD:"",
      BUSTYPE:"",
      DATETYPE:"2025-10-28T09:44:12.384Z",
      BookedByType:"",
      BookedBy:"",
      DOCTYP:"",
      TYP:"",
      isBookedby:true,
      LoadingBy:"",
      ChargeType:"",
      VendorCode:"",
      ODAType:"",
      DRSType:"",
    }
  }
  const formData = new FormData();
   this.appendObjectToFormData(formData, payload.CTH, "CVM.CTH");
  this.appendObjectToFormData(formData, payload.CMR, "CVM.CMR");
  this.appendObjectToFormData(formData, payload.CTFD, "CVM.CTFD");
  this.appendObjectToFormData(formData, payload.CTVD, "CVM.CTVD");
  this.appendObjectToFormData(formData, payload.CPML, "CVM.CPML");
  this.appendObjectToFormData(formData, payload.GC, "CVM.GC");


   formData.append("CVM.THCNo", "N/A");
   formData.append("CVM.DocketList", JSON.stringify(DocketList));
   formData.append("CVM.ListVendorType", JSON.stringify(ListVendorType));
   formData.append("CVM.ListCharges", JSON.stringify(ListCharges));
   formData.append("MFList",JSON.stringify(MFList));
   formData.append("THCCharge", JSON.stringify(THCCharge));
   formData.append("PRSDRSDocketList",JSON.stringify(PRSDRSDocketList));


   formData.append("CVM.IsMathadi", 'true');
   formData.append("CVM.BookedByType", "");
   formData.append("CVM.RatePerGram", "");
   formData.append("CVM.RatePerGramContractAmount", "");
   formData.append("CVM.ISAttechedVendor", "true");
   formData.append("CVM.ISContractualVendor", 'true');
   formData.append("CVM.RateType", "0");
   formData.append("CVM.IsMobileUser","true");
   formData.append("CVM.DemurrageCharge", "");
   formData.append("CVM.DiscountRatio", "");
   formData.append("CVM.FinalAmt", "");
    if (this.selectedFile) {
      formData.append("LoadingSlipAttachmentFile", this.selectedFile);
    }
   formData.append("BaseFinYear", this.docketService.loginUserList.FinYear);
   formData.append("BaseCompanyCode", this.docketService.loginUserList.Companycode);
   formData.append("BaseUserName", this.docketService.loginUserList.BaseUserName);
   formData.append("BaseUserType", '1');
   formData.append("BaseLocationCode", this.docketService.loginUserList.LocationCode);
  if(this.challanForm.valid){
    this.THCService.challanSubmit(formData).subscribe({next: (response) => {
        if (response) {
          alert('successfully')
        }
      },
    })
  }else{
    this.challanForm.markAllAsTouched();
  }
}

  appendObjectToFormData(formData: FormData, obj: any, parentKey: string = "") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const formKey = parentKey ? `${parentKey}.${key}` : key;

        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          // Recursive call if nested object
          this.appendObjectToFormData(formData, value, formKey);
        } else {
          formData.append(formKey, value !== null && value !== undefined ? String(value) : "");
        }
      }
    }
  }

 
}
