import { Injectable } from '@angular/core';
import { BasicDetailService } from './basic-detail.service';
import { generalMasterResponse } from '../models/general-master.model';
import { BranchWiseLoadingUnloading, ChargesResponse, CityResponse, VehicleTyperesponse, VendeorsResponse } from '../models/thc-master.model';
import { THCMasterService } from './thc-master.service';
import { DocketService } from './docket.service';
import { DeliveryAgentService } from './delivery-agent.service';
import { LocationListResponse } from '../models/delivery-agent.model';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SweetAlertService } from './sweet-alert.service';
import { environment } from 'environments/environment';
import { mobileNo } from '../constants/common';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChallanService {
env = environment;
public challanForm!:FormGroup;
public vendtyData:generalMasterResponse[]=[]
public vendorsList:VendeorsResponse[]=[]
public vendorsChargesList:VendeorsResponse[]=[]
public cityList:CityResponse[]=[];
public routeModeList:generalMasterResponse[]=[];
public locationData:LocationListResponse[]=[];
public latereasonList:generalMasterResponse[]=[];
public TDSLedgerData:VehicleTyperesponse[]=[];
public rateTypeData:generalMasterResponse[]=[];
public chargesDetailsList:ChargesResponse[]=[];
public branchWiseLoadingUnloadingList:BranchWiseLoadingUnloading[]=[];
public selectedFile: File | null = null;
public isSubmitting:boolean = false;
public filterForm!:FormGroup;
public isRedirect:boolean = false;
public filterList:any;
public generateData!:any;
public isAgentSelected: boolean = false; 

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
//   getVendorsList(event: any) {
//   const data = {
//     vendorType: event?.codeId ? event?.codeId : event,
//     branchCode: this.docketService.loginUserList.LocationCode,
//     userName: this.docketService.loginUserList.BaseUserName,
//     documentType: this.docketService.loginUserList.Type
//   };

//   return this.THCService.getVendorsList(data).pipe(
//     tap((response: any) => {
//       if (response.success) {
//         this.vendorsList = response.data;
//       }
//     })
//   );
// }

  getChargesVendorsList(event:any) {
    const data = {
     vendorType:event?.codeId ? event?.codeId:event,
     branchCode:this.docketService.loginUserList.LocationCode,
     userName: this.docketService.loginUserList.BaseUserName,
     documentType:this.docketService.loginUserList.Type
    }
    this.THCService.getVendorsList(data).subscribe({
      next: (response) => {
        if (response.success) {
          // this.vendorsChargesList = response.data;
          this.branchWiseLoadingUnloadingList = response.data.map((x: any) => ({
          value: x.vendor_Code,
          text: x.vendor_Name
        }));
        }
      },
    });
  }

  branchWiseLoadingUnloading(event:any) {
    const data = {
     vendorType:event,
     baseLocationCode:this.docketService.loginUserList.LocationCode,
    }
    this.THCService.getBranchWiseLoadingUnloadingVendorList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.branchWiseLoadingUnloadingList = response.data;
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

  const netAmount = Number(this.challanForm.get('netAmount')?.value) || 0;
  const advanceAmount = Number(this.challanForm.get('advanceAmount')?.value) || 0;
  if(netAmount>=advanceAmount){
  const balanceAmount = netAmount - advanceAmount;
  this.challanForm.patchValue({ balanceAmount });
  }
}
  //   this.challanForm.patchValue({
  //     balanceAmount: finalNet.toFixed(2)
  //   }, { emitEvent: false });
  // }
  
}

rounditn(value: number, digits: number): number {
  const multiplier = Math.pow(10, digits);
  return Math.round(value * multiplier) / multiplier;
}

SearchfilterForm(){
   const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - 29); // subtract 30 days
 
  // format to yyyy-MM-dd (HTML date input compatible)
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  this.filterForm=new FormGroup({
    bookingDateType:new FormControl('1'),
    fromdt:new FormControl(formatDate(fromDate)),
    todt:new FormControl(formatDate(today)),
    dttyp:new FormControl('1'),
    paybas:new FormControl(),
    trnMod:new FormControl(),
    bustyp:new FormControl(),
    docketList:new FormControl(),
    loadingBy:new FormControl('XX9'),
    loadingBycodeFor:new FormControl('XX9'),
    chrgType:new FormControl(),
    odaType:new FormControl(),
    flag:new FormControl(2),
    LocationCode:new FormControl(''),
    BookedByType:new FormControl(''),
    BookedBy:new FormControl(),
    loadingByName:new FormControl(''),
    DRSType: new FormControl(''),
    dateRange:new FormControl([fromDate, today]),
  })
}

  buildForm(){
  const isType1 = this.docketService.loginUserList?.Type === '1';
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
    vendorName:new FormControl(),
    FROMCITY:new FormControl(null, isType1 ? Validators.required : null),
    TOCITY:new FormControl(null, isType1 ? Validators.required : null),
    ERD:new FormControl(),
    loadingSlipAttachment:new FormControl(),
    vehicleNo:new FormControl(),
    mKTVehicleNo:new FormControl(),
    tripSheetNo : new FormControl(),
    vehicleType : new FormControl(null, !isType1 ? Validators.required : null),
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
    driver1MobileNo: new FormControl(null,[ Validators.pattern(mobileNo),...(isType1 ? [Validators.required] : [])]),
    driver2Name:new FormControl(),
    driver2MobileNo:new FormControl(null,[Validators.pattern(mobileNo)]),
    driver2Licence:new FormControl(),
    driver2RTONo:new FormControl(),
    driver2LicenceValDate:new FormControl(),
    deliveryAgent : new FormControl(),
    DeliveryAgentName:new FormControl(),
    deliveryAgentMoNo : new FormControl(),
    eWayBillNo : new FormControl(),
    eWayBillExpiredDate : new FormControl(),
    approvedBy:new FormControl(null),
    is_Local_ODA_id : new FormControl('local'),
    totalDockets: new FormControl(0, !isType1 ? [Validators.required, Validators.min(1)] : null),
    contractAmount : new FormControl(0,[Validators.required,Validators.min(1),Validators.max(99999999)]),
    isTDSEnabled : new FormControl(),
    tDSOnAmount : new FormControl(0),
    totalTDSAmount : new FormControl(0),
    netAmount : new FormControl(0),
    advanceAmount : new FormControl(0, this.docketService.loginUserList.Type === '1' ? Validators.required : null),
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
    vehicleNO:new FormControl(null),
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
    vendorChargesCode:new FormControl(),
    rate:new FormControl(),
    ISNEWDA:new FormControl(false),
  }, { validators: this.advanceNotGreaterThanNet.bind(this) }
);
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
      NewRate: new FormControl(item?.newRate ?? 0),
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
      rateType: new FormControl(this.challanForm.value.chrgType?this.challanForm.value.chrgType:null),
      charge: new FormControl(0),
      rateError: new FormControl(''),
      partY_CODE:new FormControl(item.partY_CODE || ''),
      csgenm:new FormControl(item.csgenm || '')
    });
    group.get('rateType')?.valueChanges.subscribe(() => this.calculateCharge(group));
    group.get('NewRate')?.valueChanges.subscribe(() => this.calculateCharge(group));
    this.avalabledocket.push(group);
  });
}

advanceNotGreaterThanNet(control: AbstractControl) {
  const net = Number(control.get('netAmount')?.value) || 0;
  const adv = Number(control.get('advanceAmount')?.value) || 0;

  return adv > net ? { advanceInvalid: true } : null;
}

generatePRSfilter(event?:any){ 
  if(this.docketService.loginUserList.Type === '1'){
    return;
  }
  if(this.challanForm.value?.vendorType!=='04' && event){
      return;
  }
  const data = this.filterList;
  const payload = {
    gcno: '0',
    drsType: "",
    typ:this.docketService.loginUserList.Type === '2' ? 2 : 3,
    datetype: data.bookingDateType || '',
    vendorCode:this.challanForm.value?.vendorType ==='04'? this.challanForm.value.vendorCode:'',
    bookedBy:  data.BookedBy || '',
    bookedByType: data.BookedByType || '',
    fromDate: new Date(data?.dateRange[0]).toISOString(),
    toDate: new Date(data?.dateRange[1]).toISOString(),
    paybas: data.paybas? data.paybas:'ALL',
    trnmod: data.trnMod?data.trnMod:'ALL',
    bustype: data.bustyp?data.bustyp:'ALL',
    doctyp: this.docketService.loginUserList.Type === '2'?"PRS":"DRS",
    loadingBy: data.loadingBy || '',
    chargeType: data.chrgType?data.chrgType:"ALL",
    odaType: data.odaType?data.odaType:'',
  }
  const baseCompanydata = {
    TYP:this.docketService.loginUserList.Type === '2' ? 2 : 3,
    baseCompanyCode:this.docketService.loginUserList.Companycode,
    baseLocationCode:this.docketService.loginUserList.LocationCode,
  }
    this.THCService.generate(baseCompanydata,payload).subscribe({
    next: (response: any) => {
      if (response) {
        console.log(this.filterList?.DRSType)
          if (this.filterList.DRSType === 'N') {
      const allowedVendorCodes = ['XX1', '19', 'XX'];

      this.vendtyData = response.listVendorType
        .filter((x: any) => allowedVendorCodes.includes(x.vendor_Type_Code))
        .map((x: any) => ({
          codeId: x.vendor_Type_Code,
          codeDesc: x.vendor_Type
        }));
    } else {
      // normal flow – all vendor types
      this.vendtyData = response.listVendorType.map((x: any) => ({
        codeId: x.vendor_Type_Code,
        codeDesc: x.vendor_Type
      }));
    }
     this.generateData = response;
      }
      },error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
}

validateRate(group: FormGroup): boolean {
  const loadingBy = this.filterList?.loadingBy;
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

onReset(){
 window.location.reload();
}

formatDateWithoutTimezone(date: any): string | null {

  if (!date) return null;

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;

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
    IsOverLoad:challanForm?.isOverLoad ? true:false,
    OverLoadReason:challanForm?.overLoadReason,
    WtAdjust:0,
    TOTALWtAdjust:0,
    TOTALWithWtAdjust:0,
    WithWtAdjustPM:"",
    VendorCode:challanForm?.vendorCode,
    VendorName:challanForm?.vendorName ? challanForm?.vendorName :challanForm?.vendorCode,
    VendorType:challanForm?.vendorType,
    VendorAddress:"",
    VENDORMOBNO:"",
    VENDORPHONENO:"0",
    SUPPLYERMOBNO:"",
    SUPPLYERCODE:"",
    SUPPLYERNAME:"",
    AIRAGENT:"",
    IsBrokerMemo:false,
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
    IsFlightUpdat:false,
    AirWayBillNo:challanForm?.airWayBillNo,
    IsBCProcess:false,
    IsFinancialEdit:this.generateData?.cth?.isFinancialEdit ? this.generateData?.cth?.isFinancialEdit :false ,
    IsFinalized:this.generateData?.cth?.isFinalized ? this.generateData?.cth?.isFinalized :false ,
    IsClosed:this.generateData?.cth?.isClosed ? this.generateData?.cth?.isClosed :false ,
    THCRemarks:challanForm?.THCRemarks,
    OperationalStatus:"",
    ClosedBy:"",
    ClosedDate:"",
    IsCancelled:this.generateData?.cth?.isCancelled ? this.generateData?.cth?.isCancelled : false ,
    IsQuickChallan:this.generateData?.cth?.isQuickChallan ? this.generateData?.cth?.isQuickChallan :false ,
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
    IsSafeEx:this.generateData?.cth?.isSafeEx ? this.generateData?.cth?.isSafeEx :false ,
    IsReassign:false,
    ReassignBy:"",
    ReassignDate:"",
    IsVehDecRequired:this.generateData?.cth?.isVehDecRequired ? this.generateData?.cth?.isVehDecRequired :false ,
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
    IsOwnerPanRequired:this.generateData?.cth?.isOwnerPanRequired ? this.generateData?.cth?.isOwnerPanRequired : false,
    IsBrokerPanRequired:this.generateData?.cth?.isBrokerPanRequired ? this.generateData?.cth?.isBrokerPanRequired : false,
    BROKERVEHDEPATH:"",
    PaymentByType:0,
    IsOperationallyClose:this.generateData?.cth?.isOperationallyClose ? this.generateData?.cth?.isOperationallyClose :false,
    OperationallyCloseBy:"",
    IsOperationallyClosebySMS:this.generateData?.cth?.isOperationallyClosebySMS ? this.generateData?.cth?.isOperationallyClosebySMS : false,
    OperationallyCloseDate:"",
    IsEditMode:this.generateData?.cth?.isEditMode ? this.generateData?.cth?.isEditMode :false,
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
    IsCityEnabled:this.generateData?.cth?.isCityEnabled ? this.generateData?.cth?.isCityEnabled : false,
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
    DeliveryAgentName:challanForm?.DeliveryAgentName,
    DeliveryAgentMoNo:challanForm?.deliveryAgentMoNo,
    LoadingDate:challanForm?.loadingDate?.toISOString(),
    CityRouteCode:"",
    CityRouteKM:"",
    LoadingSlipAttachment:challanForm?.loadingSlipAttachment,
    ApprovedBy:challanForm?.approvedBy,
    ERD:new Date(challanForm?.ERD).toISOString(),
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
      IsMathadi:this.generateData?.isMathadi ? this.generateData?.isMathadi:false ,
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
      D1_DOB: challanForm?.d1_DOB ? this.formatDateWithoutTimezone(challanForm?.d1_DOB) : null,
      Driver1LicenceValDate:new Date(challanForm?.driver1LicenceValDate)?.toISOString(),
      Driver2Name:challanForm?.driver2Name,
      Driver2MobileNo:challanForm?.driver2MobileNo,
      Driver2RTONo:challanForm?.driver2RTONo,
      Driver2Licence:challanForm?.driver2Licence,
      // Driver2LicenceValDate:challanForm?.driver2LicenceValDate?.toISOString(),
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


   formData.append("CVM.IsMathadi", this.generateData?.isMathadi ? this.generateData?.isMathadi :false );
   formData.append("CVM.BookedByType", "");
   formData.append("CVM.RatePerGram", "");
   formData.append("CVM.RatePerGramContractAmount", "");
   formData.append("CVM.ISAttechedVendor", this.generateData?.isAttechedVendor ?this.generateData?.isAttechedVendor :false );
   formData.append("CVM.ISContractualVendor", this.generateData?.isContractualVendor ? this.generateData?.isContractualVendor :false );
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
   formData.append("ISNEWDA", challanForm.ISNEWDA);

      if (!this.challanForm.valid) {
      const invalidKeys = Object.keys(this.challanForm.controls).filter(key => 
        this.challanForm.get(key)?.invalid
      );

      console.log("Invalid controls:", invalidKeys);
    }

    if(this.challanForm.valid){
    this.isSubmitting = true;
    this.THCService.challanSubmit(formData).subscribe({next: (response:any) => {
        if (response && response.data && !response.data.isError) {
          this.isRedirect = true;
          window.parent.location.href = `${this.env.liveUrl}Operation/ChallanDone?DOCNO=${response.data.docno}&DOCTYP=${response.data.doctyp}&TranXaction=${response.data.tranXaction}&IsError=${response.data.isError}&src=angular`;
        }else{
             this.sweetAlertService.error('You have some form errors. Please check below.');
        }
        this.isSubmitting=false;
      },error: (error) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
            this.sweetAlertService.error(error?.error?.message);
            this.isSubmitting=false;
            this.isRedirect = false;
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
