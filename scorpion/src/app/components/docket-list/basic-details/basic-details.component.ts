import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { DestinationsList, generalMasterResponse, billingPartyResponse, VehicleNumbersResponse, StatesFromPartyCodeRepsonse } from '../../../shared/models/general-master.model';
import { cityResponse } from '../../../shared/models/general-master.model';
import { combineLatest, filter, startWith } from 'rxjs';
import { GeneralMasterService } from '../../../shared/services/general-master.service';
import { Validators } from '@angular/forms';
import { mobileNo } from '../../../shared/constants/common';

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
  public referenceDocketMsg:any;
  public notFoundTextValue = 'Please enter at least 3 characters';
  public notDestinationValue = 'Please enter at least 3 characters';
  public notFromCityValue = 'Please enter at least 1 characters';
  public notToCityValue = 'Please enter at least 1 characters';

  constructor(
    public docketService: DocketService,
    private basicDetailService: BasicDetailService, public generalMasterService: GeneralMasterService) { }

  ngOnInit() {
    this.docketService.detailForm();
    this.getBillingTypeData();

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
       this.onApplyDeliveryChangeValidators();
        this.docketService?.basicDetailForm?.get('serviceType')?.valueChanges.subscribe(() => {
      this.applyTypeMovementValidation();
      this.applyVehicleNoValidation();
    });
     this.docketService.basicDetailForm.get('vehicleType')?.valueChanges.subscribe(() => {
    this.applyVehicleNoValidation();
  });
       
       // Run validation whenever EDD changes
  // this.docketService.freightForm.get('EDD')?.valueChanges.subscribe(() => {
  //   this.validateAppointmentDate();
  // });

  // // Run validation whenever appointmentDT changes
  // this.docketService.basicDetailForm.get('appointmentDT')?.valueChanges.subscribe(() => {
  //   this.validateAppointmentDate();
  // });
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


validateAppointmentDate() {
  // const eddDate = this.docketService.freightForm.get('EDD')?.value;
  // const appointmentDate = this.docketService.basicDetailForm.get('appointmentDT')?.value;
  // const appointmentCtrl = this.docketService.basicDetailForm.get('appointmentDT');

  // if (eddDate && appointmentDate && new Date(appointmentDate) < new Date(eddDate)) {
  //   appointmentCtrl?.setErrors({ ...(appointmentCtrl.errors || {}), minDate: true });
  // } else {
  //   if (appointmentCtrl?.errors) {
  //     const errors = { ...appointmentCtrl.errors };
  //     delete errors['minDate'];
  //     appointmentCtrl.setErrors(Object.keys(errors).length ? errors : null);
  //   }
  // }
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
      return;
    }
    this.basicDetailService.getGetVehicleNumbers(searchText).subscribe({
      next: (response) => {
        if (response) {
          this.vehicleNumbersList = response;
        } else {
          this.vehicleNumbersList = [];
        }
      },
      error: () => {
        this.vehicleNumbersList = [];
      }
    });
  }

  onChangeBillingParty(event: any) {
    this.docketService.basicDetailForm.patchValue({
      billingParty: event.custcd,
      billingName: event.custnm
    });
  }

  onChangedestinationsList(event: any) {
    this.docketService.basicDetailForm.patchValue({
      destination: event.locCode,
    });
    this.destinationsList = [];
  }

  toggleLocalNote() {
    const destination = this.docketService?.basicDetailForm?.get('destination')?.value;
    const origin = this.docketService?.basicDetailForm?.get('origin')?.value;
    const localNoteControl = this.docketService?.basicDetailForm?.get('isLocalNote');
    if (destination && origin && destination === origin) {
      localNoteControl?.enable();
      this.docketService.basicDetailForm.value.isLocalNote = false;
    } else {
      localNoteControl?.disable();
      this.docketService.basicDetailForm.value.isLocalNote = false;
    }
  }

  onFileSelect(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // set file in form control
      this.docketService.basicDetailForm.get("GSTDeclaration")?.setValue(file);
    }
  }

  onChangeCityListList(event: any, type: any) {
    if (type === 'from') {
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
    if (event?.codeId === 'P02') {
      this.docketService.isBillingTBB = true;
    } else {
      this.docketService.isBillingTBB = false;
    }
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
