import { Injectable } from '@angular/core';
import { BasicDetailService } from './basic-detail.service';
import { generalMasterResponse } from '../models/general-master.model';
import { ChargesResponse, CityResponse, VehicleTyperesponse, VendeorsResponse } from '../models/thc-master.model';
import { THCMasterService } from './thc-master.service';
import { DocketService } from './docket.service';
import { DeliveryAgentService } from './delivery-agent.service';
import { LocationListResponse } from '../models/delivery-agent.model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SweetAlertService } from './sweet-alert.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChallanService {
env = environment;
public challanForm!:FormGroup;
public vendtyData:generalMasterResponse[]=[]
public vendorsList:VendeorsResponse[]=[]
public cityList:CityResponse[]=[];
public routeModeList:generalMasterResponse[]=[];
public locationData:LocationListResponse[]=[];
public latereasonList:generalMasterResponse[]=[];
public TDSLedgerData:VehicleTyperesponse[]=[];
public rateTypeData:generalMasterResponse[]=[];
public chargesDetailsList:ChargesResponse[]=[];
public selectedFile: File | null = null;
public isSubmitting:boolean = false;
public filterForm!:FormGroup;


constructor(
  private basicDetailService: BasicDetailService,
  private THCService:THCMasterService,
  private docketService:DocketService,
  private deliveryAgentService:DeliveryAgentService,public sweetAlertService:SweetAlertService,
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
     vendorType:event?.codeId ? event?.codeId:event,
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

getChargesDetails(){
  this.THCService.getChargesDetails().subscribe({
      next: (response: any) => {
        if (response && response.data) {
         this.chargesDetailsList = response.data;
           this.buildChargeControls(this.chargesDetailsList);
        }
      }
    });
}

buildChargeControls(charges: any[]): void {
  let chargesGroup = this.challanForm.get('charges') as FormGroup | null;
  if (!chargesGroup) {
    this.challanForm.addControl('charges', new FormGroup({}));
    chargesGroup = this.challanForm.get('charges') as FormGroup;
    if (!chargesGroup) { // extremely defensive
      console.error('Failed to create charges FormGroup');
      return;
    }
  }
  Object.keys(chargesGroup.controls).forEach(k => chargesGroup.removeControl(k));
  charges.forEach(ch => {
    const initial = (ch.chargeAmount ?? 0);
    chargesGroup.addControl(ch.chargecode, new FormControl(initial));
  });
  this.calculateNetAmount();
}

calculateNetAmount() {
  const contractAmount = Number(this.challanForm.get('contractAmount')?.value) || 0;
  const chargesGroup = this.challanForm.get('charges') as FormGroup;
  let netChargesEffect = 0;

  if (this.chargesDetailsList && this.chargesDetailsList.length) {
    this.chargesDetailsList.forEach(ch => {
      const ctrl = chargesGroup.get(ch.chargecode);
      const val = Number(ctrl?.value) || 0;
      if (ch.operator === '+' || ch.operator === '+') {
        netChargesEffect += val;
      } else if (ch.operator === '-' || ch.operator === '−') {
        netChargesEffect -= val;
      } else {
        netChargesEffect += val;
      }
    });
  } else {
    const telephoneCharges = Number(this.challanForm.get('telephoneCharges')?.value) || 0;
    const humaliCharges = Number(this.challanForm.get('humaliCharges')?.value) || 0;
    const mamulCharges = Number(this.challanForm.get('mamulCharges')?.value) || 0;
    netChargesEffect = telephoneCharges + humaliCharges - mamulCharges;
  }

  const netAmountBeforeTDS = contractAmount + netChargesEffect;

  const staxOnAmount = parseFloat(this.challanForm.get('tDSOnAmount')?.value || '0');
  const isTDSEnabled = this.challanForm.get('isTDSEnabled')?.value;
  const tdsRate = parseFloat(this.challanForm.get('TDSPercent')?.value || '0');
  let tdsAmount = 0;

  if (isTDSEnabled) {
    tdsAmount = this.rounditn((staxOnAmount * tdsRate) / 100, 0);
  }

  const finalNet = netAmountBeforeTDS - tdsAmount;

  this.challanForm.patchValue({
    totalTDSAmount: tdsAmount.toFixed(2),
    netAmount: finalNet.toFixed(2),
  }, { emitEvent: false });

  // vendor-specific balanceAmount behavior (unchanged)
  if (['XX1','04','19','XX'].includes(this.challanForm.value.vendorType)) {
    this.challanForm.patchValue({
      balanceAmount: finalNet.toFixed(2)
    }, { emitEvent: false });
  }
}

rounditn(value: number, digits: number): number {
  const multiplier = Math.pow(10, digits);
  return Math.round(value * multiplier) / multiplier;
}

SearchfilterForm(){
  this.filterForm=new FormGroup({
    dateRange:new FormControl(),
    paybas:new FormControl(),
    mode:new FormControl(),
    businessType:new FormControl(),
    loadingBy:new FormControl(),
    chargeType:new FormControl(),
    bookedType:new FormControl(),
    bookedBy:new FormControl(),
    cnoteNo:new FormControl()
  })
}

  buildForm(){
    const today = new Date(); 
const nextDay = new Date(today);
nextDay.setDate(today.getDate() + 1);
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
    ERD:new FormControl(nextDay),
    loadingSlipAttachment:new FormControl(),
    vehicleNo:new FormControl(),
    mKTVehicleNo:new FormControl(),
    tripSheetNo : new FormControl(),
    vehicleType : new FormControl(''),
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
    totalDockets: new FormControl(0, !isType1 ? [Validators.required, Validators.min(1)] : null),
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
    // telephoneCharges: new FormControl(0),
    // humaliCharges: new FormControl(0),
    // mamulCharges: new FormControl(0),
    charges: new FormGroup({}),
    flightCode:new FormControl(),
    airportCode:new FormControl(),
    trainNo:new FormControl(),
    trainName:new FormControl(),
    RRNo:new FormControl(),
    airLine:new FormControl(),
    flightScheduleTime:new FormControl(),
    airWayBillNo:new FormControl(),
    TotalManifest:new FormControl(0, isType1 ? [Validators.required, Validators.min(1)] : null),
    routeCode:new FormControl(null, isType1 ? Validators.required : null),
    customerName:new FormControl(),
  });
}

 get avalableForTHC(): FormArray {
    return this.challanForm.get('avalableForTHC') as FormArray;
  }

public buildMfGroup(item: any): FormGroup {
  return new FormGroup({
    selected: new FormControl(false),
    TCNO: new FormControl(item.tcno || ''),
    Manual: new FormControl(item.manual || ''),
    TCBR: new FormControl(item.tcbr || ''),
    TC_Date: new FormControl(item.tC_Date || item.tcdt_ddmmyyyy || ''),
    ToBH_CODE: new FormControl(item.toBH_CODE || ''),
    TOT_DKT: new FormControl(item.toT_DKT ?? 0),
    Packages: new FormControl(item.packages || ''),
    Weight: new FormControl(item.weight || ''),
    TotalInternalDocument: new FormControl(item.totalInternalDocument ?? 0),
    VehicleNo: new FormControl(item.vehicleNo || ''),
    TOT_LOAD_PKGS:new FormControl(item.toT_LOAD_PKGS || ''),
    TOT_LOAD_ACTWT:new FormControl(item.toT_LOAD_ACTWT || ''),
    MyRouteName:new FormControl(item.myRouteName || ''),
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
      ID: new FormControl(item.id ?? 0),
      DOCKNO: new FormControl(item.dockno || ''),
      DOCKSF: new FormControl(item.docksf || ''),
      manual_dockno: new FormControl(item.manual_dockno || ''),
      Docket_Mode: new FormControl(item.docket_Mode || ''),
      Bkg_Date: new FormControl(item.bkg_Date || ''),
      Arrival_Date: new FormControl(item.arrival_Date || ''),
      Commited_Dely_Date: new FormControl(item.commited_Dely_Date || ''),
      ORGNCD: new FormControl(item.orgncd || ''),
      DEST_CD: new FormControl(item.desT_CD || ''),
      Curr_Loc: new FormControl(item.curr_Loc || ''),
      PendPkgQty: new FormControl(item.pendPkgQty ?? 0),
      ArrPkgQty: new FormControl(item.arrPkgQty ?? 0),
      PKGSNO: new FormControl(item.pkgsno ?? 0),
      PayBas: new FormControl(item.payBas || ''),
      PAYBAS_Str: new FormControl(item.paybaS_Str || ''),
      ATAD: new FormControl(item.atad || ''),
      CDELDT: new FormControl(item.cdeldt || ''),
      businesstype: new FormControl(item.businesstype || ''),
      TRN_MOD: new FormControl(item.trN_MOD || ''),
      ACTUWT: new FormControl(item.actuwt ?? 0),
      ArrWeightQty: new FormControl(item.arrWeightQty ?? 0),
      CHRGWT: new FormControl(item.chrgwt ?? 0),
      Freight: new FormControl(item.freight ?? 0),
      DKTTOT: new FormControl(item.dkttot ?? 0),
      Handlingchrg: new FormControl(item.handlingchrg ?? 0),
      SVCTAX: new FormControl(item.svctax ?? 0),
      CND: new FormControl(item.cnd ?? 0),
      IsEnabled: new FormControl(item.isEnabled ?? false),
      Rate: new FormControl(item.rate ?? 0),
      MaxLimit: new FormControl(item.maxLimit ?? 0),
      NewRate: new FormControl(item.newRate ?? 0),
      CNT: new FormControl(item.cnt ?? 0),
      Message: new FormControl(item.message || ''),
      EWayBillNo: new FormControl(item.eWayBillNo || ''),
      PKGSNO_Load: new FormControl(item.pkgsnO_Load ?? 0),
      CHRGWT_Load: new FormControl(item.chrgwT_Load ?? 0),
      IsRemoved: new FormControl(item.isRemoved ?? false),
      subreasoncode: new FormControl(item.subreasoncode || ''),
      party_name: new FormControl(item.party_name || ''),
      Consignor_Name: new FormControl(item.consignor_Name || ''),
      Stock_Update_DT: new FormControl(item.stock_Update_DT || ''),
      FreeStorageDays: new FormControl(item.freeStorageDays || ''),
      DemurrageCharge: new FormControl(item.demurrageCharge ?? 0),
      DAMCNT: new FormControl(item.damcnt ?? 0),
      RequestCNT: new FormControl(item.requestCNT ?? 0),
      ContractAmount: new FormControl(item.contractAmount ?? 0),
      bcSerialNo: new FormControl(item.bcSerialNo),
      tatInHrs: new FormControl(tatInHrs),
      rateType: new FormControl(this.docketService.loginUserList.chrgType?this.docketService.loginUserList.chrgType:null),
      charge: new FormControl(0),
      rateError: new FormControl('')
    });
    group.get('rateType')?.valueChanges.subscribe(() => this.calculateCharge(group));
    group.get('NewRate')?.valueChanges.subscribe(() => this.calculateCharge(group));
    this.avalabledocket.push(group);
  });
}

validateRate(group: FormGroup): boolean {
  const loadingBy = this.docketService.loginUserList.loadingBy;
  if (loadingBy === 'XX9') {
    group.get('rateError')?.setValue('');
    return true; // no validation when XX9
  }

  const rateType = group.get('rateType')?.value;
  const rate = parseFloat(group.get('NewRate')?.value || '0') || 0;
  const chrgwt = parseFloat(group.get('CHRGWT')?.value || '0') || 0;
  const noofpkg = parseFloat(group.get('PKGSNO')?.value || '0') || 0;
  if (chrgwt === 0) {
    group.get('rateError')?.setValue('Charge weight is zero cannot validate rate.');
    group.get('NewRate')?.setValue('0.00', { emitEvent: false });
    return false;
  }

  let maxlimitcalculation = 0;

  if (rateType === '4') { 
    maxlimitcalculation = rate / chrgwt;
  } else if (rateType === '3') { 
    maxlimitcalculation = (rate * noofpkg) / chrgwt;
  } else {
    maxlimitcalculation = rate;
  }
  if (maxlimitcalculation > 5.0) {
    group.get('rateError')?.setValue('Rate Amount Is High Please Check');
    group.get('NewRate')?.setValue('0.00', { emitEvent: false });
    return false;
  } else {
    group.get('rateError')?.setValue('');
    return true;
  }
}

calculateCharge(group: FormGroup) {
   const isValid = this.validateRate(group);
  if (!isValid) {
    group.get('charge')?.setValue((0).toFixed(2), { emitEvent: false });
    this.updateTotalLoadingCharge();
    return;
  }
  const rateType = group.get('rateType')?.value;
  const newRate = parseFloat(group.get('NewRate')?.value || 0);
  const actuwt = parseFloat(group.get('ACTUWT')?.value || 0);
  const pkgsno = parseFloat(group.get('PKGSNO')?.value || 0);
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
  // const DocketList = (this.avalabledocket.controls as FormGroup[]).filter((group) => group.get('isSelected')?.value).map((group) => group.value);
    const DocketList = (this.avalabledocket.controls as FormGroup[]).filter(group => group.get('isSelected')?.value).map(group => {
   const docket = { ...group.value, NewRate: Number(group.value.NewRate)};return docket;});

  const ListVendorType: any = [
    {
      "Vendor_Type_Code": "",
      "Vendor_Type": "",
      "DisplayIndex": 0
    }
  ];
    const chargesGroup = this.challanForm.get('charges') as FormGroup;
    const formCharges = chargesGroup?.value || {};
    const THCCharge = this.chargesDetailsList.map(ch => ({
      chargecode: ch.chargecode,
      chargename: ch.chargename,
      Operator: ch.operator,
      Acccode: ch.acccode,
      ChargeAmount: Number(formCharges[ch.chargecode]) || 0,
      Cnt: ch.cnt || 0
    }));
  const ListCharges:any=THCCharge

  const MFList = (this.avalableForTHC.controls as FormGroup[]).filter(group => group.get('selected')?.value).map(group => {
    return {
      ...group.value,
      id:0,
      isEnabled: true,
      isRemoved: false
    };});

  const PRSDRSDocketList = (this.avalabledocket.controls as FormGroup[]).filter(group => group.get('isSelected')?.value).map(group => {
  const docket = { ...group.value, IsEnabled: true };return docket;});
  const challanForm = this.challanForm.value
  const payload = {
    "CTH":{
    THCNO:"N/A",
    ManualTHCNo:challanForm?.manualTHCNo,
    THCSF:"0",
    THCDate:challanForm?.tHCDate?.toISOString(),
    THCBRCD:this.docketService.loginUserList.LocationCode,
    THCDESTCD:"",
    FROMCITY:challanForm?.FROMCITY?challanForm?.FROMCITY:challanForm?.from_City,
    TOCITY:challanForm?.TOCITY?challanForm?.TOCITY:challanForm?.to_City,
    THCType:this.docketService.loginUserList.Type,
    RouteCategory:"",
    RouteType:challanForm?.routeType,
    PKDLYType:"",
    RouteCode:challanForm?.routeCode,
    RouteName:challanForm?.routeName,
    VehicleNO:challanForm?.vehicleNO?challanForm?.vehicleNO:'O',
    IsMarketVehicle:true,
    IsExtraVehicle:true,
    OpenKM:Number(challanForm?.openKM),
    CloseKM:Number(challanForm?.closeKM),
    TotalManifest:challanForm?.TotalManifest,
    TotalDockets:Number(challanForm?.totalDockets),
    TotalPackages:0,
    TotalActualWt:0,
    TotalChargeWt:0,
    FreeSpace:Number(challanForm?.freeSpace),
    WtLoaded:Number(challanForm?.wtLoaded),
    IsOverLoad:challanForm?.isOverLoad?true:false,
    OverLoadReason:challanForm?.overLoadReason,
    WtAdjust:0,
    TOTALWtAdjust:0,
    TOTALWithWtAdjust:0,
    WithWtAdjustPM:"",
    VendorCode:challanForm?.vendorCode,
    VendorName:challanForm?.vendorCode,
    VendorType:challanForm?.vendorType,
    VendorAddress:"",
    VENDORMOBNO:"",
    VENDORPHONENO:"0",
    SUPPLYERMOBNO:"",
    SUPPLYERCODE:"",
    SUPPLYERNAME:"",
    AIRAGENT:"",
    IsBrokerMemo:true,
    BrokerMemoPath:"",
    TripSheetNo:challanForm?.tripSheetNo,
    FleetNo:"",
    TAMNO:"",
    TRACKNO:"",
    AckDays:"",
    AckPenalyRate:0,
    LaterPenalyRate:0,
    ScheduleType:"",
    AirportCode:challanForm?.airportCode,
    AirportName:"",
    AirportDestination:"",
    FlightCode:challanForm?.flightCode,
    FlightScheduleTime:challanForm?.flightScheduleTime,
    FlightDepatureDate:"",
    AirportDepatureDate:"",
    IsFlightUpdat:true,
    AirWayBillNo:challanForm?.airWayBillNo,
    IsBCProcess:true,
    IsFinancialEdit:true,
    IsFinalized:true,
    IsClosed:true,
    THCRemarks:challanForm?.THCRemarks,
    OperationalStatus:"",
    ClosedBy:"",
    ClosedDate:"",
    IsCancelled:true,
    IsQuickChallan:true,
    CancelBy:"",
    CancelDate:"",
    CancelReason:"",
    EntryBy:challanForm?.entryBy,
    EntryDate:"",
    UpdatBy:"",
    UpdatDate:"",
    LorryOwnerName:"",
    LorryOwnerAddress:"",
    LorryOwnerMobileNo:"",
    LorryOwnerPanNo:challanForm?.lorryOwnerPanNo,
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
    SealNo:challanForm?.sealNo,
    ActualDeptDate:challanForm?.actualDeptDate?.toISOString(),
    ScheduleDeptDate:challanForm?.scheduleDeptDate?.toISOString(),
    LateEarly:"",
    ScheduleNo:"",
    ScheduleTime:"",
    LateDepaturereason:challanForm?.lateDepaturereason,
    IsEmpty:challanForm?.isEmpty?true:false,
    IsCityEnabled:true,
    DeliveryZone:challanForm?.deliveryZone,
    MKTVehicleNo:challanForm?.mKTVehicleNo,
    ScheduleDay:"",
    VehicleCapacity:challanForm?.vehicleCapacity?Number(challanForm?.vehicleCapacity):0,
    VehicleCapacityUti:Number(challanForm?.vehicleCapacityUti),
    TrainName:challanForm?.trainName,
    TrainNo:challanForm?.trainNo,
    RRNo:challanForm?.RRNo,
    AirLine:challanForm?.airLine,
    FromAddress:challanForm?.fromAddress,
    From_City:challanForm?.from_City,
    To_City:challanForm?.to_City,
    Location:"",
    city_code:0,
    FromAddLat:"",
    FromAddLng:"",
    ToAddLat:"",
    ToAddress:challanForm?.toAddress,
    ToAddLng:"",  
    distanceInKM:challanForm?.distanceInKM,
    approxAPITime:"",
    EWayBillNo:challanForm?.eWayBillNo,
    EWayBillExpiredDate:challanForm?.eWayBillExpiredDate,
    IsMonthlyBillAllow:challanForm?.isMonthlyBillAllow?true:false,
    DeliveryAgent:challanForm?.deliveryAgent,
    DeliveryAgentMoNo:challanForm?.deliveryAgentMoNo,
    LoadingDate:challanForm?.loadingDate?.toISOString(),
    CityRouteCode:"",
    CityRouteKM:"",
    LoadingSlipAttachment:challanForm?.loadingSlipAttachment,
    ApprovedBy:"",
    ERD:challanForm?.ERD,
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
      ContractAmount:Number(challanForm?.contractAmount),
      StandardContractAmount:Number(challanForm?.standardContractAmount),
      TotalCharges:0,
      NetAmount:challanForm?.netAmount,
      AdvanceAmount:challanForm?.advanceAmount,
      PendingAdvanceAmount:0,
      CollectedAdvanceAmount:0,
      AdvanceLocation:challanForm?.advanceLocation,
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
      BalanceAmount:Number(challanForm?.balanceAmount),
      PendingBalanceAmount:0,
      CollectedBalanceAmount:0,
      BalanceLocation:challanForm?.balanceLocation?challanForm?.balanceLocation:'1',
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
      PANNO:challanForm?.PANNO,
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
      TotalTDSAmount:Number(challanForm?.totalTDSAmount),
      AdvanceTDSAmount:0,
      BalanceTDSAmount:0,
      TDSPercent:challanForm?.TDSPercent ? Number(challanForm?.TDSPercent): 0,
      AdvanceAmountWOTDS:0,
      BalanceAmountWOTDS:0,
      Comment:"",
      PendingAdvanceTDSAmount:0,
      CollectedAdvanceTDSAmount:0,
      PendingBalanceTDSAmount:0,
      CollectedBalanceTDSAmount:0,
      IsFromPRQ:"",
      Loadingcharge:Number(challanForm?.Loadingcharge),
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
      MathadiDate:new Date().toISOString(),
      MathadiAmt:0,
      Is_Local_ODA_id:challanForm?.is_Local_ODA_id,
      Check_Dockno:"",
      Type:0,
      AttachedRateType:0,
      IsTDSEnabled:challanForm?.isTDSEnabled,
      TDSAcccode:challanForm?.TDSAcccode,
      TDSAccdesc:"",
      TDSOnAmount:Number(challanForm?.tDSOnAmount),
    },
    "CTVD":{
      THCNO:"N/A",
      THCSF:"0",
      VehicleNO:challanForm?.vehicleNO?challanForm?.vehicleNO:'O',
      VehicleType:challanForm?.vehicleType,
      FTLType:challanForm?.fTLType,
      VehicleCapacity:challanForm?.vehicleCapacity?challanForm?.vehicleCapacity:'0',
      VehicleSize:"",
      Driver1Name:challanForm?.driver1Name,
      Driver1MobileNo:challanForm?.driver1MobileNo,
      Driver1RTONo:challanForm?.driver1RTONo,
      Driver1Licence:challanForm?.driver1Licence,
      D1_DOB: challanForm?.d1_DOB ? new Date(challanForm.d1_DOB).toISOString() : null,
      Driver1LicenceValDate:new Date(challanForm?.driver1LicenceValDate)?.toISOString(),
      Driver2Name:challanForm?.driver2Name,
      Driver2MobileNo:challanForm?.driver2MobileNo,
      Driver2RTONo:challanForm?.driver2RTONo,
      Driver2Licence:challanForm?.driver2Licence,
      Driver2LicenceValDate:challanForm?.driver2LicenceValDate?.toISOString(),
      DriverPhotoPath:"",
      Make:0,
      Model:0,
      VehicleVolume:0,
      VehicleColor:"",
      CHASISNO:challanForm?.cHASISNO,
      ENGINENO:challanForm?.eNGINENO,
      MODELNo:"",
      RCBOOKNO:challanForm?.rCBOOKNO,
      CertificateNo:"",
      InsuranceNo:"",
      RTONo:"",
      RegistrationDate:challanForm?.registrationDate?.toISOString(),
      FitnessDate:challanForm?.fitnessDate?.toISOString(),
      PermitDate:challanForm?.permitDate?.toISOString(),
      InsuranceDate:challanForm?.insuranceDate?.toISOString(),
      CAPACITY:0,
      MarketVehImage:"",
      tabletNumber:"",
      StaffName:"",
      StaffMobileNo:"",
      VehicleTypeSize:"",
      CustomerName:challanForm?.customerName,
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
      DATETYPE:new Date().toISOString(),
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

      if (!this.challanForm.valid) {
      const invalidKeys = Object.keys(this.challanForm.controls).filter(key => 
        this.challanForm.get(key)?.invalid
      );

      console.log("Invalid controls:", invalidKeys);
    }

  if(this.challanForm.valid){
    this.isSubmitting = true;
    this.THCService.challanSubmit(formData).subscribe({next: (response:any) => {
        if (response && response.data) {
          //  this.sweetAlertService.success(response.data.doctyp +' '+ 'Document ' +  response.data.docno +' '+ response.data.tranXaction)
          //  https://sepluat.cygnux.in/Operation/ChallanDone?DOCNO=PS%2FPIM%2F2526%2F002491&DOCTYP=PRS&TranXaction=Successfully%20Generated&IsError=False
          window.parent.location.href = `${this.env.liveUrl}Operation/ChallanDone?DOCNO=${response.data.docno}&DOCTYP=${response.data.doctyp}&TranXaction=${response.data.tranXaction}&IsError=${response.data.isError}&src=angular`;

        }
        this.isSubmitting=false;
      },error: (error) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
         this.sweetAlertService.error(error?.error?.message);
        this.isSubmitting=false;
        }
    })
  }else{
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
