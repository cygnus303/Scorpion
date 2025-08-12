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
  public Location = 'NIDA';
  public step2DetailsList: any;
  public getGSTNODetailsList: any;
  public GetPincodeOriginList!: any;
  public contractservicecharge: any;
  public gstCalculationList: any;
  public isBillingTBB: boolean = false;
  public isLocalNote: boolean = false;
  public noOfRows: number = 1;
  public groupedCharges: { [ids: number]: any[] } = {};
  public GSTFromTrnMode: any;
  public depth: string = '';
  public flagprocedd: string = '';
  public contractMessage: string = '';
  public freightData: any;
  public chargingData: any;
  public totalSubTotal: any;
  public BaseUserCode = 'CYGNUSTEAM'
  public notPincodeValue = 'Please enter at least 1 characters';
  constructor(private basicDetailService: BasicDetailService) { }

  detailForm() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.basicDetailForm = new FormGroup({
      ewayBillNo: new FormControl(null),
      cNoteNo: new FormControl(null),
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
      isODAApplicable: new FormControl({ value: true, disabled: true }),
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
      consignorEmail: new FormControl(null, [Validators.required, Validators.email]),

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
      riskType: new FormControl('O'),
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
      totalDeclaredValue: new FormControl(0),
      totalNoOfPkgs: new FormControl(0),
      totalCubicWeight: new FormControl(0),
      totalActualWeight: new FormControl(0),

      // Summary row 2
      chargeWeightPerPkg: new FormControl(0),
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
      this.invoiceRows.push(this.createInvoiceRow());
    }
  }

  createInvoiceRow(): FormGroup {
    return new FormGroup({
      ewayBillNo: new FormControl(''),
      ewayBillExpiry: new FormControl(''),
      invoiceValue: new FormControl(0),
      ewayinvoiceDate: new FormControl(''),
      invoiceNo: new FormControl(''),
      declaredValue: new FormControl(0),
      noOfPkgs: new FormControl(0),
      actualWeight: new FormControl(0),
      length: new FormControl(0),
      breadth: new FormControl(0),
      height: new FormControl(0),
      cubicWeight: new FormControl(0),
      invoicedate: new FormControl(this.today),
      declaredvalue: new FormControl(0),
      cubicweight: new FormControl(0),
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
          this.notPincodeValue = 'No matches found';
        } else {
          this.pincodeList = [];
          this.notPincodeValue = '';
        }
      },
      error: () => {
        this.pincodeList = [];
        this.notPincodeValue = '';
      }
    });
  }

  onChangePinCode(event: any) {
    if (!event) return;
    this.basicDetailForm.patchValue({ destination: event.destination });
    this.consignorForm.patchValue({ consigneePincode: event.pinArea });
    this.pincodeList = [];
  
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
          });
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
      customerId: this.basicDetailForm.value.billingParty ||'',
      transType: this.basicDetailForm.value.mode || '',
      exemptServices: this.basicDetailForm.value.exemptServices ? this.basicDetailForm.value.exemptServices : '',
    }
    this.basicDetailService.GetDKTGSTForGTA(payload).subscribe({
      next: (response: any) => {
        if (response) {
          // this.GetPincodeOriginList = response;
          this.basicDetailForm.patchValue({
            sacCode: response.sacCode,
            sacDescription: response.sacCodeDesc,
            // mode: response.transType
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
          });
          this.freightForm.patchValue({
            gstRate: response.codeDesc
          });
          this.GSTFromTrnMode = response;
        }
      }
    });
    this.basicDetailService.contractservicecharge(this.step2DetailsList.contractid, event?.codeId).subscribe({
      next: (response: any) => {
        if (response) {
          this.contractservicecharge = response;
          this.invoiceform.patchValue({
            cft_Ratio: this.contractservicecharge[0].cft_Ratio
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
      "payBas": this.basicDetailForm.value.businessType || '',
      "baseLocation": this.basicDetailForm.value.origin || '',
      "destCd": this.basicDetailForm.value.destination || '',
      "subTotal": this.totalSubTotal,
      "csgngstNo": this.consignorForm.value.consignorGSTNo || '',
      "csgegstNo": this.consignorForm.value.consigneeGSTNo || '',
      "transMode": this.basicDetailForm.value.mode || '',
      "docketDate": formattedDate || '',
      "billingPartyAS": (this.basicDetailForm.value.businessType === 'P01' || this.basicDetailForm.value.businessType === 'P02') ? 'CSGN' : 'CSGE',
      "csgngstState": this.basicDetailForm.value.originState || '',
      "csgegstState": this.basicDetailForm.value.originState || '',
      "gstRateType": this.GSTFromTrnMode.codeDesc || '',
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
            dktTotal: this.gstCalculationList.dkttotal ?? null
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
  GetFreightContractDetails() {
    debugger
    const data = {
      chargeRule: 'NONE',
      baseCode1: 'NONE',
      chargeSubRule: 'NONE',
      baseCode2: 'NONE',
      chargedWeight:Math.max(this.invoiceform.value.totalActualWeight || 0, this.invoiceform.value.totalCubicWeight || 0).toString(),
      contractID: this.step2DetailsList.contractid,
      destination: this.basicDetailForm.value.destination,
      depth: this.depth,
      flagProceed: this.flagprocedd,
      fromCity: this.basicDetailForm.value.fromCity,
      fromstate:this.basicDetailForm.value.originState,
      tostate:this.basicDetailForm.value.destinationState,
      itemCode:'',
      ftlType: this.basicDetailForm.value.typeMovement || '',
      noOfPkgs: this.invoiceform.value.totalNoOfPkgs.toString(),
      chargedWeright: Math.max(this.invoiceform.value.totalActualWeight || 0, this.invoiceform.value.totalCubicWeight || 0).toString(),
      origin: this.basicDetailForm.value.origin,
      payBase: this.basicDetailForm.value.billingType,
      serviceType: this.basicDetailForm.value.serviceType,
      toCity: this.basicDetailForm.value.toCity,
      transMode: this.basicDetailForm.value.mode,
      orderID: this.step2DetailsList.contractid,
      invAmt: this.invoiceform.value.totalDeclaredValue.toString(),
      dockdt: new Date().toISOString(),
      prodcd: this.basicDetailForm.value.contents,
      isPerPieceRate: this.step2DetailsList.isPerPieceRate
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
              .replace(/ /g, '-')
          })
        }
      },
    });
  }

  getOtherChargesDetail(event: any) {
    const chargedWeight = Math.max(
      this.invoiceform.value.finalActualWeight || 0,
      this.invoiceform.value.totalCubicWeight || 0
    ).toString();

    const payload = {
      "chargeRule": 'NONE',
      "baseCode1": 'NONE',
      "chargeSubRule": "NONE",
      "baseCode2": "NONE",
      "chargedWeight": chargedWeight,
      "contractID": this.step2DetailsList.contractid,
      "destination": this.basicDetailForm.value.destination,
      "depth": this.depth,
      "flagProceed": this.flagprocedd,
      "fromCity": this.basicDetailForm.value.fromCity,
      "ftlType": this.basicDetailForm.value.typeMovement || '',
      "noOfPkgs": event?.target?.value?.toString(),
      "origin": this.basicDetailForm.value.origin,
      "payBase": this.basicDetailForm.value.billingType,
      "serviceType": this.basicDetailForm.value.serviceType,
      "toCity": this.basicDetailForm.value.toCity,
      "transMode": this.basicDetailForm.value.mode,
      "orderID": this.step2DetailsList.contractid,
      "invAmt": this.invoiceform.value.totalDeclaredValue?.toString(),
      "dockdt": this.basicDetailForm.value.cNoteDate,
      "prodType": this.basicDetailForm.value.contents,
      "packType": this.basicDetailForm.value.packingType,
      "riskType": this.step2DetailsList.risktype,
      "originPincode": this.consignorForm.value.consignorPincode || 0,
      "destPincode": this.basicDetailForm.value.pincode || 0,
      "floorNo": 0
    };

    // Required fields check
    const allFieldsFilled = Object.values(payload).every(
      value => value !== null && value !== undefined && value !== '' && value !== '0'
    );

    if (!allFieldsFilled) {
      console.warn('Required fields are missing. Skipping API call.');
      return;
    }

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
            }
          });
          let totalSubTotal = 0;

          // Freight charge from freightForm
          const freightCharges = Number(this.freightForm?.get('freightCharges')?.value) || 0;
          totalSubTotal += freightCharges;

          // Charges from API response
          if (this.chargingData && Array.isArray(this.chargingData)) {
            this.chargingData.forEach((item: any) => {
              totalSubTotal += Number(item.charge) || 0;
            });
          }

          // Patch subtotal in freightForm
          this.freightForm.patchValue(
            { subTotal: totalSubTotal },
            { emitEvent: false }
          );
          this.totalSubTotal = totalSubTotal;
          console.log("Subtotal (Freight + API charges):", totalSubTotal);
        }
      },
    });
  }
}

