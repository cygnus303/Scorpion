import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { pinCodeResponse } from '../models/general-master.model';
import { BasicDetailService } from './basic-detail.service';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DocketService {
  public basicDetailForm!: FormGroup;
  public consignorForm!: FormGroup;
  public pincodeList: pinCodeResponse[] = [];
  public today: string = '';
  public HQTR = 'HQTR';
  public step2DetailsList:any;
  constructor( private basicDetailService: BasicDetailService,private datePipe: DatePipe) {}
  public getGSTNODetailsList: any;


  detailForm() {
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
      vehicleno: new FormControl(null),
      vehicleType: new FormControl('own'),

    });
  }

  consignorbuild() {
    this.consignorForm = new FormGroup({
      // Consignor
      consignorGSTNo: new FormControl(null),
      consignorSelection: new FormControl('walkin'),
      consignorName: new FormControl(null),
      consignorMasterName: new FormControl(null),
      consignorAddress: new FormControl(null),
      consignorCity: new FormControl(null),
      consignorPincode: new FormControl(null),
      consignorMobile: new FormControl(null),
      consignorEmail: new FormControl(null),

      // Consignee
      consigneeGSTNo: new FormControl(null),
      consigneeSelection: new FormControl('walkin'),
      consigneeName: new FormControl(null),
      consigneeMasterName: new FormControl(null),
      consigneeAddress: new FormControl(null),
      consigneeCity: new FormControl(null),
      consigneePincode: new FormControl(null),
      consigneeMobile: new FormControl(null),
      consigneeEmail: new FormControl(null),

      // Third Party
      // thirdPartyGSTNo: new FormControl(null),
      // thirdPartySelection: new FormControl('From Master'),
      // thirdPartyCode: new FormControl(null),
      // thirdPartyName: new FormControl(null),
      // thirdPartyAddress: new FormControl(null),
      // thirdPartyCity: new FormControl(null),
      // thirdPartyPincode: new FormControl(null),
      // thirdPartyMobile: new FormControl(null),

      // Risk & Documents
      riskType: new FormControl('owner'),
      policyNo: new FormControl(null),
      policyDate: new FormControl(null),
      internalCovers: new FormControl(null),
      modvatCovers: new FormControl(null),
      customerRefNo: new FormControl(null),
      privateMark: new FormControl(null),
      tpNumber: new FormControl(null)
    })
  }


  getpincodeData(event: any) {
    const searchText = event.term ||event;
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
    if (!event) return;
    this.basicDetailForm.patchValue({ destination: event.destination });
    this.consignorForm.patchValue({ consigneePincode: event.value });
    this.pincodeList = [];
  }
    onFormFieldChange() {
      const billingParty = this.basicDetailForm.value.billingParty;
      const destination = this.basicDetailForm.value.destination;
      const billingType = this.basicDetailForm.value.billingType;

      if (billingParty && destination && billingType) {
        this.getStep2Details();
      }
    }

    getStep2Details() {
      const rawDate = new Date(); // or your API date
      const formattedDate = this.datePipe.transform(rawDate, 'dd MMMM yyyy');
      const payload = {
        PartyCode: this.basicDetailForm.value.billingParty,
        Destination: this.basicDetailForm.value.destination,
        Paybas: this.basicDetailForm.value.billingType,
        Doctype: 'DKT',
        DOCKDT: formattedDate,
        orgncd: this.HQTR
      }
      this.basicDetailService.GetStep2Details(payload).subscribe({
        next: (response) => {
          if (response.success) {
            this.step2DetailsList = response.data;
          }
        }
      });
  }

  getGSTNODetails(event: any) {
    const searchText = event.target.value;
    this.basicDetailService.getGSTNODetailsList(searchText).subscribe({
      next: (response) => {
        if (response) {
          this.getGSTNODetailsList = response;
          this.consignorForm.patchValue({
            consignorGSTNo: response.consignor,
            consignorName: response.csgncd,
            consignorCity: response.toCity,
            consignorMasterName: response.csgenm,
            consignorPincode:response.pincode,
            consignorAddress:response.csgnAdd,
            consigneeGSTNo: response.consignee,
            consigneeName: response.csgecd,
            consigneeCity: response.fromCity,
            consigneeMasterName: response.csgnm,
            consigneePincode:`${response.toPincode} - ${response.area}`,
            consigneeAddress:response.csgeAdd,
          });
          this.basicDetailForm.patchValue({
            pincode:`${response.toPincode} - ${response.area}`
          })
        }
      }
    });
  }

  }

