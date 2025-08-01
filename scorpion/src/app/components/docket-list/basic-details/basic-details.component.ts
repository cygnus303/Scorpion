import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/services/docket.service';
import { GeneralMasterService } from '../../../shared/services/services/general-master.service';
import { billingTypeResponse } from '../../../shared/services/models/general-master.model';
import { debounceTime, distinctUntilChanged, filter, Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

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

  constructor(
    public docketService: DocketService,
    private generalMasterService: GeneralMasterService
  ) {
    this.billingTypeInput.pipe(debounceTime(500), distinctUntilChanged(), filter(value => value.length >= 3)).subscribe(billingParty => {
      debugger
      this.getBillingParty(billingParty);
    });
  }

  ngOnInit() {
    this.getBillingTypeData();
    this.buildForm()
  }

  buildForm() {
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
      cNoteDate: new FormControl(''),
      packingType: new FormControl(''),
      businessType: new FormControl(''),
      specialInstruction: new FormControl(''),
      exemptServices: new FormControl(''),
      referenceDKT: new FormControl(''),
      sacCode: new FormControl(''),
      sacDescription: new FormControl(''),
      appointmentDelivery: new FormControl(''),
      csdDelivery: new FormControl(''),
      ODAApplicable: new FormControl(''),
      localNote: new FormControl(''),
      appointmentDetails: new FormControl(''),
      personName: new FormControl(''),
      contactNo: new FormControl(''),
      remarks: new FormControl(''),
      fromTime: new FormControl(''),
      toTime: new FormControl(''),
      billingType: new FormControl(''),
      billingParty: new FormControl('')
    })
  }

  getBillingTypeData() {
    this.generalMasterService.getBillingTypeList('PAYTYP').subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.billingTypeData = response.data;
        }
      },
      error: (response: any) => {
        // this.sweetAlertService.error(response.error.message);
      },
    });
  }

  onBillingPartyChange(event: any) {
    const billingParty = event.target.value;
    this.billingTypeInput.next(billingParty);
  }

  getBillingParty(getBillingParty: string) {
    debugger
    this.generalMasterService.getBillingParty(getBillingParty, 'HQTR', this.basicDetailForm.value.billingType).subscribe({
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
