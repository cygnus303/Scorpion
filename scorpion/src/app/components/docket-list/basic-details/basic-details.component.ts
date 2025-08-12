import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { DestinationsList, generalMasterResponse, billingPartyResponse, VehicleNumbersResponse } from '../../../shared/models/general-master.model';
import { cityResponse } from '../../../shared/models/general-master.model';
import { combineLatest, filter, startWith } from 'rxjs';
import { GeneralMasterService } from '../../../shared/services/general-master.service';

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
    if (type === 'from') this.fromCityList = [];
    else this.toCityList = [];
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

  getDestinationsList(event?: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.destinationsList = [];
      return;
    }
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

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker?.();
  }

  getBillingPartyData(event: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 3) {
      this.billingPartyData = [];
      return;
    }
    const payload = {
      searchTerm: searchText,
      paybs: this.docketService.basicDetailForm.get('billingType')?.value ? this.docketService.basicDetailForm.get('billingType')?.value : 'P01',
      location: this.docketService.Location
    }
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
    })
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

  onChangeCityListList(event: any, type: any) {
    if (type === 'from') {
      this.docketService.basicDetailForm.patchValue({
        fromCity: event + ':' + event,
      });
    } else if (type === 'to') {
      this.docketService.basicDetailForm.patchValue({
        toCity: event + ':' + event,
      });
      this.docketService.consignorForm.patchValue({
        consigneeCity: event
      });
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
  }
}
