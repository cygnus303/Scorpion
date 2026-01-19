import { Injectable } from '@angular/core';
import { BasePayload, generalMasterResponse, LoginUser, pinCodeResponse } from '../models/general-master.model';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BasicDetailService } from './basic-detail.service';
import { EmailRegex, mobileNo } from '../constants/common';
import { MobileNumberValidator } from '../directives/validators/mobile-number-validator';
import { SweetAlertService } from './sweet-alert.service';
import {  Subject } from 'rxjs';

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
  public rateList: generalMasterResponse[] = [];
  public today: string = '';
  public Location: string = '';
  public BaseUserCode: string = '';
  public baseUsername :string ='';
  public step2DetailsList: any;
  public getGSTNODetailsList: any;
  public GetPincodeOriginList!: any;
  public contractservicecharge: any;
  public gstCalculationList: any;
  public isBillingTBB: boolean = false;
  public isOtherCharge: boolean = false;
  public noOfRows: number = 1;
  public noboxDetailRows: number = 1;
  public groupedCharges: { [ids: number]: any[] } = {};
  public GSTFromTrnMode: any;
  public depth: string = '';
  public flagprocedd: string = '';
  public contractMessage: string = '';
  private requestId = 0;
  public freightData: any;
  public chargingData: any;
  public totalSubTotal: any;
  public getPincodeMaster: any;
  public freightchargingData: any[] = [];
  public originalCharges: any[] = [];
  public notPincodeValue = 'Please Enter at least 1 characters';
  public weightErrorMsg: string = '';
  public submitErrorMsg: string = '';
  public successMsg: string = '';
  public isSearching: boolean = false;
  public inValidDocketMsg: string = '';
  public loginUserList!: BasePayload;
  public bsValue: Date = new Date();
  public ewayBill$ = new Subject<string>();
  public selectedFile! :File;
  public docketUrl:any;
  public isSubmiting:boolean=false;
  public originalSubtotal: number = 0;
  private lastRequestId = 0;
  public calculateSummary = new Subject<boolean>();
  public isComplition : boolean = false;
  public completiondata: any;
  public ruleDetailForChargeRule: any;
  public isWeightRecalculated = false;
  public hasConfirmedNoEwayBill = false;
  public maxDiscountLimit: number = 0;
  public isPORequired:boolean=false;


  constructor(private basicDetailService: BasicDetailService, private sweetAlertService: SweetAlertService) { }

  detailForm() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.basicDetailForm = new FormGroup({
      isODAApplicable: new FormControl(false), 
      isLocalNote: new FormControl(false),
      ewayBillNo: new FormControl(null),
      cNoteNo: new FormControl(null, [Validators.required]),
      pincode: new FormControl(null),
      billingName: new FormControl(null),
      origin: new FormControl(this.Location),
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
      cNoteDate: new FormControl(new Date()),
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
      appointmentDT: new FormControl(new Date()),
      personName: new FormControl(null),
      contactNo: new FormControl(null),
      remarks: new FormControl(null),
      fromTime: new FormControl(null),
      toTime: new FormControl(null),
      billingType: new FormControl(null),
      billingParty: new FormControl(null),
      vehicleno: new FormControl(null),
      vehicleType: new FormControl('own'),
      csgegstState: new FormControl(''),
      csgngstState: new FormControl(''),
      GSTDeclaration: new FormControl(null),
      destination_Area: new FormControl(''),
      origin_Area: new FormControl(''),

      isVolumetric: new FormControl(false),
      IsLocalDocket: new FormControl(false),
      isDACC: new FormControl(false),
      custGSTState: new FormControl(),
      csgeCustGSTState: new FormControl(),
      ISCounterDelivery: new FormControl(false),
      applyreferencedktT: new FormControl(false),
      ISCounterPickUpPRS: new FormControl(false),
      IsMAllDeliveryN: new FormControl(false),
      IsODA: new FormControl(false),
      BaseCode2: new FormControl(''),
      BaseCode1: new FormControl(''),
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
      consignorEmail: new FormControl(null, [Validators.pattern(EmailRegex),Validators.pattern(/^(?!.*@scorpiongroup\.in$).*/i)]),

      // Consignee
      consigneeGSTNo: new FormControl(null),
      consigneeSelection: new FormControl('walkin'),
      consigneeName: new FormControl('8888'),
      consigneeMasterName: new FormControl(null),
      consigneeAddress: new FormControl(null),
      consigneeCity: new FormControl(null),
      consigneePincode: new FormControl(null),
      consigneeMobile: new FormControl(null, [Validators.pattern(mobileNo)]),
      consigneeEmail: new FormControl(null, [Validators.pattern(EmailRegex)]),

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
      riskType: new FormControl('O'),
      policyNo: new FormControl(null),
      policyDate: new FormControl(null),
      internalCovers: new FormControl(null),
      modvatCovers: new FormControl(null),
      customerRefNo: new FormControl(null),
      privateMark: new FormControl(null),
      tpNumber: new FormControl(null)
    },
      { validators: MobileNumberValidator.notSameConsignorConsignee() }
    )
  }


  freightbuild() {
    this.freightForm = new FormGroup({
      freightCharges: new FormControl(0),
      GSTPaidBy: new FormControl(),
      stax_paidby: new FormControl(),
      rateType: new FormControl(),
      freightRate: new FormControl(0),
      EDD: new FormControl(),
      billedAt: new FormControl(),
      billingState: new FormControl(),
      fovRate: new FormControl(0),
      fovCalculated: new FormControl(0),
      fovCharged: new FormControl(0),
      coddodCharged: new FormControl(),
      coddodCollected: new FormControl(),
      gstRate: new FormControl(),
      subTotal: new FormControl(),
      dktTotal: new FormControl(),
      discountType:new FormControl(''),
      discountAmount: new FormControl(),
      discount: new FormControl(),
      stax_exmpt_yn:new FormControl(),
      isStaxExemp:new FormControl()
    })
  }

  invoicebuild() {
    this.invoiceform = new FormGroup({
      invoiceRows: new FormArray([]),
      boxDetailRows:new FormArray([]),
      // Summary row 1
      cftTotal: new FormControl(),
      totalDeclaredValue: new FormControl(),
      totalNoOfPkgs: new FormControl(),
      totalCubicWeight: new FormControl(0),
      totalActualWeight: new FormControl(0, [Validators.required, Validators.min(1)]),

      // Summary row 2
      chargeWeightPerPkg: new FormControl(),
      finalActualWeight: new FormControl(0),

      cft_Ratio: new FormControl()
    });

    // Add default 1 row
    this.addRows();
    this.addBoxDetailRows();

    this.reIndexSrNo();
    this.boxDetailIndexSrNo();
  }

  get invoiceRows(): FormArray {
    return this.invoiceform.get('invoiceRows') as FormArray;
  }

  reIndexSrNo() {
  const invoiceRows = this.invoiceRows;
  invoiceRows.controls.forEach((ctrl, index) => {
    ctrl.patchValue({ srNo: index + 1 }, { emitEvent: false });
  });
}

  addRows(): void {
    for (let i = 0; i < this.noOfRows; i++) {
      this.invoiceRows.push(this.createInvoiceRow(this.invoiceRows.length + 1));
    }
  }
  
  //  box Detail
  
  get boxDetailRows(): FormArray {
    return this.invoiceform.get('boxDetailRows') as FormArray;
  }

  boxDetailIndexSrNo() {
  const boxDetailRows = this.boxDetailRows;
  boxDetailRows.controls.forEach((ctrl, index) => {
    ctrl.patchValue({ srNo: index + 1 }, { emitEvent: false });
  });
}

  addBoxDetailRows(): void {
    for (let i = 0; i < this.noboxDetailRows; i++) {
      this.boxDetailRows.push(this.createboxDetailRow(this.boxDetailRows.length + 1));
    }
  }
 createboxDetailRow(srNo: number): FormGroup {
    return new FormGroup({
      srNo: new FormControl(srNo),
      noOfPkgs: new FormControl(0),
      actualWeight: new FormControl(0, [Validators.required, Validators.min(1)]),
      length: new FormControl(0,this.loginUserList.Type ==='2' ? Validators.max(199.99):null),
      breadth: new FormControl(0,this.loginUserList.Type ==='2' ? Validators.max(199.99):null),
      height: new FormControl(0,this.loginUserList.Type ==='2' ? Validators.max(199.99):null),
      cubicweight: new FormControl(0),
    });
  }
  createInvoiceRow(srNo: number): FormGroup {
    return new FormGroup({
      srNo: new FormControl(srNo),
      ewayBillNo: new FormControl(null),
      ewayBillExpiry: new FormControl(''),
      ewayinvoiceDate: new FormControl(''),
      invoiceNo: new FormControl('', Validators.required),
      declaredvalue: new FormControl(0, Validators.required),
    });
  }

//   debounce(fn: (...args: any[]) => void, delay: number) {
//   let timer: any;
//   return (...args: any[]) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => fn(...args), delay);
//   };
// }

// debouncedFreightAndOtherChar = this.debounce(() => {
//   this.freightAndOtherChar();
// }, 500);

freightAndOtherChar(){
  this.getBaseCode2();
  this.getBaseCode1();
  this.GetFreightContractDetails();
  this.getOtherChargesDetail();
  this.getFovContractDetails();
}

  getpincodeData(event: any) {
    const searchText = typeof event === 'string' ? event : event?.term;
    if (!searchText || searchText.trim() === '') {
      this.pincodeList = [];
      this.notPincodeValue = 'Enter at least 1 character';
      this.isSearching = false;
      return;
    }

    if (searchText.length < 1) {
      this.notPincodeValue = 'Enter at least 1 character';
      this.pincodeList = [];
      return;
    }

    this.isSearching = true;
    this.notPincodeValue = 'Searching...';

    this.basicDetailService.getpincodeData(searchText).subscribe({
      next: (response) => {
        if (response.success && response.data?.length > 0) {
          this.pincodeList = response.data;
          this.notPincodeValue = 'No matches found';
        } else {
          this.pincodeList = [];
          this.notPincodeValue = 'No matches found';
        }
        this.isSearching = false;
      },
      error: () => {
        this.pincodeList = [];
        this.notPincodeValue = 'No matches found';
        this.isSearching = false;
      }
    });
  }


  resetPincodeDropdown() {
    this.pincodeList = [];
    this.notPincodeValue = 'Enter at least 1 characters';
  }

  onChangePinCode(event: any) {
    if (!event) return;
    this.getpincodeData(event.value)
    this.basicDetailForm.patchValue({ destination: event.destination , toCity:null});
    this.consignorForm.patchValue({ consigneePincode: event.value });
    this.pincodeList = [];
    this.getPincodeMasterList(event.value);
  }
  getPincodeMasterList(cityCode: string) {
    this.basicDetailService.getPincodeMasterList(cityCode).subscribe({
      next: (response: any) => {
        if (response) {
          this.getPincodeMaster = response;
          this.basicDetailForm.patchValue({
            isODAApplicable: this.getPincodeMaster.is_ODA_Apply === "Y" ? true : false,
          })
        }
      }
    });
  }

getMaxDiscountLimit() {
const date = new Date(this.basicDetailForm.value.cNoteDate);

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  const formattedDate = `${day} ${month} ${year}`; // 26 December 2025

  const payload = {
    contractId: this.step2DetailsList?.contractid,
    docketDate: formattedDate
  };

  this.basicDetailService.getMaxDiscount(payload).subscribe({
    next: (response: any) => {

      const result = response.data;
       this.maxDiscountLimit = result.maxDiscount;

      const discountControl = this.freightForm.get('discount');
      const discountAmountControl = this.freightForm.get('discountAmount');

      if (result.maxDiscountY_N === 'Y' && this.freightForm.value.discountType === 'P') {
        discountControl?.setValidators([
          Validators.min(0),
          Validators.max(result.maxDiscount)
        ]);
      } else {
         discountControl?.clearValidators();
        discountControl?.setValidators([Validators.min(0)]);
        discountControl?.setValue(0);
        discountAmountControl?.setValue(0);
      }

      discountControl?.updateValueAndValidity();
    },
    error: () => {
      console.error('Error while fetching max discount');
    }
  });
}



  getRuleDetailForDepth() {
    const payload = {
      key: this.basicDetailForm.value.billingType + 'DEPTH',
      paybas: this.basicDetailForm.value.billingType
    }
    this.basicDetailService.getRuleDetail(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.depth = response.result.defaultvalue
        }
      }
    });
  }

  getRuleDetailForProceed() {
    const payload = {
      key: this.basicDetailForm.value.billingType + 'PROCEED',
      paybas: this.basicDetailForm.value.billingType
    }
    this.basicDetailService.getRuleDetail(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.flagprocedd = response.result.defaultvalue
        }
      }
    });
  }

  getRuleDetailForChargeRule() {
    const payload = {
      key: 'CHRG_RULE',
      paybas: ''
    }
    this.basicDetailService.getRuleDetail(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.ruleDetailForChargeRule = response.result
        }
      }
    });
  }


  onFormFieldChange() {
    const billingParty = this.basicDetailForm.value.billingParty;
    const destination = this.basicDetailForm.value.destination;
    const billingType = this.basicDetailForm.value.billingType;
    if (billingParty && destination && billingType) {
      this.getStep2Details();
    }
  }

  getBlockedCustomerList() {
    const billingParty = this.basicDetailForm.value.billingParty;
    const destination = this.basicDetailForm.value.destination;
    const billingType = this.basicDetailForm.value.billingType;

    const payload = {
      custCode: this.basicDetailForm.value.billingParty,
      pageNumber: 1,
      pageSize: 1,
      filters: ""
    };
    this.basicDetailService.getBlockedCustomerList(payload).subscribe((response) => {
      // Check if the customer is blocked
      if (response && response.data.activeFlagForBlockBooking === 'Y') {
        this.sweetAlertService.info(`Customer Booking is blocked`, () => {
          this.basicDetailForm.patchValue({
            billingParty: null,
            billingName: null
          });
        });
      } else {
        // Proceed with the API call only if the customer is not blocked
         if (billingParty && destination && billingType) {
          const userType = this.loginUserList.Type;
          if (userType !== '1' && userType !== '2') {
            this.getStep2Details();
          }
        }
        }

      // const PONumber = this.consignorForm.get('policyNo');
      // if(response.data.poNumber_Active){
      //   PONumber?.setValidators([Validators.required]);
      //   PONumber?.setValidators([Validators.required]);
      //   this.isPORequired=true;
      // }else{
      //   PONumber?.clearValidators();
      //   PONumber?.clearValidators();
      //    this.isPORequired=false;
      // }
      // PONumber?.updateValueAndValidity();
      // PONumber?.updateValueAndValidity();
    });
  }


  validateDropdownValue(formControlName: string, newList: any[], key: string = 'codeId') {
    const currentValue = this.basicDetailForm.get(formControlName)?.value;
    if (currentValue && !newList.some(item => item[key] === currentValue)) {
      this.basicDetailForm.get(formControlName)?.reset(null); // remove old value
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
      orgncd: this.basicDetailForm.value.origin || this.Location
    }

    this.basicDetailService.GetStep2Details(payload).subscribe({
      next: (response) => {
        if (response) {
          this.step2DetailsList = response;
         // Contract validation
          if ((this.basicDetailForm.value.billingType === 'P02' && this.step2DetailsList.contractid === 'P028888') || !this.step2DetailsList.contractid) {
            const billingParty = this.basicDetailForm.get('billingParty')?.value || '';
            const billingName = this.basicDetailForm.get('billingName')?.value || '';
            this.sweetAlertService.info(`Customer Contract for <strong>${billingParty} - ${billingName}</strong> not found or may be expired. Please contact your administrator for further details.`,
              () => {
                this.basicDetailForm.patchValue({
                  billingParty: null,
                  billingName: null
                });
              }
            );
            return;
          }

          this.freightForm.patchValue({
            billedAt: this.step2DetailsList.billingLocation
          });

          this.consignorForm.patchValue({
            riskType: this.step2DetailsList?.risktype,
          });

          this.basicDetailForm.patchValue({
            isVolumetric: this.step2DetailsList?.isVolumentric === 'Y',
            // isDACC: this.step2DetailsList?.isDACC === 'Y',
            // IsCODDOD: this.step2DetailsList?.isCODDOD === 'Y'
          });

          // Load dependent data
          this.getTransportModeData(this.step2DetailsList.transMode);
          this.getPickUpData(this.step2DetailsList.pkgDelyType);
          this.getContentsData();
          this.getServiceTypeData(this.step2DetailsList.serviceType);
          this.getPackagingTypeData();
          this.getTypeofMovementData(this.step2DetailsList.ftlType);
          this.getbusinessTypeData();
          this.getexemptServicesData();
          this.GetPincodeOrigin();
          this.getRateData();
          this.getcontractservicecharge();
          this.getBaseCode2();
          this.getBaseCode1();
        }
      }
    });
  }



  GetPincodeOrigin(type?: string ) {
    const payload = {
      customerCode: this.basicDetailForm.value.billingParty,
      location: type === 'Origin' ? this.basicDetailForm.value.origin : this.basicDetailForm.value.destination,
      pincode: type === 'Origin' ? this.consignorForm.value.consignorPincode : this.basicDetailForm.value.pincode,
    }
    this.basicDetailService.GetPincodeOrigin(payload).subscribe({
      next: (response) => {
        if (response) {
          this.GetPincodeOriginList = response;
          if (type === 'Origin') {
            this.basicDetailForm.patchValue({
              originState: this.GetPincodeOriginList.stnm,
              csgngstState: this.GetPincodeOriginList.statePrefix,
              origin_Area: this.GetPincodeOriginList.area
            });
          } else {
            this.basicDetailForm.patchValue({
              destinationState: this.GetPincodeOriginList.stnm,
              csgegstState: this.GetPincodeOriginList.statePrefix,
              destination_Area: this.GetPincodeOriginList.area
            });
          }
          this.freightForm.patchValue({
            billedAt: this.GetPincodeOriginList.handling_Location,
            billingState: this.GetPincodeOriginList.statePrefix
          })
        }
      }
    });
  }

  GetDKTGSTForGTA() {
    const payload = {
      customerId: this.basicDetailForm.value.billingParty || '',
      transType: this.basicDetailForm.value.mode || '',
      exemptServices: this.basicDetailForm.value.exemptServices ? this.basicDetailForm.value.exemptServices : '',
    }
    this.basicDetailService.GetDKTGSTForGTA(payload).subscribe({
      next: (response: any) => {
        if (response) {
           this.isSubmiting=true;
          // this.GetPincodeOriginList = response;
          if(this.basicDetailForm.value.exemptServices){
            this.basicDetailForm.patchValue({
              sacCode: response.sacCode,
              sacDescription: response.sacCodeDesc,
              // mode: response.transType
            })
          }
          if (response.isGSTApplicable) {
            this.freightForm.patchValue({
              gstRate: this.GSTFromTrnMode?.codeDesc,
              stax_exmpt_yn:'N',
              isStaxExemp:false
            })
          } else {
            this.freightForm.patchValue({
              gstRate: 0,
              stax_exmpt_yn:'Y',
              isStaxExemp:true
            })
          }
          if(this.basicDetailForm.value.billingType==='P04'){
             this.freightForm.patchValue({
              gstRate: 0,
            })
          }
          // this.getGSTCalculation()
        }
      }
    });
    //  this.isSubmiting=false
  }

GetGSTFromTrnMode() {
  this.basicDetailService.GetGSTFromTrnMode(this.basicDetailForm.value.mode || '').subscribe({
      next: (response: any) => {
        if (response) {
          this.basicDetailForm.patchValue({
            sacCode: response.sacCode,
            sacDescription: response.sacCodeDesc,
          });
          this.freightForm.patchValue({
            gstRate: this.basicDetailForm.value.billingType === 'P04' ? 0 : response.codeDesc
          });
          this.GSTFromTrnMode = response;
        }
      },
      error: (err) => {
        console.error("Error in GetGSTFromTrnMode:", err);
      },
      complete: () => {
        // ✅ hamesha last ma call thase
        this.getcontractservicecharge();
      }
    });
}

getcontractservicecharge() {
  if (this.basicDetailForm.value.mode) {
    this.basicDetailService
      .contractservicecharge(this.step2DetailsList?.contractid, this.basicDetailForm.value.mode)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.contractservicecharge = response;
            this.calculateSummary.next(true);
            this.invoiceform.patchValue({
              cft_Ratio: this.contractservicecharge[0].cft_Ratio
            });
            this.getStaxPaidBy();
          }
        },
        error: (err) => {
          console.error("Error in contractservicecharge:", err);
        },
        complete: () => {
          setTimeout(() => {
            this.freightAndOtherChar();
          }, 200);
        }
      });
  }
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
          this.validateDropdownValue('mode', this.transportModeData);
        }
      },
    });
  }

  getPickUpData(codeId: any) {
    this.basicDetailService.getGeneralMasterList('PKPDL', '', codeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.pickUpData = response.data;
          this.validateDropdownValue('pickup', this.pickUpData);
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
          this.validateDropdownValue('serviceType', this.serviceData);
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

  getTypeofMovementData(codeId?: any) {
    this.basicDetailService.getGeneralMasterList('FTLTYP ', '', codeId).subscribe({
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

  getRateData() {
    this.basicDetailService.getGeneralMasterList('RATETYPE ', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.rateList = response.data;
        }
      },
    });
  }

  getStaxPaidBy() {
    this.basicDetailService.getStaxPaidBy(this.contractservicecharge[0].stax_PaidBy_Opts || 0).subscribe({
      next: (response: any) => {
        if (response) {
          this.freightForm.patchValue({
            GSTPaidBy: response.result[0].text,
            stax_paidby: response.result[0].value
          })
          this.freightForm.get('GSTPaidBy')?.disable();
        }
      },
    });
  }

  onchangeRateType(event?: any) {
    let rateId = event?event.codeId : this.freightForm.value.rateType;
    let actualWeight = this.invoiceform.value.finalActualWeight;
    let noOfpackages = this.invoiceform.value.totalNoOfPkgs;
    let freightCharges = this.freightForm.value.freightCharges;
    var CHRGWT =  this.invoiceform.value.finalActualWeight;
    if (rateId === 'P') {
      this.freightForm.patchValue({
        freightRate: (freightCharges / noOfpackages).toFixed(2),
      })
    } else if (rateId === 'W') {
      this.freightForm.patchValue({
        freightRate: (freightCharges / actualWeight).toFixed(2),
      })
    } else if (rateId == "T") {
      this.freightForm.patchValue({
        freightRate: (freightCharges / (CHRGWT * 1000)).toFixed(2),
      })
    }else {
      this.freightForm.patchValue({
        freightRate: freightCharges.toFixed(2),
      })
    }
    this.subTotalCalculation()
  }

  onchangefrightRate() {
    let rateId = this.freightForm.value.rateType;
    let actualWeight = this.invoiceform.value.finalActualWeight;
    let noOfpackages = this.invoiceform.value.totalNoOfPkgs;
    let freightRate = this.freightForm.value.freightRate;
    var CHRGWT =  this.invoiceform.value.finalActualWeight;
    if (rateId === 'P') {
      this.freightForm.patchValue({
        freightCharges:(freightRate * noOfpackages)
      })
    } else if (rateId === 'W') {
      this.freightForm.patchValue({
        freightCharges: (freightRate * actualWeight)
      })
    }else if (rateId == "T") {
      this.freightForm.patchValue({
        freightCharges: (freightRate * (CHRGWT / 1000)).toFixed(2),
      })
    } else {
      this.freightForm.patchValue({
        freightCharges: freightRate
      })
    }
    this.subTotalCalculation()
  }

  getProRataCharge() {
    const payload = {
      FLAG_PRORATA: this.step2DetailsList.flaG_PERMIT,
      RateType: this.freightForm.value.rateType,
      CHRGWT: this.invoiceform.value.finalActualWeight,
      FTLType: this.basicDetailForm.value.typeMovement || '',
      FREIGHT: this.freightForm.value.freightCharges,
      ServiceType: this.basicDetailForm.value.serviceType,
      FREIGHTRate: this.freightForm.value.freightRate
    }
    this.basicDetailService.GetProRataCharge(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.exemptServicesList = response.data;
        }
      },
    });
  }
getGSTCalculation() {
  const originalDate = this.basicDetailForm.value.cNoteDate;
  if (!originalDate) return;

  const dateObj = new Date(originalDate);
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const payload = {
     "custcode": this.basicDetailForm.value.billingParty || '',
      "payBas": this.basicDetailForm.value.billingType || '',
      "baseLocation": this.basicDetailForm.value.origin || '',
      "destCd": this.basicDetailForm.value.destination || '',
      "subTotal": this.freightForm.value.subTotal,
      "csgngstNo": this.consignorForm.value.consignorGSTNo || '',
      "csgegstNo": this.consignorForm.value.consigneeGSTNo || '',
      "transMode": this.basicDetailForm.value.mode || '',
      "docketDate": formattedDate || '',
      "billingPartyAS": (this.basicDetailForm.value.billingType === 'P01' || this.basicDetailForm.value.billingType === 'P02') ? 'CSGN' : 'CSGE',
      "csgngstState": this.basicDetailForm.value.csgngstState || '',
      "csgegstState": this.basicDetailForm.value.csgegstState || '',
      "gstRateType": this.freightForm.value.gstRate || '',
      "isGstApplied": "1",
      "billingState": this.freightForm.value.billingState || 'MH'
  };
     const currentId = ++this.lastRequestId;

  this.basicDetailService.getGSTCalculation(payload).subscribe({
    next: (response: any) => {
      // 👇 Only update if this is the latest request
      if (currentId === this.lastRequestId) {
        this.gstCalculationList = Object.keys(response).reduce((acc: any, key) => {
          this.isSubmiting=true;
          acc[key.toLowerCase()] = response[key];
          return acc;
        }, {});
        // this.freightForm.patchValue({
        //   ...this.gstCalculationList,
        //   dktTotal: this.gstCalculationList.dkttotal ?? null,
        //         billedAt: this.gstCalculationList.rcplbillgenloc,
        //     billingState: this.gstCalculationList.customerbillgenstate,
 
        //     // 👇 Collected fields same as amount
        //     igstcollected: this.gstCalculationList.igstamount,
        //     cgstcollected: this.gstCalculationList.cgstamount,
        //     sgstcollected: this.gstCalculationList.sgstamount,
        //     utgstcollected: this.gstCalculationList.utgstamount,
 
        // });
      }
    
      if (currentId === this.lastRequestId) {
       this.mergeAndPatchGST(this.gstCalculationList,this.completiondata?.wmdc || {},this.freightForm);
       this.isSubmiting=true;
      }
    },
    error: (err) => {
    // ❌ Error but only for latest call
    if (currentId === this.lastRequestId) {
      console.error('GST Calculation API Error', err);
      this.isSubmiting = false;
    }
  }
  });
}

mergeAndPatchGST(apiGST: any, editGST: any, freightForm: FormGroup) {
  // Convert both objects to lowercase keys
  const apiData = Object.keys(apiGST || {}).reduce((acc: any, key) => {
    acc[key.toLowerCase()] = apiGST[key];
    return acc;
  }, {});
  
  const editData = Object.keys(editGST || {}).reduce((acc: any, key) => {
    acc[key.toLowerCase()] = editGST[key];
    return acc;
  }, {});
  
  // Merge values using Math.max
  const mergedGST = {
    ...apiData,
    igstamount: Math.max(apiData.igstamount || 0),
    cgstamount: Math.max(apiData.cgstamount || 0),
    sgstamount: Math.max(apiData.sgstamount || 0),
    utgstamount: Math.max(apiData.utgstamount || 0),
    igstrate: Math.max(apiData.igstrate || 0),
    cgstrate: Math.max(apiData.cgstrate || 0),
    sgstrate: Math.max(apiData.sgstrate || 0),
    utgstrate: Math.max(apiData.utgstrate || 0),
    dktTotal: Math.max(apiData.dkttotal || 0),
    igstcollected: Math.max(apiData.igstamount || 0),
    cgstcollected: Math.max(apiData.cgstamount || 0),
    sgstcollected: Math.max(apiData.sgstamount || 0),
    utgstcollected: Math.max(apiData.utgstamount || 0),
    billedAt: apiData.rcplbillgenloc ?? editData.rcplbillgenloc ?? null,
    billingState: apiData.customerbillgenstate ?? editData.customerbillgenstate ?? null
  };

  // Patch form
  freightForm.patchValue(mergedGST, { emitEvent: false });
  if(this.basicDetailForm.value.billingType === 'P04'){
   this.freightForm.patchValue({
          billedAt: this.basicDetailForm.value.origin,
          billingState: this.basicDetailForm.value.csgngstState
 
    });
  }
}

  getIGSTchargesDetail(complitiondata?:any) {
    this.basicDetailService.getIGSTchargesDetail().subscribe({
      next: (response) => {
        if (!response) return;

        // Group by ids & convert chargeCode to camelCase
        this.groupedCharges = response.reduce((acc: any, item: any) => {
          const camelCaseCode = item.chargeCode.toLowerCase();
          item.camelCaseCode = camelCaseCode; // store for template use

          if (!acc[item.ids]) acc[item.ids] = [];
          acc[item.ids].push(item);

          return acc;
        }, {} as { [ids: number]: any[] });

        // Add dynamic form controls for each charge
        Object.values(this.groupedCharges).forEach((charges: any[]) => {
          charges.forEach((charge) => {
            if (!this.freightForm.contains(charge.camelCaseCode)) {
              this.freightForm.addControl(
                charge.camelCaseCode,
                new FormControl(charge.percentage || 0)
              );
            }
          });
        });
      },
    });
  // if (complitiondata) {
  //   // Extra values patch કરવી
  //   this.freightForm.patchValue({
  //           // ...complitiondata?.wmdc,
  //     dktTotal:complitiondata?.wmdc?.dkttot ?? 0,
  //     igstrate:complitiondata?.wmdc?.igstRate ?? 0,
  //     cgstrate:complitiondata?.wmdc?.cgstRate ?? 0,
  //     sgstrate:complitiondata?.wmdc?.sgstRate ?? 0,
  //     utgstrate:complitiondata?.wmdc?.utgstRate ?? 0,
  //     igstcollected: complitiondata?.wmdc?.igstAmount ?? 0,
  //     cgstcollected: complitiondata?.wmdc?.cgstAmount ?? 0,
  //     sgstcollected: complitiondata?.wmdc?.sgstAmount ?? 0,
  //     utgstcollected: complitiondata?.wmdc?.utgstAmount ?? 0,
  //   });
  //   console.log(this.freightForm.value)
  // }
  }

getChargesData() {
    this.basicDetailService.getChargeDetail().subscribe({
      next: (response) => {
        if (response) {
          this.freightchargingData = response;
          this.originalCharges = JSON.parse(JSON.stringify(response));
          // Form controls banavva
          this.freightchargingData.forEach((item: any) => {
            if (!this.freightForm.contains(item.chargeCode)) {
              this.freightForm.addControl(
                item.chargeCode,
                new FormControl(item.chargeAmount || 0)
              );
            } else {
              // Already control hoy to value update karvi
              this.freightForm
                .get(item.chargeCode)
                ?.setValue(item.chargeAmount || 0);
            }
          });
        }
      }
    });
  }

getBaseCode2() {
  const chargeRule = this.step2DetailsList?.chargeBas;
  const prodCd = this.basicDetailForm.value?.contents;
  const pkgSty = this.basicDetailForm.value?.packingType;;

  if (chargeRule === 'NONE') {
    this.basicDetailForm.get('BaseCode2')?.setValue(chargeRule);
  } 
  else if (chargeRule === 'PROD') {
    this.basicDetailForm.get('BaseCode2')?.setValue(chargeRule);
    // If you want to assign product code instead, uncomment:
    // this.basicDetailForm.get('BaseCode2')?.setValue(prodCd);
  } 
  else if (chargeRule === 'PKGS') {
    this.basicDetailForm.get('BaseCode2')?.setValue(pkgSty);
  }
}

getBaseCode1() {
  const chargeRule = this.ruleDetailForChargeRule?.defaultvalue ;
  const serviceType = this.basicDetailForm.get('serviceType')?.value;
  const businessType = this.basicDetailForm.get('businessType')?.value;

  if (chargeRule === 'NONE') {
    this.basicDetailForm.get('BaseCode1')?.setValue(chargeRule);
  } 
  else if (chargeRule === 'SVCTYP') {
    this.basicDetailForm.get('BaseCode1')?.setValue(serviceType);
  } 
  else if (chargeRule === 'BUT') {
    this.basicDetailForm.get('BaseCode1')?.setValue(businessType);
  }
}

calculateChargeWeight(){
      var ACTUWT = this.invoiceform.value.totalActualWeight;
      var CFTTOT = this.invoiceform.value.totalCubicWeight;
      if (this.step2DetailsList?.isVolumentric == 'N') {
          this.invoiceform.patchValue({
            finalActualWeight:ACTUWT
          })
      }
      else {
          if (this.step2DetailsList?.cftWeightType == "A"){
             this.invoiceform.patchValue({
            finalActualWeight:ACTUWT
          })
          }
          else if (this.step2DetailsList?.cftWeightType == "V")
            this.invoiceform.patchValue({
            finalActualWeight:CFTTOT
          })
          else {
            if (parseFloat(ACTUWT) > parseFloat(CFTTOT))
              this.invoiceform.patchValue({
                finalActualWeight: ACTUWT
              })
          else
            this.invoiceform.patchValue({
            finalActualWeight:CFTTOT
          })
          }
      }
}

GetFreightContractDetails() {
  
  const originalFinalWeight = this.invoiceform.value.finalActualWeight;
  const data = {
    chargeRule: this.ruleDetailForChargeRule?.defaultvalue || 'NONE',
    baseCode1: this.basicDetailForm.value?.BaseCode1 || 'NONE',
    chargeSubRule: this.step2DetailsList?.chargeBas || 'NONE',
    baseCode2: this.basicDetailForm.value?.BaseCode2 || 'NONE',

    chargedWeight: originalFinalWeight?.toString(),
    chargedWeright: originalFinalWeight?.toString(),

    contractID: this.step2DetailsList?.contractid,
    destination: this.basicDetailForm.value.destination,
    depth: this.depth,
    flagProceed: this.flagprocedd,
    fromCity: this.basicDetailForm.value.fromCity,
    fromstate: this.basicDetailForm.value.originState,
    tostate: this.basicDetailForm.value.destinationState,
    itemCode: '',
    ftlType: this.basicDetailForm.value.typeMovement || '',
    noOfPkgs: this.invoiceform.value.totalNoOfPkgs?.toString(),
    origin: this.basicDetailForm.value.origin,
    payBase: this.basicDetailForm.value.billingType,
    serviceType: this.basicDetailForm.value.serviceType,
    toCity: this.basicDetailForm.value.toCity,
    transMode: this.basicDetailForm.value.mode,
    orderID: this.step2DetailsList?.contractid,
    invAmt: this.invoiceform.value.totalDeclaredValue?.toString(),
    dockdt: this.basicDetailForm.value.cNoteDate.toISOString(),
    prodcd: this.basicDetailForm.value.contents,
    isPerPieceRate: this.step2DetailsList?.isPerPieceRate,
    fromPincode: this.consignorForm.value.consignorPincode,
    toPincode: this.basicDetailForm.value.pincode,
    totalPiece: 0
  };

  // Validation
  if (!data.invAmt || !data.prodcd || !data.tostate ||data.noOfPkgs === "0" ||!data.transMode ||!data.serviceType ||this.invoiceform.value.totalActualWeight == 0) {
    return;
  }
  const currentRequestId = ++this.requestId;

  this.basicDetailService.GetFreightContractDetails(data).subscribe({
    next: (response: any) => {
      if (response) {
        if (currentRequestId !== this.requestId) {
          return;
        }
        this.isSubmiting = true;

        this.freightData = response.result[0];
        this.contractMessage = this.freightData.contractMessage;

        this.freightForm.patchValue({
          freightCharges: this.freightData?.freightCharge,
          rateType: this.freightData.rateType,
          freightRate: this.freightData.freightRate,
          EDD: new Date(this.freightData.edd)
            .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            .toUpperCase()
            .replace(/ /g, '-'),
          billingState: this.freightData.billingState
        });

        // ⭐ Update form weight ONLY if API gives higher value
      if(this.freightData.chargedWeight > originalFinalWeight ){
          const newFinalWeight = Math.max(this.freightData.chargedWeight || 0, originalFinalWeight || 0);
         
          this.invoiceform.patchValue({
            finalActualWeight: newFinalWeight,
          });
        }

          if(this.freightData.chargedPKGS > this.invoiceform.value.chargeWeightPerPkg){
          const newPkgWeight = Math.max(this.freightData.chargedPKGS || 0, this.invoiceform.value.chargeWeightPerPkg || 0);
          this.invoiceform.patchValue({
            chargeWeightPerPkg: newPkgWeight
          });
        }
        this.validateAppointmentDate();
        this.getFuelSurcharge(this.freightData?.freightCharge);
      }
    }
  });

  // this.isSubmiting = false;
}

validateAppointmentDate() {
  const appointmentControl = this.basicDetailForm.get('appointmentDT');
  const eddControl = this.freightForm.get('EDD');
  if (!appointmentControl || !eddControl) return;
  const appointmentDate = appointmentControl.value ? new Date(appointmentControl.value) : null;
  const eddDate = eddControl.value ? new Date(eddControl.value) : null;
  if (appointmentDate && eddDate && appointmentDate < eddDate && this.basicDetailForm.get('isAppointmentDelivery')?.value) {
    appointmentControl.setErrors({ appointmentBeforeEdd: true });
    appointmentControl.markAsTouched();  // 👈 force touched
  } else {
    if (appointmentControl.hasError('appointmentBeforeEdd')) {
      const errors = { ...appointmentControl.errors };
      delete errors['appointmentBeforeEdd'];
      appointmentControl.setErrors(Object.keys(errors).length ? errors : null);
    }
  }
}

  getFovContractDetails() {
    const payload = {
      chargeRule: this.ruleDetailForChargeRule?.defaultvalue || 'NONE',
      baseCode1: this.basicDetailForm.value?.BaseCode1 || 'NONE',
      contractID: this.step2DetailsList?.contractid,
      riskType: this.step2DetailsList?.risktype,
      invAmt: this.invoiceform.value.totalDeclaredValue?.toString(),
      serviceType: this.basicDetailForm.value.serviceType ?this.basicDetailForm.value.serviceType :''
    }
    if (!payload.contractID || !payload.riskType || !payload.invAmt) {
    console.warn("Skipping FOV API call — missing values", {
    });
      return;
    }
    this.basicDetailService.getFovContractDetails(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.isSubmiting=true;
          this.freightForm.patchValue({
            fovCharged: response.fovCharged,
            fovCalculated: response.fovCharged,
            fovRate: response.fovRate
          });
        }
      },
    });
  }
  getOtherChargesDetail() {
    const chargedWeight = Math.max(this.invoiceform.value.totalActualWeight || 0, this.invoiceform.value.totalCubicWeight || 0)?.toString();
    const payload = {
      "chargeRule":this.ruleDetailForChargeRule?.defaultvalue || 'NONE',
      "baseCode1": this.basicDetailForm.value?.BaseCode1 || 'NONE',
      "chargeSubRule": this.step2DetailsList?.chargeBas || 'NONE',
      "baseCode2":this.basicDetailForm.value?.BaseCode2 || 'NONE',
      // "chargedWeight": chargedWeight,
      "chargedWeight": this.invoiceform.value.finalActualWeight?.toString(),
      "contractID": this.step2DetailsList?.contractid,
      "destination": this.basicDetailForm.value.destination,
      "depth": this.depth,
      "flagProceed": this.flagprocedd,
      "fromCity": this.basicDetailForm.value.fromCity,
      "ftlType": this.basicDetailForm.value.typeMovement || '',
      "noOfPkgs": this.invoiceform.value.chargeWeightPerPkg?.toString(),
      "origin": this.basicDetailForm.value.origin,
      "payBase": this.basicDetailForm.value.billingType,
      "serviceType": this.basicDetailForm.value.serviceType,
      "toCity": this.basicDetailForm.value.toCity,
      "transMode": this.basicDetailForm.value.mode,
      "orderID": this.step2DetailsList?.contractid,
      "invAmt": this.invoiceform.value.totalDeclaredValue?.toString(),
      "dockdt": new Date(this.basicDetailForm.value.cNoteDate).toISOString(),
      "prodType": this.basicDetailForm.value.contents,
      "packType": this.basicDetailForm.value.packingType,
      "riskType": this.step2DetailsList?.risktype,
      "originPincode": this.consignorForm.value.consignorPincode || 0,
      "destPincode": this.basicDetailForm.value.pincode || 0,
      "floorNo": 0
    };
     if (!payload.invAmt || !payload.fromCity || !payload.packType || !payload.noOfPkgs || !payload.transMode || !payload.serviceType || !payload.prodType || !payload.toCity) {
      console.warn("Required fields missing, API not called:", payload);
      return;
    }

    // Call API only if all fields are filled
    this.basicDetailService.getOtherChargesDetail(payload).subscribe({
      next: (response) => {
        if (response) {
          this.isSubmiting=true;
          this.chargingData = response;
          // this.chargingData.forEach((item: any) => {
            // if(this.loginUserList.Type !== '2'){
              // if (this.freightForm.contains(item.chargecode)) {
              //     this.freightForm.patchValue({
              //       [item.chargecode]: item.charge
              //     });
              //     if (item.chargecode === 'SCHG12') {
              //       this.freightForm.patchValue({
              //         coddodCharged: item.charge
              //       });
              //     }
              //     if (!this.basicDetailForm.get('IsMAllDeliveryN')?.value) {
              //       this.freightForm.patchValue({ SCHG17: 0 })
              //     }
              //     if (!this.basicDetailForm.get('isAppointmentDelivery')?.value) {
              //       this.freightForm.patchValue({ UCHG08: 0 })
              //     }
              //     if (!this.basicDetailForm.get('iscsdDelivery')?.value) {
              //       this.freightForm.patchValue({ SCHG10: 0 })
              //     }
              //     if (!this.basicDetailForm.get('isDACC')?.value) {
              //       this.freightForm.patchValue({ SCHG13: 0 })
              //     }
              //     if (!this.basicDetailForm.get('IsCODDOD')?.value) {
              //       this.freightForm.patchValue({ SCHG12: 0 });
              //       this.freightForm.patchValue({coddodCharged:0})
              //     }
              //     if (this.freightForm.get('fovRate')?.value) {
              //       this.freightForm.patchValue({ SCHG11: 0 })
              //     }
              //   }
            // }
            // else{
              this.mergeAndPatchCharges(
                this.chargingData,
                this.completiondata?.listCharges || [], // agar edit data available hoy to
                this.freightForm,
                this.basicDetailForm,
              );
            // }
          // });
          // this.subTotalCalculation();
          this.isSubmiting=false
          this.getFuelSurcharge(this.freightData?.freightCharge);
        }
      },
    });
    // this.isSubmiting=false;
  }

mergeAndPatchCharges( 
  apiCharges: any[],
  editCharges: any[],
  freightForm: FormGroup,
  basicDetailForm: FormGroup,
) {
  const mergedMap = new Map<string, number>();
  // 1️⃣ Collect API charges
  apiCharges?.forEach((item: any) => {
    const code = (item.chargecode || "").toUpperCase();
    const amount = Number(item.charge) || 0;
    mergedMap.set(code, amount);
  });

  // 2️⃣ Add/Edit charges
  editCharges?.forEach((item: any) => {
    const code = (item.chargeCode || item.chargecode || "").toUpperCase();
    const amount = Number(item.chargeAmount || item.charge) || 0;
    mergedMap.set(code, Math.max(mergedMap.get(code) || 0, amount));
  });

  // 3️⃣ Convert map to array
  this.chargingData = Array.from(mergedMap.entries()).map(([code, amount]) => ({
    chargecode: code,
    charge: amount,
  }));

  // 4️⃣ Patch values into freightForm (respecting manual edits)
  this.chargingData.forEach((chargeItem: any) => {
    const controlName = chargeItem.chargecode;
    const control = freightForm.get(controlName);
    const apiChargeObj = apiCharges?.find((api) => (api.chargecode || "").toUpperCase() === controlName);
    const apiValue = Number(apiChargeObj?.charge) || 0;

    if (control) {
      const currentValue = Number(control.value) || 0;
      const newValue = Number(chargeItem.charge) || 0;

      if (apiChargeObj) {
        
        if (apiValue > 0) {
          // API wins (non-zero)
          control.patchValue(apiValue, { emitEvent: false });
        } else {
          // API sent 0 → keep manual if any
          if (currentValue === 0) {
            control.patchValue(newValue, { emitEvent: false });
          }
        }
      } else {
        // No API charge for this code → keep manual if already filled
        if (currentValue === 0 || currentValue === null || currentValue === undefined) {
          control.patchValue(newValue, { emitEvent: false });
        }
      }
    } else {
      console.warn("Form control not found:", controlName);
    }
  });

  // 5️⃣ Business rules (same)
  if (!basicDetailForm.get('IsMAllDeliveryN')?.value) {
    freightForm.patchValue({ SCHG17: 0 });
  }
  if (!basicDetailForm.get('isAppointmentDelivery')?.value) {
    freightForm.patchValue({ UCHG08: 0 });
  }
  if (!basicDetailForm.get('iscsdDelivery')?.value) {
    freightForm.patchValue({ SCHG10: 0 });
  }
  if (!basicDetailForm.get('isDACC')?.value) {
    freightForm.patchValue({ SCHG13: 0 });
  }
  if (!basicDetailForm.get('IsCODDOD')?.value) {
    freightForm.patchValue({ SCHG12: 0, coddodCharged: 0 });
  }
  if (freightForm.get('fovRate')?.value) {
    freightForm.patchValue({ SCHG11: 0 });
  }

freightForm.valueChanges.subscribe((values) => {
    if (basicDetailForm.value.isreferenceDKT === true) {
      Object.keys(freightForm.controls).forEach((controlName) => {
        // Only charge fields & exclude SCHG04
        if (
          (controlName.startsWith('SCHG') || controlName.startsWith('UCHG')) &&
          controlName !== 'SCHG04'
        ) {
          if (values[controlName] !== 0) {
            freightForm.get(controlName)?.patchValue(0, { emitEvent: false });
          }
        }
      });
    }
  });
}



  getFuelSurcharge(data: any) {
    const fuelRateType = this.contractservicecharge[0]?.fuelSurchrgBas;  // %, W, F
    const fuelRate = this.contractservicecharge[0]?.fuelSurchrg;
    const minFuelCharge = this.contractservicecharge[0]?.min_FuelSurchrg;
    const maxFuelCharge = this.contractservicecharge[0]?.max_FuelSurchrg;
    const chargedWeight = this.invoiceform.value?.finalActualWeight;
    const freight = Number(data);

    let fuelSurcharge = 0;
    let surcharge = 0;

    switch (fuelRateType) {
      case '%':
        surcharge = freight * fuelRate / 100;
        break;
      case 'W':
        surcharge = chargedWeight * fuelRate / 100;
        break;
      case 'F':
        surcharge = fuelRate;
        break;
    }

    if (surcharge < minFuelCharge) {
      surcharge = minFuelCharge;
    }

    if (surcharge > maxFuelCharge) {
      surcharge = maxFuelCharge;
    }
    
    fuelSurcharge = parseFloat(surcharge.toFixed(2));
    this.freightForm.patchValue({
      SCHG20: fuelSurcharge
    })
    if(this.basicDetailForm.value.isreferenceDKT === true|| this.basicDetailForm.value.billingType ==='P04'){
        this.freightForm.patchValue({
          freightRate:0,
          freightCharges:0,
          dktTotal:0,
          SCHG20:0
        })
      }
      if(this.basicDetailForm.value.isreferenceDKT === true){
        this.freightForm.patchValue({
          SCHG20:0
        })
      }
    this.subTotalCalculation()

  }

  subTotalCalculation() {
    let totalSubTotal = 0;
    // Freight charge from freightForm
    const freightCharges = Number(this.freightForm?.get('freightCharges')?.value) || 0;
    totalSubTotal += freightCharges;

    // Charges from freightForm (not old chargingData array)
    if (this.chargingData && Array.isArray(this.chargingData)) {
      this.chargingData.forEach((item: any) => {
        const controlValue = Number(this.freightForm?.get(item.chargecode)?.value) || 0;
        totalSubTotal += controlValue;
      });
      //  const fovRate = Number(this.freightForm?.value?.fovRate) || 0;
      const fovCharged = Number(this.freightForm?.value?.fovCharged) || 0;
      //  totalSubTotal += fovRate;
      totalSubTotal += fovCharged;
    }

    // Patch subtotal
    this.freightForm.patchValue(
      { subTotal: totalSubTotal.toFixed(2) },
      { emitEvent: false }
    );
      this.originalSubtotal = this.freightForm.value.subTotal;
    this.totalSubTotal = totalSubTotal;
    this.getGSTCalculation();
  }

  allowNumericDecimal(event: KeyboardEvent) {
    const pattern = /[0-9\.]/;   // allow digits & dot
    const inputChar = String.fromCharCode(event.charCode);

    // Prevent if not number or more than 1 decimal
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }

    // Prevent more than one dot
    if (inputChar === '.' && (event.target as HTMLInputElement).value.includes('.')) {
      event.preventDefault();
    }
  }

  actualWeightvalidation() {
    const CFTWeightType = this.step2DetailsList.cftWeightType;
    const CHRGWT: number = Math.max(
      Number(this.invoiceform.value.finalActualWeight) || 0,
      Number(this.invoiceform.value.totalCubicWeight) || 0
    );

    const ACTUWT = this.invoiceform.value.totalActualWeight;
    const CFTWeight = this.invoiceform.value.totalCubicWeight;

    const ctrl = this.invoiceform.get('finalActualWeight');
    this.weightErrorMsg = ''; // reset
    ctrl?.setErrors(null); // reset errors

    if (this.step2DetailsList.isVolumentric == 'Y') {
      if (CFTWeightType == "A") {
        if (CHRGWT < ACTUWT) {
          this.weightErrorMsg = "Charged Weight must not be less than Actual Weight.";
          ctrl?.setErrors({ weightInvalid: true });
          return false;
        }
      } else if (CFTWeightType == "V") {
        if (CHRGWT < CFTWeight) {
          this.weightErrorMsg = "Charged Weight must not be less than CFT Weight.";
          ctrl?.setErrors({ weightInvalid: true });
          return false;
        }
      } else if (CFTWeightType == "H") {
        if (CHRGWT < ACTUWT || CHRGWT < CFTWeight) {
          this.weightErrorMsg = "Charged Weight must be higher than CFT Weight and Actual Weight.";
          ctrl?.setErrors({ weightInvalid: true });
          return false;
        }
      }
    } else {
      if (CHRGWT < ACTUWT) {
        this.weightErrorMsg = "Charged Weight must not be less than Actual Weight.";
        ctrl?.setErrors({ weightInvalid: true });
        return false;
      }
    }

    // if valid
    this.weightErrorMsg = '';
    ctrl?.setErrors(null);
    return true;
  }

calculateDiscount(event?: any) {
  const discountType = event?.value || this.freightForm.value.discountType;
    if (event?.value) {
    this.freightForm.patchValue({
      discount: null,
      discountAmount: null,
      subTotal:this.originalSubtotal
    });
  }
  
  let Subtotal = this.originalSubtotal;

  let discounts = this.freightForm.value.discount;
  if (discountType == "P") {
    discounts = parseFloat(this.originalSubtotal.toString()) * parseFloat(discounts) / 100;
    this.getMaxDiscountLimit()
  }

  const finalSubtotal = Subtotal - parseFloat(discounts);

  this.freightForm.patchValue({
    subTotal: finalSubtotal.toFixed(2),
    discountAmount: discounts.toFixed(2)
  });

  this.getGSTCalculation();
}

}

