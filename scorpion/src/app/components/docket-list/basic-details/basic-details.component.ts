import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { generalMasterResponse } from '../../../shared/models/general-master.model';
import { billingTypeResponse, cityResponse, pinCodeResponse } from '../../../shared/models/general-master.model';
import { debounceTime, distinctUntilChanged, filter, Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'basic-details',
  standalone: false,
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent {
  public basicDetailForm!: FormGroup;
  public billingTypeData: generalMasterResponse[] = [];
  public billingPartyData: any[] = [];
  public transportModeData: generalMasterResponse[] = [];
  public pickUpData: generalMasterResponse[] = [];
  public contentsData: generalMasterResponse[] = [];
  public serviceData: generalMasterResponse[] = [];
  public packagingTypeData: generalMasterResponse[] = [];

  public billingTypeInput = new Subject<string>();
  public pincodeList: pinCodeResponse[] = [];
  public cityList: cityResponse[] = [];
  today: string = '';

  constructor(
    public docketService: DocketService,
    private basicDetailService: BasicDetailService
  ) {
  }

  ngOnInit() {
    this.buildForm();
    this.getBillingTypeData();
  }

  buildForm() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.basicDetailForm = new FormGroup({
      ewayBillNo: new FormControl(null),
      cNoteNo: new FormControl(null),
      pincode: new FormControl(null),
      billingName: new FormControl(null),
      origin: new FormControl(null),
      originState: new FormControl(null),
      destination: new FormControl(null),
      destinationState: new FormControl(null),
      mode: new FormControl(null),
      toCity: new FormControl(null),
      fromCity: new FormControl(null),
      pickup: new FormControl(null),
      serviceType: new FormControl(null),
      typeMovement: new FormControl(null),
      contents: new FormControl(null),
      cNoteDate: new FormControl(this.today),
      packingType: new FormControl(null),
      businessType: new FormControl(null),
      specialInstruction: new FormControl(null),
      exemptServices: new FormControl(null),
      isreferenceDKT: new FormControl(false),
      referenceDocket: new FormControl(null),
      isDocketPayment: new FormControl(false),
      sacCode: new FormControl(null),
      sacDescription: new FormControl(null),
      isAppointmentDelivery: new FormControl(false),
      iscsdDelivery: new FormControl(false),
      isODAApplicable: new FormControl(false),
      isLocalNote: new FormControl(false),
      appointmentDetails: new FormControl(null),
      personName: new FormControl(null),
      contactNo: new FormControl(null),
      remarks: new FormControl(null),
      fromTime: new FormControl(null),
      toTime: new FormControl(null),
      billingType: new FormControl(null),
      billingParty: new FormControl(null),
      vehicleno: new FormControl(null)
    })
  }

  getBillingTypeData() {
    this.basicDetailService.getGeneralMasterList('PAYTYP', null).subscribe({
      next: (response) => {
        if (response.success) {
          this.billingTypeData = response.data;
        }
      }
    });
  }

  getTransportModeData() {
    this.basicDetailService.getGeneralMasterList('TRN', null).subscribe({
      next: (response) => {
        if (response.success) {
          this.transportModeData = response.data;
        }
      },
    });
  }

  getPickUpData() {
    this.basicDetailService.getGeneralMasterList('PKPDL', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.pickUpData = response.data;
        }
      },
    });
  }

  getContentsData(event: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.contentsData = [];
      return;
    }
    this.basicDetailService.getGeneralMasterList('PROD', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.contentsData = response.data;
        }
      },
    });
  }

  getServiceTypeData() {
    this.basicDetailService.getGeneralMasterList('SVCTYP', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.serviceData = response.data;
        }
      },
    });
  }
  getPackagingTypeData() {
    this.basicDetailService.getGeneralMasterList('PKGS', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.packagingTypeData = response.data;
        }
      },
    });
  }
  getpincodeData(event: any) {
    const searchText = event.term;

    if (!searchText || searchText.length < 1) {
      this.pincodeList = [];
      return;
    }
    this.basicDetailService.getpincodeData(searchText).subscribe({
      next: (response) => {
        if (response.success) {
          this.pincodeList = response.data;
        } else {
          this.pincodeList = [];
        }
      },
      error: () => {
        this.pincodeList = [];
      }
    });
  }
  onChangePinCode(event: any) {
    this.basicDetailForm.patchValue({
      destination: event.destination
    });
  }

  getCityList(event?: any) {
    const searchText = event.term;

    if (!searchText || searchText.length < 1) {
      this.pincodeList = [];
      return;
    }
    this.basicDetailService.getCityData(this.basicDetailForm.get('destination')?.value, searchText).subscribe({
      next: (response) => {
        if (response.success) {
          this.cityList = response.data;
        } else {
          this.cityList = [];
        }
      },
      error: () => {
        this.cityList = [];
      }
    });
  }

  onBillingPartyChange(event: any) {
    const billingParty = event.target.value;
    this.billingTypeInput.next(billingParty);
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker?.(); // Show native picker if supported
  }

  getBillingPartyData(event: any) {
    const searchText = event.term;

    if (!searchText || searchText.length < 3) {
      this.billingPartyData = [];
      return;
    }

    const payload = {
      searchTerm: searchText,
      paybs: this.basicDetailForm.get('billingType')?.value ? this.basicDetailForm.get('billingType')?.value : 'P01',
      location: "HQTR"
    }
    this.basicDetailService.getBillingParty(payload).subscribe({
      next: (response) => {
        if (response.success) {
         this.billingPartyData=response.data;
        } else {
          this.billingPartyData = [];
        }
      },
      error: () => {
        this.billingPartyData = [];
      }
    });
  }

  onChangeBillingParty(event: any) {
    this.basicDetailForm.patchValue({
      billingParty:event.custcd,
      billingName:event.custnm
    })
  }
}
