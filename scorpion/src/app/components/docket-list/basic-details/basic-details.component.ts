import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
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
  public billingTypeData: billingTypeResponse[] = [];
  public billingPartyData: any[] = [];
  public billingTypeInput = new Subject<string>();
  public pincodeList: pinCodeResponse[] = [];
  public cityList:cityResponse[]=[];
  today: string = '';

  constructor(
    public docketService: DocketService,
    private basicDetailService: BasicDetailService
  ) {
    this.billingTypeInput.pipe(debounceTime(500), distinctUntilChanged(), filter(value => value.length >= 2)).subscribe(billingParty => {
      this.getBillingParty(billingParty);
    });
  }

  ngOnInit() {
    this.getBillingTypeData();
    this.buildForm()
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
    this.basicDetailService.getBillingTypeList('PAYTYP', null).subscribe({
      next: (response) => {
        if (response.success) {
          this.billingTypeData = response.data;
        }
      },
      error: (response: any) => {
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

  getCityList(event?: any){
      const searchText = event.term;

    if (!searchText || searchText.length < 1) {
      this.pincodeList = [];
      return;
    }
    this.basicDetailService.getCityData(this.basicDetailForm.get('destination')?.value,searchText).subscribe({
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

  getBillingParty(getBillingParty: string) {
    //   const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IkNZR05VU1RFQU0iLCJVc2VyVHlwZSI6IkFETUlOSVNUUkFUT1IiLCJqdGkiOiI2MjBkMjI2Yi0zMjE0LTQxNTktOWY3Yy0wZmFkNzRlMDllZWIiLCJlbWFpbCI6InJvaGl0dm9yYTExNEBnbWFpbC5jb20iLCJleHAiOjE4MTcxMjU3MjEsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAzMjQiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjMwMzI0In0.7t3mm1B_9EAxWBZUTgzfQ8-Q-k85EVO5nJaKqWiOQlo';

    //   const headers = new HttpHeaders({
    //     Authorization: `Bearer ${token}`
    //   });
    //   this.basicDetailService.getBillingParty(getBillingParty, 'HQTR', this.basicDetailForm.value.billingType, headers).subscribe({
    //     next: (response) => {
    //       if (response.status === 200) {

    //         this.billingPartyData = response.data;
    //       }
    //     },
    //     error: (response: any) => {
    //     },
    //   });
  }


}
