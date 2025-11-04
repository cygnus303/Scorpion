import {Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray} from '@angular/forms';
import { generalMasterResponse, StatesFromPartyCodeRepsonse } from 'app/shared/models/general-master.model';
import { AirportListResponse, AllCityByLocationResponse, CustomerListResponse, DeliveryZoneResponse, FlightsListResponse, VehicleTypeListResponse } from 'app/shared/models/thc-master.model';
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
public vehicleTypeList:VehicleTypeListResponse[]=[];
public routeNameList:StatesFromPartyCodeRepsonse[]=[];
public fromCityList: AllCityByLocationResponse[] = [];
public toCityList: AllCityByLocationResponse[] = [];
public airportList:AirportListResponse[]=[];
public airlineList:generalMasterResponse[]=[];
public flightsList:FlightsListResponse[]=[];
public customerList:CustomerListResponse[]=[];
public notFromCityValue = 'Please enter at least 1 characters';
public notCustomerListValue = 'Please enter at least 1 characters';
public notToCityValue = 'Please enter at least 1 characters';
public previewUrl: string | ArrayBuffer | null = null;
public contractAmtMsg:string='';
public contractExpiredMsg:string='';
public deliveryZoneData:DeliveryZoneResponse[]=[];

@ViewChild('fileInput') fileInput!: ElementRef;
constructor(
  public challanService:ChallanService,
  public docketService:DocketService,
  public basicDetailService:BasicDetailService,
  public sweetAlertService:SweetAlertService,
  private deliveryAgentService:DeliveryAgentService,
  public THCService:THCMasterService,
){}
 ngOnInit(){
    this.challanService.buildForm();
    this.challanService.getChargesDetails();
    this.challanService.getVendtyData();
    if(this.docketService.loginUserList.Type !== '1'){
      this.challanService.getCityList();
      this.avalabledocketinPRS()
    }
    this.docketService.getTypeofMovementData();
    this.challanService.getRouteMode();
    this.challanService.getDepartmentReason();
    this.challanService.getTDSLedgerList();
    this.challanService.getLocationData();
    this.getDAList();
    this.challanService.getRateTypeData()
    const type = this.docketService.loginUserList.Type;
    this.typeName = type === '3' ? 'DRS' :
                    type === '1' ? 'THC' :
                    type === '2' ? 'PRS' : '';
    this.challanService.challanForm.get('isEmpty')?.valueChanges.subscribe((isEmpty: boolean) => {
    if (isEmpty) {
      this.challanService.challanForm.patchValue({
        customerName: null,
        routeCode: null
      });
    }
  });

  if(this.docketService.loginUserList.Type==='3'){
    this.getDeliveryZoneData()
  }
  }

// calculateNetAmount() {
//   const contractAmount = Number(this.challanService.challanForm.get('contractAmount')?.value) || 0;
//   const telephoneCharges = Number(this.challanService.challanForm.get('telephoneCharges')?.value) || 0;
//   const humaliCharges = Number(this.challanService.challanForm.get('humaliCharges')?.value) || 0;
//   const mamulCharges = Number(this.challanService.challanForm.get('mamulCharges')?.value) || 0;
  
//   const netAmount = contractAmount + telephoneCharges + humaliCharges - mamulCharges;
  
//   const staxOnAmount = parseFloat(this.challanService.challanForm.get('tDSOnAmount')?.value || 0);
//   const isTDSEnabled = this.challanService.challanForm.get('isTDSEnabled')?.value;
//   const tdsRate = parseFloat(this.challanService.challanForm.get('TDSPercent')?.value || 0);
//   let tdsAmount = 0;
  
//   if (isTDSEnabled) {
//     tdsAmount = this.rounditn((staxOnAmount * tdsRate) / 100, 0);
//   }
  
//   this.challanService.challanForm.patchValue({
//     totalTDSAmount: tdsAmount.toFixed(2),
//     netAmount: (netAmount - tdsAmount).toFixed(2),
//   });
  
//   if(this.challanService.challanForm.value.vendorType === 'XX1'|| this.challanService.challanForm.value.vendorType ==='04'|| this.challanService.challanForm.value.vendorType ==='19'|| this.challanService.challanForm.value.vendorType ==='XX'){
//     this.challanService.challanForm.patchValue({
//       balanceAmount:(netAmount - tdsAmount).toFixed(2)
//     })
//   }
// }

calculateBalanceAmount() {
  const netAmount = Number(this.challanService.challanForm.get('netAmount')?.value) || 0;
  const advanceAmount = Number(this.challanService.challanForm.get('advanceAmount')?.value) || 0;
  const balanceAmount = netAmount - advanceAmount;
  this.challanService.challanForm.patchValue({ balanceAmount });
}

changeAmountApplicable(event:any){
  this.challanService.challanForm.patchValue({
       tDSOnAmount:event.target.value
  });

  // this.challanService.calculateNetAmount();
  // this.calculateSubTotal()
}

// calculateSubTotal() {
//   const form = this.challanService.challanForm;

//   let contractAmount = parseFloat(form.get('contractAmount')?.value || 0);
//   let totalCharges = 0;

//   // // Assuming challanCharges is a FormArray of charge controls
//   // const chargesArray = form.get('charges')?.value || [];
//   // chargesArray.forEach((charge: any) => {
//   //   const amount = parseFloat(charge.chargeAmount || 0);
//   //   const operator = charge.operator || '+';
//   //   totalCharges += operator === '+' ? amount : -amount;
//   // });
//    const telephoneCharges = Number(this.challanService.challanForm.get('telephoneCharges')?.value) || 0;
//   const humaliCharges = Number(this.challanService.challanForm.get('humaliCharges')?.value) || 0;
//   const mamulCharges = Number(this.challanService.challanForm.get('mamulCharges')?.value) || 0;

//   const netAmount = contractAmount + telephoneCharges + humaliCharges - mamulCharges;

//   let advanceAmount = parseFloat(form.get('advanceAmount')?.value || 0);
//   let freight = netAmount ;

//   const staxOnAmount = parseFloat(form.get('tdsOnAmount')?.value || 0);
//   const isTDSEnabled = form.get('isTDSEnabled')?.value;
//   const tdsRate = parseFloat(form.get('tdsPercent')?.value || 0);
//   let tdsAmount = 0;

//   if (isTDSEnabled) {
//     tdsAmount = this.rounditn((staxOnAmount * tdsRate) / 100, 0);
//   }

//   form.patchValue({
//     totalTDSAmount: tdsAmount.toFixed(2),
//     netAmount: (netAmount + contractAmount - tdsAmount).toFixed(2),
//   });

//   if (freight >= advanceAmount) {
//     const balanceAmount = freight - advanceAmount - tdsAmount;
//     form.patchValue({
//       balanceAmount: balanceAmount.toFixed(2),
//     });
//   } else {
//     console.warn('Advance amount cannot exceed Net Amount');
//   }
// }

// Helper method
// rounditn(value: number, digits: number): number {
//   const multiplier = Math.pow(10, digits);
//   return Math.round(value * multiplier) / multiplier;
// }

onDocketSelectionChange(ctrl: AbstractControl) {
  this.updateTotalDockets();

  // only call API if checked
  if (ctrl.get('isSelected')?.value) {
    this.getContractDetail(ctrl);
      this.checkArrivalTime(ctrl);
  }
}

checkArrivalTime(ctrl: AbstractControl) {
  const docket = ctrl.value;
    if (this.docketService.loginUserList.Type === '3') {

      const arrivalDateText = docket.Arrival_Date; 
      const reasonValue = docket.subreasoncode; 
      if (!arrivalDateText) {
        console.log("1 - No arrival date, allow check");
        return;
      }
      const arrivalDate = new Date(arrivalDateText);
      const currentDate = new Date();
      const diffHours = (currentDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60);

      if (diffHours > 48) {
        if (!reasonValue || reasonValue.trim() === '') {
          this.sweetAlertService.info("Arrival time is more than 48 hours ahead. Please add reason.");
          ctrl.get('isSelected')?.setValue(false, { emitEvent: false });
          return;
        }
      }
  }
}


updateTotalDockets() {
  const docketArray = this.challanService.challanForm.get('avalabledocketinPRS') as FormArray;
  if (!docketArray) return;

  let totalAmount = 0;
  let selectedCount = 0;
  let totalWeight=0;
  docketArray.controls.forEach(control => {
     const hasMessage = !!(control.get('Message')?.value || control.value?.Message);
    const isSelected = !!control.get('isSelected')?.value;
    if (!hasMessage && isSelected) {
      selectedCount++;
      totalAmount += Number(control.get('ContractAmount')?.value) || 0;
      totalWeight += Number(control.get('ArrWeightQty')?.value) || 0;
    }
  });

  // update other related values
  this.challanService.updateTotalLoadingCharge();

  // patch both values into the form
  this.challanService.challanForm.patchValue({
    contractAmount: totalAmount,
    totalDockets: selectedCount,
    tDSOnAmount:totalAmount,
    wtLoaded:totalWeight
  });
  this.challanService.calculateNetAmount();
}

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const docketArray = this.challanService.challanForm.get('avalabledocketinPRS') as FormArray;

    docketArray.controls.forEach(control => {
      control.get('isSelected')?.setValue(checked, { emitEvent: false });
    });

    this.updateTotalDockets();
  }

getContractDetail(ctrl?: AbstractControl) {
  const docket = ctrl?.value;

  const payload = {
    thctype: this.docketService.loginUserList.Type,
    totalWeight: Number(this.challanService.challanForm.value.wtLoaded),
    weightAdjust: 0,
    isAllowAdhoc: false,
    isAdhoc: false,
    isAllowTAM: false,
    vendorCode: this.challanService.challanForm.value.vendorCode,
    routeCode: this.challanService.challanForm.value.routeCode || '',
    routeMODE: this.challanService.challanForm.value.routeType || '',
    ftL_Type: this.challanService.challanForm.value.fTLType || '',
    vehicle: this.challanService.challanForm.value.vehicleNO || '',
    from_City: this.challanService.challanForm.value.from_City || '',
    to_City: this.challanService.challanForm.value.to_City || '',
    paybas: docket?.PayBas ? docket?.PayBas :this.challanService.avalabledocket.controls[0]?.value.PayBas || '',
    dockno:  docket?.DOCKNO ?  docket?.DOCKNO: this.challanService.avalabledocket.controls[0]?.value.DOCKNO  || '',
  };
  if (payload.vendorCode !== "" && payload.vendorCode !== null && (payload.paybas === undefined || payload.paybas === "" || (this.docketService.loginUserList.Type === "2" && this.challanService.challanForm.value.vendorType === '04'))) {
    this.THCService.getContractData(payload).subscribe({
      next: (response: any) => {
        if (response && response.data) {
        this.handleContractResponse(response)
        this.challanService.challanForm.patchValue({
          contractAmount:response.data.contractAmount,
          standardContractAmount:response.data.standardContractAmount
        })
        }
      },
      error: (err) => {
        console.error('Error fetching contract details:', err.error.message);
      }
    });
  }
}

handleContractResponse(response: any) {
  const THCTYPE = this.docketService.loginUserList.Type?.toString(); // '1' | '2' | '3'
  const vendorType = this.challanService.challanForm.value.vendorType;
  const data = response?.data || {};
  const contractID = (data.contractID ?? '').toString();
  const contractExpire = !!data.contractExpire;
  this.contractAmtMsg = '';
  const contractControl = this.challanService.challanForm.get('contractAmount');
  if (contractControl) {
    contractControl.setErrors(null);
    contractControl.markAsUntouched();
  }

  if ((THCTYPE === '3' && vendorType === '04') || (THCTYPE === '1' && vendorType === 'XX1')) {
    this.contractAmtMsg = '';
  }
  else if (!contractExpire && contractID !== '' && THCTYPE === '2') {
    this.contractAmtMsg = '';
  }
  else if (contractID === '' &&
           ( ((THCTYPE === '3' || THCTYPE === '2') && vendorType === '04') ||
             (THCTYPE === '1' && vendorType === 'XX1') )
  ) {
    this.contractAmtMsg = 'Vendor Contract not found';

    if (contractControl) {
      contractControl.setErrors({ vendorContract: true });
      contractControl.markAsTouched();
    }
  }
  else {
    this.contractAmtMsg = 'Vendor Contract has Expired.';

    if (contractControl) {
      contractControl.setErrors({ vendorExpired: true });
      contractControl.markAsTouched();
    }
  }

  // optional: debug
  console.log('contractID, contractExpire, THCTYPE, vendorType ->', contractID, contractExpire, THCTYPE, vendorType);
  console.log('contractControl errors:', contractControl?.errors);
}

  get isAllSelected(): boolean {
    const validRows = this.challanService.avalabledocket.controls.filter((c: any) => !c.value.Message);
    return (
      validRows.length > 0 &&
      validRows.every((c: any) => c.get('isSelected').value)
    );
  }

onDigitChange(digit: number) {
  this.selectedDigit = digit;
  this.challanService.challanForm.get('mKTVehicleNo')?.reset('');
}


validateVehicleNo() {
  const control = this.challanService.challanForm.get('mKTVehicleNo');
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
  this.challanService.challanForm.patchValue({vendorCode:null})
}

  getVehicleDetail(vehicleNo:string) {
    const params = {
      vehNo: vehicleNo.toUpperCase(),
      baseUserName: this.docketService.loginUserList.BaseUserName
    };
    this.deliveryAgentService.getVehicleDetail(params).subscribe({
      next: (response: any) => {
        if (response) {
          this.challanService.challanForm.patchValue({
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
     const dob = this.challanService.challanForm.value.d1_DOB;
     const licenseNo = event ? event.target.value?.trim() : this.challanService.challanForm.value.driver1Licence?.trim();
     const licenseControl = this.challanService.challanForm.get('driver1Licence');
      if (!licenseControl || licenseControl.invalid || !dob) {
      licenseControl?.markAsTouched();
      this.challanService.challanForm.get('d1_DOB')?.markAsTouched();
      return;
    }
    const params = {
      dlnumber: licenseNo.toUpperCase(),
      dob: this.challanService.challanForm.value.d1_DOB ? this.challanService.challanForm.value.d1_DOB.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      baseUserName: this.docketService.loginUserList.BaseUserName
    };
    this.deliveryAgentService.getLicenceDetail(params).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.challanService.challanForm.patchValue({
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
    // this.THCService.getTripSheet(event.value).subscribe({
    //   next: (response: any) => {
    //     if (response && response.data) {
    //      this.challanService.challanForm.patchValue({
    //       // TDSPercent:response.data.tdsPercentage,
    //      })
    //     }
    //   },
    //   error: (err) => {
    //     this.sweetAlertService.error(err.error.message)
    //   }
    // });
  if(event.value !== 'O'){
  this.getNewVehicleDetail(event.value)
  }else{
     this.challanService.challanForm.patchValue({
      vehicleType :'',
      fTLType :'',
      registrationDate :'',
      eNGINENO :'',
      cHASISNO :'',
      rCBOOKNO :'',
      permitDate :'',
      insuranceDate :'',
      fitnessDate :'',
     });
    //  this.getVehicleType(event.value)
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
       this.challanService.challanForm.patchValue({
        vehicleCapacity:response.data.capacity,
        // TDSAcccode:response.data.acccode
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
  const permit = event ? event: this.challanService.challanForm.value.permitDate;
  this.isPermitExpired = this.checkDateExpiry(permit);
}

checkInsuranceExpiry(event?:any) {
  const insurance =  event ? event: this.challanService.challanForm.value.insuranceDate;
  this.isInsuranceExpired = this.checkDateExpiry(insurance);
}

checkFitnessExpiry(event?:any) {
  const fitness =  event ? event: this.challanService.challanForm.value.fitnessDate;
  this.isFitnessExpired = this.checkDateExpiry(fitness);
}

checkLicenseExpiry(event?:any) {
  const license =  event ? event: this.challanService.challanForm.value.driver1LicenceValDate;
  this.isLicenseExpired = this.checkDateExpiry(license);
}


getPANnumberData(event:any){
  this.challanService.challanForm.patchValue({
    vehicleType:null,
    vehicleNO:null
  });
  this.THCService.getPANnumber(event?.vendor_Code).subscribe({
      next: (response: any) => {
        if (response && response.data) {
         this.challanService.challanForm.patchValue({
          lorryOwnerPanNo:response.data[0].panno,
          PANNO:response.data[0].panno
         })
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
    this.getTDSDetailsFromVendor(event.vendor_Code);
    this.getVehicleFromVendorList(event.vendor_Code);
    if(this.challanService.challanForm.value.vendorType==='XX4'||this.challanService.challanForm.value.vendorType==='XX1'){
      this.GetVehicleTypesForChallanFromRouteVendType()
    }else{
      this.getVehicleType(event.vendor_Code)
    }
    if (this.challanService.challanForm.value.vendorType === '04') {
        this.avalabledocketinPRS(event.vendor_Code);
    }
    this.getContractDetail()
}

getVehicleFromVendorList(vendor:string){
  this.THCService.getvehicleDetailFromVendor(this.challanService.challanForm.value.vendorType,vendor).subscribe({
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
        this.challanService.challanForm.patchValue({
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

  getCityList(event?: any, locCode?: any, type?: 'from' | 'to') {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      if (type === 'from') {
        this.fromCityList = [];
        this.notFromCityValue = 'Please enter at least 1 characters';
      } else {
        this.toCityList = [];
        this.notToCityValue = 'Please enter at least 1 characters';
      }
      return;
    }

    this.THCService.getAllCityByLocation(locCode, searchText).subscribe({
      next: (response:any) => {
        if (response) {
          if (type === 'from') {
            this.fromCityList = response;
            this.notFromCityValue = 'No matches found';
          } else {
            this.toCityList = response;
            this.notToCityValue = 'No matches found';
          }
        } else {
          if (type === 'from') {
            this.fromCityList = [];
            this.notFromCityValue = '';
          } else {
            this.toCityList = [];
            this.notToCityValue = '';
          }
        }
      },
      error: () => {
        if (type === 'from') {
          this.fromCityList = [];
          this.notFromCityValue = '';
        } else {
          this.toCityList = [];
          this.notToCityValue = '';
        }
      }
    });
  }

  resetCityDropdown(type: 'from' | 'to') {
    if (type === 'from') {
      this.fromCityList = [];
      this.notFromCityValue = 'Please enter at least 1 characters';
    } else {
      this.toCityList = [];
      this.notToCityValue = 'Please enter at least 1 characters';
    }
  }

getNewVehicleDetail(vehicleNo:string){
    this.THCService.getNewVehicleDetail(vehicleNo.toUpperCase()).subscribe({
      next: (response: any) => {
        if (response) {
           this.challanService.challanForm.patchValue({
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
          // this.vehicleTypeList = [{
          //   typeCode: response.data.vehicle_Type,
          //   type_Name: response.data.type_Name
          // }];
          if(this.challanService.challanForm.value==='XX4'||this.challanService.challanForm.value==='XX1'){
            this.GetVehicleTypesForChallanFromRouteVendType()
          }else{
            this.getVehicleType(vehicleNo)
          }
          this.getVehicleCapacity(response.data.vehicle_Type)
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
}
GetVehicleTypesForChallanFromRouteVendType(){
const payload={
  vehicleNo:this.challanService.challanForm.value.vehicleNO?this.challanService.challanForm.value.vehicleNO:'O',
  routeMode:this.challanService.challanForm.value.routeType?this.challanService.challanForm.value.routeType:'',
  routeName:this.challanService.challanForm.value.routeCode?this.challanService.challanForm.value.routeCode:'',
  vendorType:this.challanService.challanForm.value.vendorType?this.challanService.challanForm.value.vendorType:'',
  vendorCode:this.challanService.challanForm.value.vendorCode?this.challanService.challanForm.value.vendorCode:'',
  thcType:this.docketService.loginUserList.Type,
  baseLocationCode:this.docketService.loginUserList.LocationCode
}
if(this.challanService.challanForm.value.vehicleNO ||this.challanService.challanForm.value.routeType|| this.challanService.challanForm.value.routeCode ||
  this.challanService.challanForm.value.vendorType || this.challanService.challanForm.value.vendorCode){
  this.THCService.getVehicleTypesForChallanFromRouteVendType(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.vehicleTypeList=response.data;
        }
      },
      error: (err) => {
      }
    });
  }
}

getVehicleType(vehicleNo:string){
  this.THCService.getVehicleType(vehicleNo).subscribe({
      next: (response: any) => {
        if (response) {
          this.vehicleTypeList=response.data;
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
  if(this.challanService.challanForm.value.vendorType!=='04' && event){
      return;
  }
  const payload={
    fromdt: "01 Mar 2025",
    todt: "04 Nov 2025",
    dttyp:  '3',
    paybas: "ALL",
    trn: "ALL",
    bustyp: "ALL",
    status: this.challanService.challanForm.value.vendorType === '04' ? 'B' : 'P' ,
    doctyp: this.docketService.loginUserList.Type==='2'?"PRS":"DRS",
    baseLocationCode:this.docketService.loginUserList.LocationCode,
    docketList: "",
    alloted_To:this.challanService.challanForm.value.vendorType==='04'? this.challanService.challanForm.value.vendorCode:'',
    loadingBy: "XX9",
    chrgType: "",
    odaType: "",
    baseCompanyCode:this.docketService.loginUserList.Companycode,
    flag: 2
  }
    this.THCService.avalabledocketinPRS(payload).subscribe({
    next: (response: any) => {
      if (response && response.data && Array.isArray(response.data)) {
        const updatedData = response.data;
        const docketArray = this.challanService.avalabledocket;
        if (docketArray && docketArray.length > 0) {
          updatedData.forEach((item: any) => {
            const match = docketArray.controls.find(
              (ctrl: any) => ctrl.value.DOCKNO === item.dockno
            );
            if (match) {
              match.get('ContractAmount')?.setValue(item.contractAmount);
              match.get('tDSOnAmount')?.setValue(item.contractAmount);
            }
          });
        } else {
          this.challanService.patchAvailableDockets(updatedData);
        }
        this.updateTotalDockets();
      }
      },error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
}

getMFListFromRoute(event:any){
  this.challanService.challanForm.patchValue({
    vendorCode:null,
    routeName:event.text
  })
  const paylaod = {
    location: event.value,
    isBCProcess: "N",
    thcDate: this.challanService.challanForm.value.tHCDate,
    baseCompanyCode: this.docketService.loginUserList.Companycode
  }
  this.THCService.getMFListFromRoute(paylaod).subscribe({
      next: (response: any) => {
        if (response) {
           const formArray = this.challanService.avalableForTHC;
           formArray.clear();
         const list = Array.isArray(response) ? response : (response?.data || []);
         for(let i = 0; i < list.length; i++){
          formArray.push(this.challanService.buildMfGroup(list[i]));
         };
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
    this.getContractDetail()
}

updateTotalManifest(mfNo:string): void {
  const payload = {
    mfNo:mfNo
  }
  this.THCService.getEWayBillExpiryDateByMF(payload).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const result = response.data[0];
          if (result.message) {
            this.sweetAlertService.info(result.message);
          } else if (result.expiryDate) {
            this.sweetAlertService.info( `This Manifest E-Way Bill expired on: ${result.expiryDate}. Please update or verify before continuing!`);
            this.challanService.challanForm.patchValue({eWayBillExpiredDate:new Date(result.expiryDate)})
          }
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
   
    const totals = this.challanService.avalableForTHC.controls.reduce((acc, g) => {
    if (g.get('selected')?.value) {
      acc.totalManifests += 1;
      acc.totalWeight += Number(g.get('toT_LOAD_ACTWT')?.value) || 0;
    }
    return acc; },{ totalManifests: 0, totalWeight: 0 });
  this.challanService.challanForm.patchValue({
      TotalManifest: totals.totalManifests,
      wtLoaded: totals.totalWeight,
    },{ emitEvent: false });
    
    const vehicleCapacity = this.challanService.challanForm.value.vehicleCapacity;
    const weightLoaded = this.challanService.challanForm.value.wtLoaded;
    if (vehicleCapacity && weightLoaded) {
      const utilization = (weightLoaded / (vehicleCapacity * 1000)) * 100;
      const roundedUtilization = Number(utilization.toFixed(2));

      this.challanService.challanForm.patchValue({
        vehicleCapacityUti: roundedUtilization
      });
    } else {
      this.challanService.challanForm.patchValue({
        vehicleCapacityUti: 0
      });
    }
    if(this.challanService.challanForm.value.wtLoaded >  vehicleCapacity){
      this.challanService.challanForm.patchValue({
        isOverLoad:true
      })
    }
  }

getRoutesFromRouteType(event:any){
  this.challanService.challanForm.patchValue({
    routeName:null,
    vendorType:null,
    vendorCode:null,
    routeCode:null
  })
  const paylaod = {
    routeType:event.codeId,
    isEmpty:'N',
    locationCode:this.docketService.loginUserList.LocationCode
  }
  this.THCService.getRoutesFromRouteType(paylaod).subscribe({
      next: (response: any) => {
        if (response) {
          this.routeNameList = response
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
    if(event.codeId === 'S'){
      this.getVehicleType('O')
    }
    if(event.codeId==='A'){
      this.getAirportDetail()
      this.getAirlineList()
    }
}

getDAMobileNo(event:any){
  const paylaod={
    agentCode:event.userId
  }
  this.THCService.getDeliveryAgentMobileNo(paylaod).subscribe({
      next: (response: any) => {
        if(response){
          if(response.data.counts!==0){
            this.sweetAlertService.info(`Please Clear this Agent Previous Assign DRS And MR Collection, Documents :${response.data.docList}!!`);
            this.challanService.challanForm.patchValue({
              deliveryAgent:null,
               deliveryAgentMoNo:null
         })
          }else{
             this.challanService.challanForm.patchValue({
               deliveryAgentMoNo:response.data.mobileNo
         })
          }
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
}

getAirportDetail(){
   this.THCService.getAirport(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.airportList = response.data
         this.challanService.challanForm.patchValue({
          airportCode:response.data[0]?.codeId
         });
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
}

 getAirlineList() {
    this.basicDetailService.getGeneralMasterList('ALN ', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.airlineList = response.data;
        }
      },
    });
  }

  getFlights(){
    const payload = {
      airLine:this.challanService.challanForm.value.airLine,
      airport:this.challanService.challanForm.value.airportCode
    }
    if (!payload.airLine || !payload.airport) { return;}
   this.THCService.getFlights(payload).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.flightsList = response.data
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
}

onChangeVehicleType(event:any){
    this.getVehicleCapacity(event.typeCode);
    this.challanService.challanForm.patchValue({
      fTLType:event.typeCode
    })
}

  getCustomerListForTHC(event?: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
        this.customerList = [];
        this.notCustomerListValue = 'Please enter at least 1 characters';
      return;
    }
    this.THCService.getCustomerListForTHC(searchText).subscribe({
      next: (response:any) => {
        if (response) {
            this.customerList = response;
            this.notCustomerListValue = 'No matches found';
        } else {
            this.customerList = [];
            this.notCustomerListValue = '';
        }
      },
      error: () => {
          this.customerList = [];
          this.notCustomerListValue = '';
      }
    });
  }

  resetCustomerDropdown() {
      this.customerList = [];
      this.notCustomerListValue = 'Please enter at least 1 characters';
  }

  getFlightSchTime(){
    const payload = {
      flightCode:this.challanService.challanForm.value.flightCode,
      airport:this.challanService.challanForm.value.airportCode
    }
    if (!payload.flightCode || !payload.airport) { return;}
   this.THCService.getFlightSchTime(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.challanService.challanForm.patchValue({flightScheduleTime:response?.schTime})
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
}


onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.challanService.selectedFile = file;

    // preview
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(file);

    // assign to form control
    this.challanService.challanForm.patchValue({
      loadingSlipAttachment: file
    });
  }
}

triggerFileInput() {
  if (this.fileInput?.nativeElement) this.fileInput.nativeElement.click();
}

removeAttachment() {
  this.challanService.selectedFile = null;
  this.previewUrl = null;
  this.challanService.challanForm.patchValue({
    loadingSlipAttachment: null
  });
}

getDeliveryZoneData(){
  this.THCService.getDeliveryDetail(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response: any) => {
        if (response) {
          this.deliveryZoneData=response;
        }
      },
      error: (err) => {
      }
    });
}
}
