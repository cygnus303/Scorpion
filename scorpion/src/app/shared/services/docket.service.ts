import { Injectable } from '@angular/core';
import { generalMasterResponse, pinCodeResponse } from '../models/general-master.model';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicDetailService } from './basic-detail.service';
import { GeneralMasterService } from './general-master.service';
import { mobileNo } from '../constants/common';

@Injectable({
  providedIn: 'root',
})
export class DocketService {
   invoiceform!: FormGroup;
  public basicDetailForm!: FormGroup;
  public consignorForm!: FormGroup;
  public freightForm!: FormGroup;
  public pincodeList: pinCodeResponse[] = [];
  public transportModeData: generalMasterResponse[] = [];
  public pickUpData: generalMasterResponse[] = [];
  public contentsData: generalMasterResponse[] = [];
  public serviceData: generalMasterResponse[] = [];
  public packagingTypeData: generalMasterResponse[] = [];
  public typeofMovementList: generalMasterResponse[] = [];
  public businessTypeList: generalMasterResponse[] = [];
  public exemptServicesList: generalMasterResponse[] = [];
  public today: string = '';
  public HQTR = 'NIDA';
  public step2DetailsList: any;
  public getGSTNODetailsList: any;
  public GetPincodeOriginList!: any;
  public contractservicecharge:any;
  public isBillingTBB: boolean = false;
  public isLocalNote: boolean = false;
  public noOfRows: number = 1;
  constructor(private basicDetailService: BasicDetailService) { }

  detailForm() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.basicDetailForm = new FormGroup({
      ewayBillNo: new FormControl(null),
      cNoteNo: new FormControl(null),
      pincode: new FormControl(null),
      billingName: new FormControl(null),
      origin: new FormControl('NIDA'),
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
      IsCODDOD: new FormControl(false),
      referenceDocket: new FormControl(null),
      isDocketPayment: new FormControl(false),
      sacCode: new FormControl(null),
      sacDescription: new FormControl(null),
      isAppointmentDelivery: new FormControl(false),
      iscsdDelivery: new FormControl(false),
      isODAApplicable: new FormControl(false),
      isLocalNote: new FormControl(false),
      appointmentDate: new FormControl(this.today),
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
      consignorName: new FormControl('8888'),
      consignorMasterName: new FormControl(null),
      consignorAddress: new FormControl(null),
      consignorCity: new FormControl(null),
      consignorPincode: new FormControl(null),
      consignorMobile: new FormControl(null, [Validators.pattern(mobileNo)]),
      consignorEmail: new FormControl(null),

      // Consignee
      consigneeGSTNo: new FormControl(null),
      consigneeSelection: new FormControl('walkin'),
      consigneeName: new FormControl('8888'),
      consigneeMasterName: new FormControl(null),
      consigneeAddress: new FormControl(null),
      consigneeCity: new FormControl(null),
      consigneePincode: new FormControl(null),
      consigneeMobile: new FormControl(null, [Validators.pattern(mobileNo)]),
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
      riskType: new FormControl('o'),
      policyNo: new FormControl(null),
      policyDate: new FormControl(null),
      internalCovers: new FormControl(null),
      modvatCovers: new FormControl(null),
      customerRefNo: new FormControl(null),
      privateMark: new FormControl(null),
      tpNumber: new FormControl(null)
    })
  }

  freightbuild() {
    this.freightForm = new FormGroup({
      freightCharges: new FormControl(),
      GSTPaidBy: new FormControl(),
      rateType: new FormControl(),
      freightRate: new FormControl(),
      EDD: new FormControl(),
      billedAt: new FormControl(),
      billingState: new FormControl(),
      fovRate: new FormControl(),
      fovCalculated: new FormControl(),
      fovCharged: new FormControl(),
      coddodCharged: new FormControl(),
      coddodCollected: new FormControl(),
      gstRate: new FormControl(),
      subTotal: new FormControl(),
      total: new FormControl(),
      discountAmount: new FormControl(),
      discount: new FormControl(),
    })
  }

    invoicebuild() {
      this.invoiceform = new FormGroup({
        invoiceRows: new FormArray([]),
          // Summary row 1
      totalDeclaredValue: new FormControl(0),
      totalNoOfPkgs: new FormControl(0),
      totalCubicWeight: new FormControl(0),
      totalActualWeight: new FormControl(0),
  
      // Summary row 2
      chargeWeightPerPkg: new FormControl(0),
      finalActualWeight: new FormControl(0),
  
      cft_Ratio:new FormControl()
      });
  
      // Add default 1 row
      this.addRows();
    }
  
 get invoiceRows(): FormArray {
    return this.invoiceform.get('invoiceRows') as FormArray;
  }

   addRows(): void {
    for (let i = 0; i < this.noOfRows; i++) {
      this.invoiceRows.push(this.createInvoiceRow());
    }
  }

     createInvoiceRow(): FormGroup {
    return new FormGroup({
      ewayBillNo: new FormControl(''),
      ewayBillExpiry: new FormControl(''),
      invoiceValue: new FormControl(0),
      invoiceDate: new FormControl(''),
      invoiceNo: new FormControl(''),
      declaredValue: new FormControl(0),
      noOfPkgs: new FormControl(0),
      actualWeight: new FormControl(0),
      length: new FormControl(0),
      breadth: new FormControl(0),
      height: new FormControl(0),
      cubicWeight: new FormControl(0),
      invoicedate:new FormControl(),
      declaredvalue:new FormControl(0),
      cubicweight:new FormControl(0),
    });
  }

  getpincodeData(event: any) {
    const searchText = event.term || event;
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
    this.consignorForm.patchValue({ consigneePincode: event.pinArea });
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
    const rawDate = new Date(); // or from your API
    const formattedDate = rawDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
        if (response) {
          this.step2DetailsList = response;
          this.freightForm.patchValue({
            billedAt: this.step2DetailsList.billingLocation
          });
          this.consignorForm.patchValue({
            riskType: this.step2DetailsList?.risktype,
          });
          // this.basicDetailForm.patchValue({
          //  IsCODDOD:this.step2DetailsList?.isCODDOD
          // })
          this.getTransportModeData(this.step2DetailsList.transMode);
          this.getPickUpData(this.step2DetailsList.pkgDelyType);
          this.getContentsData();
          this.getServiceTypeData(this.step2DetailsList.serviceType);
          this.getPackagingTypeData();
          this.getTypeofMovementData();
          this.getbusinessTypeData();
          this.getexemptServicesData();
          this.GetPincodeOrigin();
          this.GetDKTGSTForGTA();
        }
      }
    });
  }


  GetPincodeOrigin() {
    const payload = {
      customerCode: this.basicDetailForm.value.billingParty,
      location: this.basicDetailForm.value.destination,
      pincode: this.basicDetailForm.value.pincode,
    }
    this.basicDetailService.GetPincodeOrigin(payload).subscribe({
      next: (response) => {
        if (response) {
          this.GetPincodeOriginList = response;
          this.basicDetailForm.patchValue({
            destinationState: this.GetPincodeOriginList.stnm
          })
        }
      }
    });
  }

  GetDKTGSTForGTA() {
    const payload = {
      customerId: this.basicDetailForm.value.billingParty,
      transType: '',
      exemptServices: '',
    }
    this.basicDetailService.GetDKTGSTForGTA(payload).subscribe({
      next: (response: any) => {
        if (response) {
          // this.GetPincodeOriginList = response;
          this.basicDetailForm.patchValue({
            sacCode: response.sacCode,
            sacDescription: response.sacCodeDesc,
            mode: response.transType
          })
        }
      }
    });
  }

  GetGSTFromTrnMode(event: any) {
    this.basicDetailService.GetGSTFromTrnMode(event?.codeId).subscribe({
      next: (response: any) => {
        if (response) {
          this.basicDetailForm.patchValue({
            sacCode: response.sacCode,
            sacDescription: response.sacCodeDesc,
          })
        }
      }
    });
    this.basicDetailService.contractservicecharge(this.step2DetailsList.contractid,event?.codeId).subscribe({
      next: (response: any) => {
        if (response) {
          this.contractservicecharge = response;
          this.invoiceform.patchValue({
            cft_Ratio:this.contractservicecharge[0].cft_Ratio
          });
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
            consignorPincode: response.pincode,
            consignorAddress: response.csgnAdd,
            consigneeGSTNo: response.consignee,
            consigneeName: response.csgecd,
            consigneeCity: response.fromCity,
            consigneeMasterName: response.csgnm,
            consigneePincode: `${response.toPincode} - ${response.area}`,
            consigneeAddress: response.csgeAdd,
          });
          this.basicDetailForm.patchValue({
            pincode: `${response.toPincode} - ${response.area}`
          })
        }
      }
    });
  }

  getTransportModeData(codeId: any) {
    this.basicDetailService.getGeneralMasterList('TRN', '', codeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.transportModeData = response.data;
          this.basicDetailForm.patchValue({
            mode:response.data[0].codeId
          });
        }
      },
    });
  }

  getPickUpData(codeId: any) {
    this.basicDetailService.getGeneralMasterList('PKPDL', '', codeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.pickUpData = response.data;
        }
      },
    });
  }

  getContentsData() {
    this.basicDetailService.getGeneralMasterList('PROD', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.contentsData = response.data;
        }
      },
    });
  }

  getServiceTypeData(codeId: any) {
    this.basicDetailService.getGeneralMasterList('SVCTYP', '', codeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.serviceData = response.data;
          this.basicDetailForm.patchValue({
            serviceType:response.data[0].codeId
          })
        }
      },
    });
  }

  getPackagingTypeData() {
    this.basicDetailService.getGeneralMasterList('PKGS', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.packagingTypeData = response.data;
        }
      },
    });
  }

  getTypeofMovementData() {
    this.basicDetailService.getGeneralMasterList('FTLTYP ', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.typeofMovementList = response.data;
        }
      },
    });
  }

  getbusinessTypeData() {
    this.basicDetailService.getGeneralMasterList('BUT ', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.businessTypeList = response.data;
          this.basicDetailForm?.patchValue({
            businessType: response.data[0].codeId
          })
        }
      },
    });
  }

  getexemptServicesData() {
    this.basicDetailService.getGeneralMasterList('EXMPTSRV ', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.exemptServicesList = response.data;
        }
      },
    });
  }

  getGSTCalculation() {
    const payload = {
      "custcode": this.basicDetailForm.value.billingParty,
      "payBas": this.basicDetailForm.value.businessType,
      "baseLocation": this.basicDetailForm.value.origin,
      "destCd": this.basicDetailForm.value.destination,
      "subTotal": 0,
      "csgngstNo": "string",
      "csgegstNo": "string",
      "transMode": this.basicDetailForm.value.mode,
      "docketDate":  this.basicDetailForm.value.cNoteDate,
      "billingPartyAS": "string",
      "csgngstState": "string",
      "csgegstState": "string",
      "gstRateType": "string",
      "isGstApplied": 1,
      "billingState": "string"
    }
    this.basicDetailService.getGSTCalculation(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.businessTypeList = response.data;
          this.basicDetailForm?.patchValue({
            businessType: response.data[0].codeId
          })
        }
      },
    });
  }

//   getOtherChargesDetail(freightData:any){
// const payload={
//   "chargeRule": "string",
//   "baseCode1": "string",
//   "chargeSubRule": "string",
//   "baseCode2": "string",
//   "chargedWeight": "string",
//   "contractID": "string",
//   "destination": "string",
//   "depth": "string",
//   "flagProceed": "string",
//   "fromCity": "string",
//   "ftlType": "string",
//   "noOfPkgs": "string",
//   "origin": "string",
//   "payBase": "string",
//   "serviceType": "string",
//   "toCity": "string",
//   "transMode": "string",
//   "orderID": "string",
//   "invAmt": "string",
//   "dockdt": "2025-08-08T12:04:19.598Z",
//   "prodType": "string",
//   "packType": "string",
//   "riskType": "string",
//   "originPincode": 0,
//   "destPincode": 0,
//   "floorNo": 0
// }
// this.basicDetailService.getOtherChargesDetail(payload).subscribe({
//      next: (response) => {
//        if (response.success) {
         
//        }
//      },
//    });
//   }

}

