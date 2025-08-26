import { Injectable } from '@angular/core';
import { generalMasterResponse, LoginUser, pinCodeResponse } from '../models/general-master.model';
import { FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BasicDetailService } from './basic-detail.service';
import { EmailRegex, mobileNo } from '../constants/common';
import { MobileNumberValidator } from '../directives/validators/mobile-number-validator';

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
  public Location : string ='';
  public BaseUserCode : string ='';
  public step2DetailsList: any;
  public getGSTNODetailsList: any;
  public GetPincodeOriginList!: any;
  public contractservicecharge: any;
  public gstCalculationList: any;
  public isBillingTBB: boolean = false;
  public noOfRows: number = 1;
  public groupedCharges: { [ids: number]: any[] } = {};
  public GSTFromTrnMode: any;
  public depth: string = '';
  public flagprocedd: string = '';
  public contractMessage: string = '';
  public freightData: any;
  public chargingData: any;
  public totalSubTotal: any;
  public getPincodeMaster: any;
  public freightchargingData: any[] = [];
  public originalCharges: any[] = [];
  public notPincodeValue ='Please Enter at least 1 characters';
  public weightErrorMsg: string = '';
  public submitErrorMsg : string ='';
  public successMsg:string='';
  public isSearching :boolean = false;
  public inValidDocketMsg :string='';
  public loginUserList!:LoginUser;
  constructor(private basicDetailService: BasicDetailService) { }

  detailForm() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.basicDetailForm = new FormGroup({
      isODAApplicable: new FormControl({ value: false, disabled: true }),
      isLocalNote: new FormControl(false),
      ewayBillNo: new FormControl(null),
      cNoteNo: new FormControl(null ,[Validators.required]),
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
      appointmentDT: new FormControl(this.today),
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
      destination_Area:new FormControl(''),
      origin_Area:new FormControl(''),

      volumetric: new FormControl(false),
      IsLocalDocket: new FormControl(false),
      isDACC: new FormControl(false),
      custGSTState: new FormControl(),
      csgeCustGSTState: new FormControl(),
      ISCounterDelivery: new FormControl(false),
      applyreferencedktT: new FormControl(false),
      ISCounterPickUpPRS: new FormControl(false),
      IsMAllDeliveryN: new FormControl(false),
      IsODA: new FormControl(false),
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
      consignorEmail: new FormControl(null, [Validators.pattern(EmailRegex)]),

      // Consignee
      consigneeGSTNo: new FormControl(null),
      consigneeSelection: new FormControl('walkin'),
      consigneeName: new FormControl('8888'),
      consigneeMasterName: new FormControl(null),
      consigneeAddress: new FormControl(null),
      consigneeCity: new FormControl(null),
      consigneePincode: new FormControl(null),
      consigneeMobile: new FormControl(null, [Validators.pattern(mobileNo)]),
      consigneeEmail: new FormControl(null,[ Validators.pattern(EmailRegex)]),

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
      freightCharges: new FormControl(),
      GSTPaidBy: new FormControl(),
      stax_paidby: new FormControl(),
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
      dktTotal: new FormControl(),
      discountAmount: new FormControl(),
      discount: new FormControl(),
    })
  }

  invoicebuild() {
    this.invoiceform = new FormGroup({
      invoiceRows: new FormArray([]),
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
  }

  get invoiceRows(): FormArray {
    return this.invoiceform.get('invoiceRows') as FormArray;
  }

  addRows(): void {
    for (let i = 0; i < this.noOfRows; i++) {
      this.invoiceRows.push(this.createInvoiceRow(this.invoiceRows.length + 1));
    }
  }

 createInvoiceRow(srNo: number): FormGroup {
 return new FormGroup({
    srNo: new FormControl(srNo),
    ewayBillNo: new FormControl(null),
    ewayBillExpiry: new FormControl(''),
    invoiceValue: new FormControl(0),
    ewayinvoiceDate: new FormControl(''),
    invoiceNo: new FormControl('', Validators.required),
    declaredvalue: new FormControl(0, Validators.required),
    noOfPkgs: new FormControl(0),
    actualWeight: new FormControl(0, [Validators.required, Validators.min(1)]),
    length: new FormControl(0),
    breadth: new FormControl(0),
    height: new FormControl(0),
    cubicweight: new FormControl(0),
    invoicedate: new FormControl(this.today),
  });
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


  resetPincodeDropdown(){
      this.pincodeList = [];
      this.notPincodeValue = 'Enter at least 1 characters';
  }

  onChangePinCode(event: any) {
    if (!event) return;
    this.basicDetailForm.patchValue({ destination: event.destination });
    this.consignorForm.patchValue({ consigneePincode: event.pinArea });
    this.pincodeList = [];
    this.getPincodeMasterList(event.value); 
  }
  getPincodeMasterList(cityCode:string) {
    this.basicDetailService.getPincodeMasterList(cityCode).subscribe({
      next: (response: any) => {
        if (response) {
          this.getPincodeMaster=response;
          this.basicDetailForm.patchValue({
            isODAApplicable:this.getPincodeMaster.is_ODA_Apply === "Y" ? true:false,
          })
        }
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


  onFormFieldChange() {
    const billingParty = this.basicDetailForm.value.billingParty;
    const destination = this.basicDetailForm.value.destination;
    const billingType = this.basicDetailForm.value.billingType;

  if (billingParty && destination && billingType) {
     if (this.invoiceRows.length > 0) {
      this.invoiceform.reset(this.invoicebuild());
    }
     this.freightbuild();
    this.getChargesData();
    this.consignorbuild();
    this.getIGSTchargesDetail();

    this.getStep2Details();
  }
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
      orgncd: this.Location
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
          this.basicDetailForm.patchValue({
            volumetric: this.step2DetailsList?.isVolumentric === 'Y' ? true : false,
            isDACC: this.step2DetailsList?.isDACC === 'Y' ? true : false,
            IsCODDOD:this.step2DetailsList?.isCODDOD === 'Y' ? true : false
          });
          // this.basicDetailForm.patchValue({
          //  IsCODDOD:this.step2DetailsList?.isCODDOD
          // })
          this.getTransportModeData(this.step2DetailsList.transMode);
          this.getPickUpData(this.step2DetailsList.pkgDelyType);
          this.getContentsData();
          this.getServiceTypeData(this.step2DetailsList.serviceType);
          this.getPackagingTypeData();
          this.getTypeofMovementData(this.step2DetailsList.ftlType);
          this.getbusinessTypeData();
          this.getexemptServicesData();
          this.GetPincodeOrigin();
          this.getRateData()
          this.getcontractservicecharge();
          // this.GetDKTGSTForGTA();
          // this.GetGSTFromTrnMode()
        }
      }
    });
  }


  GetPincodeOrigin(type?:string) {
    const payload = {
      customerCode: this.basicDetailForm.value.billingParty,
      location: type === 'Origin'? this.basicDetailForm.value.origin:this.basicDetailForm.value.destination,
      pincode: type === 'Origin'? this.consignorForm.value.consignorPincode:this.basicDetailForm.value.pincode,
    }
    this.basicDetailService.GetPincodeOrigin(payload).subscribe({
      next: (response) => {
        if (response) {
          this.GetPincodeOriginList = response;
          if(type === 'Origin'){
              this.basicDetailForm.patchValue({
              originState: this.GetPincodeOriginList.stnm,
              csgngstState: this.GetPincodeOriginList.statePrefix,
              origin_Area:this.GetPincodeOriginList.area
            });
          }else{
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
          // this.GetPincodeOriginList = response;
          // this.basicDetailForm.patchValue({
          //   sacCode: response.sacCode,
          //   sacDescription: response.sacCodeDesc,
          //   // mode: response.transType
          // })
          if(response.isGSTApplicable){
            this.freightForm.patchValue({
              gstRate:this.GSTFromTrnMode.codeDesc
            })
          }else{
            this.freightForm.patchValue({
              gstRate:0
            })
          }
          this.getGSTCalculation()
        }
      }
    });
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
            gstRate: response.codeDesc
          });
          this.GSTFromTrnMode = response;
        }
      }
    });
   this.getcontractservicecharge();
  }

  getcontractservicecharge(){
    if(this.basicDetailForm.value.mode){
      this.basicDetailService.contractservicecharge(this.step2DetailsList?.contractid, this.basicDetailForm.value.mode).subscribe({
     next: (response: any) => {
       if (response) {
         this.contractservicecharge = response;
         this.invoiceform.patchValue({
           cft_Ratio: this.contractservicecharge[0].cft_Ratio
         });
         this.getStaxPaidBy()
       }
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

  getTypeofMovementData(codeId: any) {
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
    this.basicDetailService.getStaxPaidBy(this.contractservicecharge[0].gstPaidBy || 0).subscribe({
      next: (response: any) => {
        if (response) {
          this.freightForm.patchValue({
            GSTPaidBy: response.result[0].text,
            stax_paidby: response.result[0].value
          })
        }
      },
    });
  }

  onchangeRateType(event: any) {
    let rateId = event.codeId;
    let actualWeight = this.invoiceform.value.finalActualWeight;
    let noOfpackages = this.invoiceform.value.totalNoOfPkgs;
    let freightCharges = this.freightForm.value.freightCharges;
    if (rateId === 'P') {
      this.freightForm.patchValue({
        freightRate: (freightCharges / noOfpackages)
      })
    } else if (rateId === 'W') {
      this.freightForm.patchValue({
        freightRate: (freightCharges / actualWeight)
      })
    } else {
      this.freightForm.patchValue({
        freightRate: freightCharges
      })
    }
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

    const requiredFieldsFilled =
      this.basicDetailForm.value.billingParty &&
      this.basicDetailForm.value.businessType &&
      this.basicDetailForm.value.origin &&
      this.basicDetailForm.value.destination &&
      this.basicDetailForm.value.mode &&
      originalDate &&
      // this.freightForm.value.billingState &&
      this.GSTFromTrnMode?.codeDesc;
    // this.consignorForm.value.consignorGSTNo &&
    // this.consignorForm.value.consigneeGSTNo &&
    // this.basicDetailForm.value.originState;

    if (!requiredFieldsFilled) {
      return;
    }

    // Date format "DD Month YYYY"
    const dateObj = new Date(originalDate);
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
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

    this.basicDetailService.getGSTCalculation(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.gstCalculationList = Object.keys(response).reduce((acc: any, key) => {
            acc[key.toLowerCase()] = response[key];
            return acc;
          }, {});
          this.freightForm.patchValue({
            ...this.gstCalculationList,
            dktTotal: this.gstCalculationList.dkttotal ?? null,
            billedAt: this.gstCalculationList.rcplbillgenloc,
            billingState: this.gstCalculationList.customerbillgenstate,

        // 👇 Collected fields same as amount
            igstcollected: this.gstCalculationList.igstamount,
            cgstcollected: this.gstCalculationList.cgstamount,
            sgstcollected: this.gstCalculationList.sgstamount,
            utgstcollected: this.gstCalculationList.utgstamount,
          });
        }
      },
    });
  }

  getIGSTchargesDetail() {
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

  GetFreightContractDetails() {
    const data = {
      chargeRule: 'NONE',
      baseCode1: 'NONE',
      chargeSubRule: 'NONE',
      baseCode2: 'NONE',
      chargedWeight: Math.max(this.invoiceform.value.totalActualWeight || 0, this.invoiceform.value.totalCubicWeight || 0)?.toString(),
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
      chargedWeright: Math.max(this.invoiceform.value.totalActualWeight || 0, this.invoiceform.value.totalCubicWeight || 0)?.toString(),
      origin: this.basicDetailForm.value.origin,
      payBase: this.basicDetailForm.value.billingType,
      serviceType: this.basicDetailForm.value.serviceType,
      toCity: this.basicDetailForm.value.toCity,
      transMode: this.basicDetailForm.value.mode,
      orderID: this.step2DetailsList?.contractid,
      invAmt: this.invoiceform.value.totalDeclaredValue?.toString(),
      dockdt: new Date().toISOString(),
      prodcd: this.basicDetailForm.value.contents,
      isPerPieceRate: this.step2DetailsList?.isPerPieceRate
    }
    this.basicDetailService.GetFreightContractDetails(data).subscribe({
      next: (response: any) => {
        if (response) {
          this.freightData = response.result[0];
          this.contractMessage = this.freightData.contractMessage
          this.freightForm.patchValue({
            freightCharges: this.freightData.freightCharge,
            rateType: this.freightData.rateType,
            freightRate: this.freightData.freightRate,
            EDD: new Date(this.freightData.edd)
              .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              .toUpperCase()
              .replace(/ /g, '-'),
            billingState: this.freightData.billingState
          });
        // Only patch the value if there's no validation error
          if (!this.weightErrorMsg) {
            this.invoiceform.patchValue({
              finalActualWeight: Math.max(this.freightData.chargedWeight || 0, this.invoiceform.value.finalActualWeight || 0),
              chargeWeightPerPkg: Math.max(this.freightData.chargedPKGS || 0, this.invoiceform.value.chargeWeightPerPkg || 0)
            });
          }

          this.getFuelSurcharge(this.freightData.freightCharge);
        }
      },
    });
    this.getFovContractDetails()
  }

  getFovContractDetails() {
    const payload = {
      chargeRule: "NONE",
      baseCode1: "NONE",
      contractID: this.step2DetailsList?.contractid,
      riskType: this.step2DetailsList?.risktype,
      invAmt: this.invoiceform.value.totalDeclaredValue?.toString(),
      serviceType: this.basicDetailForm.value.serviceType
    }
    this.basicDetailService.getFovContractDetails(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.freightForm.patchValue({
            fovCharged: response.fovCharged,
            fovCalculated: response.fovCharged,
            fovRate: response.fovRate
          })
        }
      },
    });
  }

  getOtherChargesDetail() {
    const chargedWeight = Math.max(this.invoiceform.value.totalActualWeight || 0,this.invoiceform.value.totalCubicWeight || 0)?.toString();
    const payload = {
      "chargeRule": 'NONE',
      "baseCode1": 'NONE',
      "chargeSubRule": "NONE",
      "baseCode2": "NONE",
      "chargedWeight": chargedWeight,
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
      "dockdt": this.basicDetailForm.value.cNoteDate,
      "prodType": this.basicDetailForm.value.contents,
      "packType": this.basicDetailForm.value.packingType,
      "riskType": this.step2DetailsList?.risktype,
      "originPincode": this.consignorForm.value.consignorPincode || 0,
      "destPincode": this.basicDetailForm.value.pincode || 0,
      "floorNo": 0
    };

    // Required fields check
    const allFieldsFilled = Object.values(payload).every(
      value => value !== null && value !== undefined && value !== '' && value !== '0'
    );

    // if (!allFieldsFilled) {
    //   console.warn('Required fields are missing. Skipping API call.');
    //   return;
    // }

    // Call API only if all fields are filled
    this.basicDetailService.getOtherChargesDetail(payload).subscribe({
      next: (response) => {
        if (response) {
          this.chargingData = response;
          this.chargingData.forEach((item: any) => {
            if (this.freightForm.contains(item.chargecode)) {
              this.freightForm.patchValue({
                [item.chargecode]: item.charge
              });
              if (!this.basicDetailForm.get('IsMAllDeliveryN')?.value) {
                this.freightForm.patchValue({ SCHG17: 0 })
              }
              if (!this.basicDetailForm.get('isAppointmentDelivery')?.value) {
                this.freightForm.patchValue({ UCHG08: 0 })
              }
              if (!this.basicDetailForm.get('iscsdDelivery')?.value) {
                this.freightForm.patchValue({ SCHG10: 0 })
              }
              if (!this.basicDetailForm.get('isDACC')?.value) {
                this.freightForm.patchValue({ SCHG13: 0 })
              }
               if (!this.basicDetailForm.get('IsCODDOD')?.value) {
                this.freightForm.patchValue({ SCHG12: 0 })
              }
              if (this.freightForm.get('fovRate')?.value) {
                this.freightForm.patchValue({ SCHG11: 0 })
              }
            }
          });
          this.subTotalCalculation(); 

        }
      },
    });
  }

  getFuelSurcharge(data:any) {
    const fuelRateType = this.contractservicecharge[0]?.fuelSurchrgBas;  // %, W, F
    const fuelRate = this.contractservicecharge[0]?.fuelSurchrg;
    const minFuelCharge = this.contractservicecharge[0]?.min_FuelSurchrg;
    const maxFuelCharge = this.contractservicecharge[0]?.max_FuelSurchrg;
    const chargedWeight = this.invoiceform.value?.finalActualWeight;
    const freight =  Number(data);

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
   this.subTotalCalculation()

  }

  subTotalCalculation() {
    //  let totalSubTotal = 0;

    //       // Freight charge from freightForm
    //       const freightCharges = Number(this.freightForm?.get('freightCharges')?.value) || 0;
    //       totalSubTotal += freightCharges;

    //       // Charges from API response
    //       if (this.chargingData && Array.isArray(this.chargingData)) {
    //         this.chargingData.forEach((item: any) => {
    //           totalSubTotal += Number(item.charge) || 0;
    //           console.log('charging data',item.charge)

    //         });
    //       }

    //       // Patch subtotal in freightForm
    //       this.freightForm.patchValue(
    //         { subTotal: totalSubTotal },
    //         { emitEvent: false }
    //       );
    //       this.totalSubTotal = totalSubTotal;
    //       console.log("Subtotal (Freight + API charges):", totalSubTotal);
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
      { subTotal: totalSubTotal },
      { emitEvent: false }
    );
    this.totalSubTotal = totalSubTotal;
    this.getGSTCalculation();
    console.log("Subtotal (Freight + API charges):", totalSubTotal);
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
  var CFTWeightType = this.step2DetailsList.cftWeightType;
  var CHRGWT: number = Math.max(
  Number(this.invoiceform.value.finalActualWeight) || 0,
  Number(this.invoiceform.value.totalCubicWeight) || 0
);

  var ACTUWT = this.invoiceform.value.totalActualWeight;
  var CFTWeight = this.invoiceform.value.totalCubicWeight;

  this.weightErrorMsg = ''; // reset

  if (this.step2DetailsList.isVolumentric == 'Y') {
    if (CFTWeightType == "A") {
      if (CHRGWT < ACTUWT) {
        this.weightErrorMsg = "Charged Weight must not be less than Actual Weight.";
        return false;
      }
    } else if (CFTWeightType == "V") {
      if (CHRGWT < CFTWeight) {
        this.weightErrorMsg = "Charged Weight must not be less than CFT Weight.";
        return false;
      }
    } else if (CFTWeightType == "H") {
      if (CHRGWT < ACTUWT || CHRGWT < CFTWeight) {
        this.weightErrorMsg = "Charged Weight must be higher than CFT Weight and Actual Weight.";
        return false;
      }
    }
  } else {
    if (CHRGWT < ACTUWT) {
      this.weightErrorMsg = "Charged Weight must not be less than Actual Weight.";
      return false;
    }
  }
 this.weightErrorMsg = '';
  return true;
}

}

