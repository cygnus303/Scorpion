import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { billingTypeResponse } from '../../../shared/models/general-master.model';
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
      ewayBillNo: new FormControl(''),
      cNoteNo: new FormControl(''),
      pincode: new FormControl(''),
      billingName: new FormControl(''),
      origin: new FormControl(''),
      originState: new FormControl(''),
      destination: new FormControl(''),
      destinationState: new FormControl(''),
      mode: new FormControl(''),
      toCity: new FormControl(''),
      fromCity: new FormControl(''),
      pickup: new FormControl(''),
      serviceType: new FormControl(''),
      typeMovement: new FormControl(''),
      contents: new FormControl(''),
      cNoteDate: new FormControl(this.today),
      packingType: new FormControl(''),
      businessType: new FormControl(''),
      specialInstruction: new FormControl(''),
      exemptServices: new FormControl(''),
      isreferenceDKT: new FormControl(false),
      referenceDocket: new FormControl(''),
      isDocketPayment: new FormControl(false),
      sacCode: new FormControl(''),
      sacDescription: new FormControl(''),
      isAppointmentDelivery: new FormControl(false),
      iscsdDelivery: new FormControl(false),
      isODAApplicable: new FormControl(false),
      isLocalNote: new FormControl(false),
      appointmentDetails: new FormControl(''),
      personName: new FormControl(''),
      contactNo: new FormControl(''),
      remarks: new FormControl(''),
      fromTime: new FormControl(''),
      toTime: new FormControl(''),
      billingType: new FormControl(null),
      billingParty: new FormControl(null)
    })
  }

  getBillingTypeData() {
    this.basicDetailService.getBillingTypeList('PAYTYP').subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.billingTypeData = response.data;
        }
      },
      error: (response: any) => {
      },
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
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IkNZR05VU1RFQU0iLCJVc2VyVHlwZSI6IkFETUlOSVNUUkFUT1IiLCJqdGkiOiI2MjBkMjI2Yi0zMjE0LTQxNTktOWY3Yy0wZmFkNzRlMDllZWIiLCJlbWFpbCI6InJvaGl0dm9yYTExNEBnbWFpbC5jb20iLCJleHAiOjE4MTcxMjU3MjEsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAzMjQiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjMwMzI0In0.7t3mm1B_9EAxWBZUTgzfQ8-Q-k85EVO5nJaKqWiOQlo';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.basicDetailService.getBillingParty(getBillingParty, 'HQTR', this.basicDetailForm.value.billingType, headers).subscribe({
      next: (response) => {
        if (response.status === 200) {

          this.billingPartyData = response.data;
        }
      },
      error: (response: any) => {
      },
    });
  }


}
