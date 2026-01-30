import { Component} from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { DestinationsList, generalMasterResponse, billingPartyResponse, VehicleNumbersResponse, StatesFromPartyCodeRepsonse } from '../../../shared/models/general-master.model';
import { cityResponse } from '../../../shared/models/general-master.model';
import { GeneralMasterService } from '../../../shared/services/general-master.service';
import { Validators } from '@angular/forms';
import { EmailRegex, mobileNo } from '../../../shared/constants/common';
import { CommonDateService } from '../../../shared/services/common-date.service';

@Component({
  selector: 'basic-details',
  standalone: false,
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent {
  public billingTypeData: generalMasterResponse[] = [];
  public isLocalNoteReadOnly = false;
  public billingPartyData: billingPartyResponse[] = [];
  public cityList: cityResponse[] = [];
  public fromCityList: cityResponse[] = [];
  public toCityList: cityResponse[] = [];
  public destinationsList: DestinationsList[] = [];
  public vehicleNumbersList: VehicleNumbersResponse[] = [];
  public getStatesFromPartyCodeList: StatesFromPartyCodeRepsonse[] = [];
  minDate: Date | undefined;
  maxDate: Date | undefined;
  appoinmentDate:Date|undefined;
  public referenceDocketMsg:any;
  public notFoundTextValue = 'Please enter at least 3 characters';
  public notDestinationValue = 'Please enter at least 3 characters';
  public notFromCityValue = 'Please enter at least 1 characters';
  public notToCityValue = 'Please enter at least 1 characters';
  public notVehicleNoValue = 'Please enter at least 1 characters';

  constructor(
    public docketService: DocketService,
    private basicDetailService: BasicDetailService, public generalMasterService: GeneralMasterService,
    public commonDateService:CommonDateService) { }

  ngOnInit() {
    this.appoinmentDate = new Date();
    this.appoinmentDate.setMonth(this.appoinmentDate.getMonth() + 1);
   
    this.docketService.detailForm();
    this.getBillingTypeData();
    this.docketService.getRuleDetailForChargeRule();

    this.docketService?.basicDetailForm?.get('destination')?.valueChanges.subscribe(() => {
      this.toggleLocalNote();
    });
    this.docketService?.basicDetailForm?.get('origin')?.valueChanges.subscribe(() => {
      this.toggleLocalNote();
    });
    this.toggleLocalNote();
    this.getStatesFromPartyCode();

    this.docketService.basicDetailForm.get('originState')?.valueChanges.subscribe((selectedValue: string) => {
    if (selectedValue) {
      const selectedObj = this.getStatesFromPartyCodeList.find(x => x.text === selectedValue);
      if (selectedObj) {
        this.docketService.basicDetailForm.get('custGSTState')?.setValue(selectedObj.value);
      }
    } else {
      this.docketService.basicDetailForm.get('custGSTState')?.setValue('');
    }
  });
    this.docketService.basicDetailForm.get('destinationState')?.valueChanges.subscribe((selectedValue: string) => {   
    if (selectedValue) {
      const selectedObj = this.getStatesFromPartyCodeList.find(x => x.text === selectedValue);
      if (selectedObj) {
        this.docketService.basicDetailForm.get('csgeCustGSTState')?.setValue(selectedObj.value);
      }
    } else {
      this.docketService.basicDetailForm.get('csgeCustGSTState')?.setValue('');
    }
  });
     this.onApplyDeliveryChangeValidators();
    this.docketService?.basicDetailForm?.get('serviceType')?.valueChanges.subscribe(() => {
      this.applyTypeMovementValidation();
      this.applyVehicleNoValidation();
    });
    this.docketService.basicDetailForm.get('vehicleType')?.valueChanges.subscribe(() => {
      this.applyVehicleNoValidation();
    });       

  // Run validation whenever appointmentDT changes
  this.docketService.basicDetailForm?.get('appointmentDT')?.valueChanges.subscribe(() => {
    this.docketService.validateAppointmentDate();
  });

    this.dateAccess();
    const exemptCtrl = this.docketService.basicDetailForm.get('exemptServices');
  const gstCtrl = this.docketService.basicDetailForm.get('GSTDeclaration');
 
  exemptCtrl?.valueChanges.subscribe(value => {
    if (value) {
      gstCtrl?.setValidators([Validators.required]);
    } else {
      gstCtrl?.clearValidators();
      gstCtrl?.reset(); // optional – file clear karva mate
    }
    gstCtrl?.updateValueAndValidity();
  });

  }

    callEwayBillFromParent(event: any) {
      this.docketService.ewayBill$.next(event);
    }

    onApplyDeliveryChangeValidators(){
     this.docketService.basicDetailForm.get('isAppointmentDelivery')?.valueChanges.subscribe((isAppointment) => {
    if (isAppointment) {
      this.docketService.basicDetailForm.get('appointmentDT')?.setValidators([Validators.required]);
      this.docketService.basicDetailForm.get('personName')?.setValidators([Validators.required]);
      this.docketService.basicDetailForm.get('contactNo')?.setValidators([Validators.required, Validators.pattern(mobileNo)]);
      this.docketService.basicDetailForm.get('remarks')?.setValidators([Validators.required]);
    } else {
      this.docketService.basicDetailForm.get('appointmentDT')?.clearValidators();
      this.docketService.basicDetailForm.get('personName')?.clearValidators();
      this.docketService.basicDetailForm.get('contactNo')?.clearValidators();
      this.docketService.basicDetailForm.get('remarks')?.clearValidators();
    }
    // update validity after setting/clearing validators
    this.docketService.basicDetailForm.get('appointmentDT')?.updateValueAndValidity();
    this.docketService.basicDetailForm.get('personName')?.updateValueAndValidity();
    this.docketService.basicDetailForm.get('contactNo')?.updateValueAndValidity();
    this.docketService.basicDetailForm.get('remarks')?.updateValueAndValidity();
  });
  }

onApplyReferenceDktChangeValidators() {
  const isReferenceCtrl = this.docketService.basicDetailForm.get('isreferenceDKT');
  const refDocketCtrl = this.docketService.basicDetailForm.get('referenceDocket');

  if (!isReferenceCtrl || !refDocketCtrl) return;

  // 1. Apply once at init (so it works first time)
  if (isReferenceCtrl.value) {
    refDocketCtrl.setValidators([Validators.required]);
  } else {
    refDocketCtrl.clearValidators();
    refDocketCtrl.setValue(null);
  }
  refDocketCtrl.updateValueAndValidity();
   const freightCharges = this.docketService.freightForm.get('freightCharges');
    const freightRate = this.docketService.freightForm.get('freightRate');
    if (this.docketService.basicDetailForm.value.isreferenceDKT === true) {
      freightCharges?.clearValidators();
      freightRate?.clearValidators();
    } else {
      // ✅ Required lagavo
      freightCharges?.setValidators([Validators.required, Validators.min(0.01)]);
      freightRate?.setValidators([Validators.required, Validators.min(0.01)]);
    }
    freightCharges?.updateValueAndValidity();
    freightRate?.updateValueAndValidity();

  // 2. Subscribe to changes for future updates
  isReferenceCtrl.valueChanges.subscribe((isReference) => {
    if (isReference) {
      refDocketCtrl.setValidators([Validators.required]);
    } else {
      refDocketCtrl.clearValidators();
      refDocketCtrl.setValue(null);
    }
    refDocketCtrl.updateValueAndValidity();
  });

  this.docketService.freightAndOtherChar()
}

applyTypeMovementValidation() {
  const control = this.docketService.basicDetailForm.get('typeMovement');

  if (this.docketService?.basicDetailForm?.get('serviceType')?.value === '2') {
    control?.setValidators([Validators.required]);
  } else {
    control?.clearValidators();
    control?.setErrors(null); // 👈 clear old error if any
  }

  control?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
}

applyVehicleNoValidation(){
  const serviceType = this.docketService.basicDetailForm.get('serviceType')?.value;
  const vehicleType = this.docketService.basicDetailForm.get('vehicleType')?.value;
  const control = this.docketService.basicDetailForm.get('vehicleno');

  if (serviceType === '2' && vehicleType === 'own') {   // 👈 condition tame change kari shako
    control?.setValidators([Validators.required]);
  } else {
    control?.clearValidators();
    control?.setErrors(null);
  }

  control?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
}

  getBillingTypeData() {
    this.basicDetailService.getGeneralMasterList('PAYTYP', null, null).subscribe({
      next: (response) => {
        if (response.success) {
          this.billingTypeData = response.data;
        }
      }
    });
  }

  dateAccess() {
  const payload = {
    moduleCode: '01',
    baseUserName: this.docketService.baseUsername
  };

  this.commonDateService.userDateSelection(payload).subscribe({
    next: (res: any) => {
      if (res && res.length > 0) {
        const rule = res[0];

        // API min_Date
        this.minDate = new Date(rule.min_Date);

        // BackDate days logic
        if (rule.backDate_Days && rule.backDate_Days > 0) {
          const today = new Date();
          this.minDate = new Date(today.setDate(today.getDate() - rule.backDate_Days));
        }

        // Max date = today
        this.maxDate = new Date();
      }
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

    this.basicDetailService.getCityData(locCode, searchText).subscribe({
      next: (response) => {
        if (response.success) {
          if (type === 'from') {
            this.fromCityList = response.data;
            this.notFromCityValue = 'No matches found';
          } else {
            this.toCityList = response.data;
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

  onResetToCity(){
    this.docketService.basicDetailForm.patchValue({
      toCity:null
    })
  }

  getDestinationsList(event?: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 3) {
      this.destinationsList = [];
      this.notDestinationValue = 'Please enter at least 3 characters';
      return;
    }
    this.notDestinationValue = 'Searching...';
    this.basicDetailService.getGCDestinations(searchText).subscribe({
      next: (response) => {
        if (response) {
          this.destinationsList = response;
          this.notDestinationValue = 'No matches found';
        } else {
          this.destinationsList = [];
          this.notDestinationValue = '';
        }
      },
      error: () => {
        this.destinationsList = [];
        this.notDestinationValue = '';
      }
    });
  }

  resetDestinationDropdown() {
    this.destinationsList = [];
    this.notDestinationValue = 'Please enter at least 3 characters';
  }
  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker?.();
  }

  getBillingPartyData(event: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 3) {
      this.billingPartyData = [];
      this.notFoundTextValue = 'Enter at least 3 characters';
      return;
    }
    const payload = {
      searchTerm: searchText,
      paybs: this.docketService.basicDetailForm.get('billingType')?.value ? this.docketService.basicDetailForm.get('billingType')?.value : 'P01',
      location: this.docketService.Location
    }
    this.notFoundTextValue = 'Searching...';
    this.basicDetailService.getBillingParty(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.billingPartyData = response.data;
          this.notFoundTextValue = 'No matches found';
        } else {
          this.billingPartyData = [];
          this.notFoundTextValue = ''
        }
      },
      error: () => {
        this.billingPartyData = [];
        this.notFoundTextValue = ''
      }
    });
  }

  resetBillingPartyDropdown() {
    // Clear list when dropdown opens again
    this.billingPartyData = [];
    this.notFoundTextValue = 'Enter at least 3 characters';
  }

  getVehicleNumbersList(event?: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.vehicleNumbersList = [];
      this.notVehicleNoValue='Please enter at least 1 characters';
      return;
    }
    this.notVehicleNoValue = 'Searching...';
    this.basicDetailService.getGetVehicleNumbers(searchText).subscribe({
      next: (response) => {
        if (response) {
          this.vehicleNumbersList = response;
           this.notVehicleNoValue = 'No matches found';
        } else {
          this.vehicleNumbersList = [];
          this.notVehicleNoValue = '';
        }
      },
      error: () => {
        this.vehicleNumbersList = [];
         this.notVehicleNoValue = '';
      }
    });
  }

  onChangeBillingParty(event: any) {
    this.docketService.basicDetailForm.patchValue({
      billingParty: event.custcd,
      billingName: event.custnm
    });
    if (this.docketService.loginUserList.Type === '2') {
      if (this.docketService.completiondata && this.docketService.completiondata.listCharges?.length) {
        this.docketService.completiondata.listCharges = [];
      }
      this.docketService.freightchargingData?.forEach((item: any) => {
        const code = item.chargeCode;
        if (this.docketService.freightForm.contains(code)) {
          this.docketService.freightForm.get(code)?.patchValue(0, { emitEvent: false });
        }
      });
    }
  }

  onChangedestinationsList(event: any) {
    this.docketService.basicDetailForm.patchValue({
      destination: event.locCode,
      toCity:null
    });
    this.destinationsList = [];
  }

  toggleLocalNote() {
    const destination = this.docketService?.basicDetailForm?.get('destination')?.value?.locCode ?? this.docketService?.basicDetailForm?.get('destination')?.value;
    const origin = this.docketService?.basicDetailForm?.get('origin')?.value;
    const localNoteControl = this.docketService?.basicDetailForm?.get('isLocalNote');
    if (destination && origin && destination === origin) {
      localNoteControl?.setValue(true); 
      this.docketService?.basicDetailForm?.get('IsLocalDocket')?.setValue(true); 
    } else {
      localNoteControl?.setValue(false);
      this.docketService?.basicDetailForm?.get('IsLocalDocket')?.setValue(false); 
    }
  }


onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    const file = input.files[0];
    this.docketService.selectedFile = file;
    this.docketService.basicDetailForm.get('GSTDeclaration')?.setValue(file);
    this.docketService.isChangingFile = false;
     this.docketService.isExistingFile = false;
  }
}

viewFile() {
    const value = this.docketService.basicDetailForm.get('GSTDeclaration')?.value;
    let url = '';
    if (value instanceof File) {
      url = URL.createObjectURL(value); // for new file
    } else if (typeof value === 'string') {
      url = value; // for existing file URL
    }
    if (url) {
      window.open(url, '_blank');
    }
  }
  // Trigger change to show file input
  changeFile() {
    this.docketService.isChangingFile = true;
    this.docketService.isExistingFile = false;
    this.docketService.basicDetailForm.get('GSTDeclaration')?.setValue(null);
  }

  onChangeCityListList(event: any, type: any) {
    if (type === 'from') {
       this.docketService.consignorForm.patchValue({
        consignorCity: event
      });
      // this.docketService.basicDetailForm.patchValue({
      //   fromCity: event + ':' + event,
      // });
      const payload = {
        locCode: event,
        baseUserCode: this.docketService.BaseUserCode,
        baseLocation: this.docketService.Location,
        baseCompany:this.docketService.loginUserList.Companycode,
        baseFinYear: this.docketService.loginUserList.FinYear
      }
      this.basicDetailService.fromOperation(payload).subscribe({
        next: (response: any) => {
          if (response) {
            this.docketService.basicDetailForm.patchValue({
              originState: response.stnm,
              csgngstState: response.statePrefix,
              origin_Area: response.origin_Area
            });
            this.docketService.freightForm.patchValue({
              billedAt: response.statePrefix,
            })
          }
        }
      });

    } else if (type === 'to') {
      // this.docketService.basicDetailForm.patchValue({
      //   toCity: event + ':' + event,
      // });
      this.docketService.consignorForm.patchValue({
        consigneeCity: event
      });
      this.docketService.GetPincodeOrigin();
      this.toCityList = [];
      this.notToCityValue = 'Please enter at least 1 characters';
    }
    this.cityList = [];
  }

  onChangeVehicleNo(event: any) {
    this.docketService.basicDetailForm.patchValue({
      vehicleno: event + ':' + event,
    });
    this.vehicleNumbersList = [];
  }

  onChangeBillingType(event: any) {
    const type = this.docketService.loginUserList.Type;
    const billingType = this.docketService.basicDetailForm.value.billingType;

    if(billingType === 'P02'){
      this.docketService.basicDetailForm.patchValue({
        exemptServices:null
      })
    }

    if (type === '2') {
      this.docketService.isOtherCharge = true;
      this.docketService.isBillingTBB = true;
    } else {
      // Type ≠ 2
      if (billingType === 'P01' || billingType === 'P03') {
        this.docketService.isOtherCharge = true;   // SCHG03
        this.docketService.isBillingTBB = false;
      } else {
        // P02 / P04
        this.docketService.isOtherCharge = false;
        this.docketService.isBillingTBB = false;
      }
    }

    const freightCharges = this.docketService.freightForm.get('freightCharges');
    const freightRate = this.docketService.freightForm.get('freightRate');
    if (event?.codeId === 'P04') {
      freightCharges?.clearValidators();
      freightRate?.clearValidators();
    } else {
      // ✅ Required lagavo
      freightCharges?.setValidators([Validators.required, Validators.min(0.01)]);
      freightRate?.setValidators([Validators.required, Validators.min(0.01)]);
    }
    freightCharges?.updateValueAndValidity();
    freightRate?.updateValueAndValidity();
    
// consignorEmail Validators
   const emailControl = this.docketService.consignorForm.get('consignorEmail');
    if (event?.codeId === 'P01') {
      emailControl?.setValidators([
        Validators.required,
        Validators.pattern(EmailRegex),
        Validators.pattern(/^(?!.*@scorpiongroup\.in$).*/i)
      ]);
    } else {
      emailControl?.setValidators([
        Validators.pattern(EmailRegex),
        Validators.pattern(/^(?!.*@scorpiongroup\.in$).*/i)
      ]);
    }
    emailControl?.updateValueAndValidity();

    this.docketService.basicDetailForm.patchValue({
      billingParty: null,
      billingName: null
    })
    this.docketService.getRuleDetailForDepth();
    this.docketService.getRuleDetailForProceed()
  }

  CheckDocketValid(event:any) {
    const payload = {
      docketNo: event.target.value,
      locCode: this.docketService.Location,
      userId: this.docketService.BaseUserCode,
      type: "",
      companyCode: this.docketService.loginUserList.Companycode
    }
    this.basicDetailService.docketValidation(payload).subscribe({
      next: (response: any) => {
        if (response.codeDesc) {
        this.docketService.inValidDocketMsg=response.codeDesc;
        }else{
          this.docketService.inValidDocketMsg = '';
        }
      }
    });
  }
  onExemptServicesChange(event: any) {
  if (event === null || event === undefined) {
    return; 
  }
  this.docketService.GetDKTGSTForGTA();
  setTimeout(() => {
    this.docketService.getGSTCalculation();
  }, 300);
}

   ReferenceDocket(event:any) {
    const payload = {
      docketNo: event.target.value,
    }
    this.basicDetailService.referenceDocket(payload).subscribe({
      next: (response: any) => {
        if (response?.cnt === 0) {
          this.referenceDocketMsg = "Please Enter valid docket no";
          this.docketService.basicDetailForm.get('referenceDocket')?.setErrors({ invalid: true });
        } else {
          this.referenceDocketMsg = "";
          this.docketService.basicDetailForm.get('referenceDocket')?.setErrors(null);
        }
      }
    });
  }

    getStatesFromPartyCode() {
    this.basicDetailService.getStatesFromPartyCode(8888).subscribe({
      next: (response: any) => {
        if (response) {
          this.getStatesFromPartyCodeList=response;
        }
      }
    });
  }
}
