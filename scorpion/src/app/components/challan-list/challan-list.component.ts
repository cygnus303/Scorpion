import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { VehicleTyperesponse } from 'app/shared/models/thc-master.model';
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
public deliverAgentData:any[]=[];
public isInsuranceExpired : boolean = false;
public isFitnessExpired : boolean = false;
public isPermitExpired : boolean = false;
public isLicenseExpired : boolean = false;
public lastFetchedVehicleNo: string | null = null; 
public vehicleTypeList:VehicleTyperesponse[]=[];

constructor(
  public challanService:ChallanService,
  public docketService:DocketService,
  public basicDetailService:BasicDetailService,
  public sweetAlertService:SweetAlertService,
  private deliveryAgentService:DeliveryAgentService,
  public THCService:THCMasterService
){}
 ngOnInit(){
    this.buildForm();
    this.challanService.getVendtyData();
    this.challanService.getCityList();
    this.docketService.getTypeofMovementData();
    this.challanService.getRouteMode();
    this.challanService.getDepartmentReason();
    this.challanService.getTDSLedgerList();
    this.challanService.getLocationData();
    this.avalabledocketinPRS()
    this.getDAList();
    this.challanService.getRateTypeData()
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

calculateNetAmount() {
  const contractAmount = Number(this.challanForm.get('contractAmount')?.value) || 0;
  const telephoneCharges = Number(this.challanForm.get('telephoneCharges')?.value) || 0;
  const humaliCharges = Number(this.challanForm.get('humaliCharges')?.value) || 0;
  const mamulCharges = Number(this.challanForm.get('mamulCharges')?.value) || 0;
  
  const netAmount = contractAmount + telephoneCharges + humaliCharges - mamulCharges;
  
  const staxOnAmount = parseFloat(this.challanForm.get('tDSOnAmount')?.value || 0);
  const isTDSEnabled = this.challanForm.get('isTDSEnabled')?.value;
  const tdsRate = parseFloat(this.challanForm.get('TDSPercent')?.value || 0);
  let tdsAmount = 0;
  
  if (isTDSEnabled) {
    tdsAmount = this.rounditn((staxOnAmount * tdsRate) / 100, 0);
  }
  
  this.challanForm.patchValue({
    totalTDSAmount: tdsAmount.toFixed(2),
    netAmount: (netAmount - tdsAmount).toFixed(2),
  });
  
  if(this.challanForm.value.vendorType === 'XX1'|| this.challanForm.value.vendorType ==='04'|| this.challanForm.value.vendorType ==='19'|| this.challanForm.value.vendorType ==='XX'){
    this.challanForm.patchValue({
      balanceAmount:(netAmount - tdsAmount).toFixed(2)
    })
  }
}

calculateBalanceAmount() {
  const netAmount = Number(this.challanForm.get('netAmount')?.value) || 0;
  const advanceAmount = Number(this.challanForm.get('advanceAmount')?.value) || 0;
  const balanceAmount = netAmount - advanceAmount;
  this.challanForm.patchValue({ balanceAmount });
}

changeAmountApplicable(event:any){
  this.challanForm.patchValue({
       tDSOnAmount:event.target.value
  });

  this.calculateNetAmount();
  // this.calculateSubTotal()
}

calculateSubTotal() {
  const form = this.challanForm;

  let contractAmount = parseFloat(form.get('contractAmount')?.value || 0);
  let totalCharges = 0;

  // // Assuming challanCharges is a FormArray of charge controls
  // const chargesArray = form.get('charges')?.value || [];
  // chargesArray.forEach((charge: any) => {
  //   const amount = parseFloat(charge.chargeAmount || 0);
  //   const operator = charge.operator || '+';
  //   totalCharges += operator === '+' ? amount : -amount;
  // });
   const telephoneCharges = Number(this.challanForm.get('telephoneCharges')?.value) || 0;
  const humaliCharges = Number(this.challanForm.get('humaliCharges')?.value) || 0;
  const mamulCharges = Number(this.challanForm.get('mamulCharges')?.value) || 0;

  const netAmount = contractAmount + telephoneCharges + humaliCharges - mamulCharges;

  let advanceAmount = parseFloat(form.get('advanceAmount')?.value || 0);
  let freight = netAmount ;

  const staxOnAmount = parseFloat(form.get('tdsOnAmount')?.value || 0);
  const isTDSEnabled = form.get('isTDSEnabled')?.value;
  const tdsRate = parseFloat(form.get('tdsPercent')?.value || 0);
  let tdsAmount = 0;

  if (isTDSEnabled) {
    tdsAmount = this.rounditn((staxOnAmount * tdsRate) / 100, 0);
  }

  form.patchValue({
    totalTDSAmount: tdsAmount.toFixed(2),
    netAmount: (netAmount + contractAmount - tdsAmount).toFixed(2),
  });

  if (freight >= advanceAmount) {
    const balanceAmount = freight - advanceAmount - tdsAmount;
    form.patchValue({
      balanceAmount: balanceAmount.toFixed(2),
    });
  } else {
    console.warn('Advance amount cannot exceed Net Amount');
  }
}

// Helper method
rounditn(value: number, digits: number): number {
  const multiplier = Math.pow(10, digits);
  return Math.round(value * multiplier) / multiplier;
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

  // updateTotalDockets() {
  //   const docketArray = this.challanForm.get('avalabledocketinPRS') as FormArray;
  //   if (!docketArray) return;
  //   const total = docketArray.controls.reduce((sum, control) => {
  //     if (control.get('isSelected')?.value) {
  //       return sum + (Number(control.get('contractAmount')?.value) || 0);
  //     }
  //     return sum;
  //   }, 0);
  //   this.updateTotalLoadingCharge();
  //   this.challanForm.patchValue({
  //     contractAmount: total,
  //   });
  // }

updateTotalDockets() {
  const docketArray = this.challanForm.get('avalabledocketinPRS') as FormArray;
  if (!docketArray) return;

  let totalAmount = 0;
  let selectedCount = 0;

  docketArray.controls.forEach(control => {
    if (control.get('isSelected')?.value) {
      selectedCount++;
      totalAmount += Number(control.get('contractAmount')?.value) || 0;
    }
  });

  // update other related values
  this.updateTotalLoadingCharge();

  // patch both values into the form
  this.challanForm.patchValue({
    contractAmount: totalAmount,
    totalDockets: selectedCount,
    tDSOnAmount:totalAmount
  });
}

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const docketArray = this.challanForm.get('avalabledocketinPRS') as FormArray;

    docketArray.controls.forEach(control => {
      control.get('isSelected')?.setValue(checked, { emitEvent: false });
    });

    this.updateTotalDockets();
  }

  get isAllSelected(): boolean {
    const validRows = this.avalabledocket.controls.filter((c: any) => !c.value.message);
    return (
      validRows.length > 0 &&
      validRows.every((c: any) => c.get('isSelected').value)
    );
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
      if (pattern[i].test(ch)) filtered += ch;
    }
  } else {
    filtered = value.replace(/[^A-Z0-9]/g, '').slice(0, this.selectedDigit);
  }
  if (filtered.length > this.selectedDigit) {
    filtered = filtered.slice(0, this.selectedDigit);
  }
  control.setValue(filtered, { emitEvent: false });
  if ( filtered.length === this.selectedDigit && filtered !== this.lastFetchedVehicleNo) {
    this.lastFetchedVehicleNo = filtered;
    this.getVehicleDetail(filtered);
  }
}

vendorCodeName(){
  this.challanForm.patchValue({vendorCode:null})
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

  onChangeLicenceNumber(event?: any) {
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
         this.challanForm.patchValue({
          TDSPercent:response.data.tdsPercentage,
         })
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
  if(event.value!=='O'){
  this.getNewVehicleDetail(event.value)
  }
  this.checkPermitExpiry();
  this.checkInsuranceExpiry();
  this.checkFitnessExpiry();
  this.checkLicenseExpiry()
}

getVehicleCapacity(id:string){
  this.THCService.getVahicleCapacity(id).subscribe({
    next: (response: any) => {
      if (response && response.data) {
       this.challanForm.patchValue({
        vehicleCapacity:response.data.capacity,
        TDSAcccode:response.data.acccode
       })
      }
    },
  });
}

 checkDateExpiry(dateValue: any): boolean {
  if (!dateValue) return false; // no message if empty
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

checkPermitExpiry(event?:any) {
  const permit = event ? event: this.challanForm.value.permitDate;
  this.isPermitExpired = this.checkDateExpiry(permit);
}

checkInsuranceExpiry(event?:any) {
  const insurance =  event ? event: this.challanForm.value.insuranceDate;
  this.isInsuranceExpired = this.checkDateExpiry(insurance);
}

checkFitnessExpiry(event?:any) {
  const fitness =  event ? event: this.challanForm.value.fitnessDate;
  this.isFitnessExpired = this.checkDateExpiry(fitness);
}

checkLicenseExpiry(event?:any) {
  const license =  event ? event: this.challanForm.value.driver1LicenceValDate;
  this.isLicenseExpired = this.checkDateExpiry(license);
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
    this.getTDSDetailsFromVendor(event.vendor_Code);
    this.getVehicleFromVendorList(event.vendor_Code);
    if (this.challanForm.value.vendorType === '04') {
        this.avalabledocketinPRS(event.vendor_Code);
    }
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

getTDSDetailsFromVendor(vendorCode:string){
  const payload={
    venderCode:vendorCode
  }
  this.THCService.getTDSDetailsFromVendor(payload).subscribe({
      next: (response: any) => {
        if (response && response.data) {
        this.challanForm.patchValue({
          TDSAcccode:response.data.acccode,
          TDSPercent:response.data.tdsPercentage,
          isTDSEnabled:response.data.isTDSApplicable
        })
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
            fitnessDate: response.data.fitnessValDt ? new Date(response.data.fitnessValDt) : null,
            openKM:response.data.startKM
          });
          this.vehicleTypeList = [{
            codeId: response.data.vehicle_Type,
            codeDesc: response.data.type_Name
          }];
          this.getVehicleCapacity(response.data.vehicle_Type)
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
}

getDAList(){
  this.THCService.getDAList("7").subscribe({
      next: (response: any) => {
        if (response) {
          this.deliverAgentData=response.data;
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
}

avalabledocketinPRS(event?:any){
  if(this.challanForm.value.vendorType!=='04' && event){
      return;
  }
  const payload={
    fromdt: "12 Aug 2025",
    todt: "10 Oct 2025",
    dttyp: "1",
    paybas: "ALL",
    trn: "ALL",
    bustyp: "ALL",
    status: this.challanForm.value.vendorType==='04' ?'B':'P',
    doctyp: "PRS",
    baseLocationCode:this.docketService.loginUserList.LocationCode,
    docketList: "",
    alloted_To:this.challanForm.value.vendorType==='04'? this.challanForm.value.vendorCode:'',
    loadingBy: "XX9",
    chrgType: "",
    odaType: "",
    baseCompanyCode:this.docketService.loginUserList.Companycode,
    flag: 2
  }
  // this.THCService.avalabledocketinPRS(payload).subscribe({
  //     next: (response: any) => {
  //       if (response && response.data) {
  //         this.patchAvailableDockets(response.data);
  //       }
    this.THCService.avalabledocketinPRS(payload).subscribe({
    next: (response: any) => {
      if (response && response.data && Array.isArray(response.data)) {
        const updatedData = response.data;
        const docketArray = this.avalabledocket;

        if (docketArray && docketArray.length > 0) {
          // ✅ Update contractAmount only for matching rows
          updatedData.forEach((item: any) => {
            const match = docketArray.controls.find(
              (ctrl: any) => ctrl.value.dockno === item.dockno
            );
            if (match) {
              match.get('contractAmount')?.setValue(item.contractAmount);
              match.get('tDSOnAmount')?.setValue(item.contractAmount);
            }
          });
        } else {
          // If first time load → create FormArray
          this.patchAvailableDockets(updatedData);
        }

        // 🔁 Recalculate total in case contractAmount values changed
        this.updateTotalDockets();
      }
      },error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
}

getDAMobileNo(event:any){
  const paylaod={
    agentCode:event.userId
  }
  this.THCService.getDeliveryAgentMobileNo(paylaod).subscribe({
      next: (response: any) => {
        if (response) {
         this.challanForm.patchValue({
          deliveryAgentMoNo:response.data.mobileNo
         })
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
}

onSubmit(){
  if(this.challanForm.valid){

  }else{
    this.challanForm.markAllAsTouched();
  }
}

}
