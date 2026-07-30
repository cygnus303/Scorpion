import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { DocketService } from 'app/shared/services/docket.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { PrqService } from 'app/shared/services/prq.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-add-prq',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgSelectModule, BsDatepickerModule, CommonModule],
  providers: [BsModalService],
  templateUrl: './add-prq.component.html',
  styleUrl: './add-prq.component.scss'
})
export class AddPrqComponent {
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  public modalRef!: BsModalRef;
  public PRQType: string = '';
  public transportModes: any[] = [];
  public coldChainCategories: any[] = [
    { name: 'Chiller', value: 'Chiller' },
    { name: 'Refer', value: 'Refer' }
  ];

  public emailData: any[] = [];
  public customerData: any[] = [];
  public isCustomerLoading: boolean = false;
  public isEmailLoading: boolean = false;
  public isPincodeLoading: boolean = false;
  public isDestPincodeLoading: boolean = false;
  public customerNotFoundText: string = 'Please enter 3 more characters';
  public emailNotFoundText: string = 'Please enter 3 more characters';
  public pincodeNotFoundText: string = 'Please enter 2 more characters';
  public destPincodeNotFoundText: string = 'Please enter 2 more characters';
  public consignorPincodeData: any[] = [];
  public isConsignorPincodeLoading: boolean = false;
  public consignorPincodeSearchSubject: Subject<string> = new Subject<string>();
  public consignorPincodeNotFoundText: string = 'Please enter 2 more characters';
  public consigneePincodeData: any[] = [];
  public isConsigneePincodeLoading: boolean = false;
  public consigneePincodeSearchSubject: Subject<string> = new Subject<string>();
  public consigneePincodeNotFoundText: string = 'Please enter 2 more characters';
  public searchSubject: Subject<string> = new Subject<string>();
  public customerSearchSubject: Subject<string> = new Subject<string>();
  public pincodeSearchSubject: Subject<string> = new Subject<string>();
  public destPincodeSearchSubject: Subject<string> = new Subject<string>();
  public prqForm!: FormGroup;
  public pincodeData: any[] = [];
  public destPincodeData: any[] = [];
  public fleetTypeData: any[] = [];
  public serviceData: any[] = [];
  public PRQNo: any;
  public vehicleCountList = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, text: (i + 1).toString() }));
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService,
    private sweetAlertService: SweetAlertService,
    private docketService: DocketService,
    private prqService: PrqService,
    private basicDetailService: BasicDetailService,
    private dynamicDataService: DynamicDataService
  ) { }

  ngOnInit(): void {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.initForm();

    // Customer Search Subscription
    this.customerSearchSubject.pipe(debounceTime(400)).subscribe((term: string) => {
      if (term?.trim() && term.length >= 3) {
        this.isCustomerLoading = true;
        this.prqService.getCustomerList(term).subscribe({
          next: (res: any) => {
            this.customerData = res?.data || [];
            this.isCustomerLoading = false;
          },
          error: () => {
            this.customerData = [];
            this.isCustomerLoading = false;
          }
        });
      } else {
        this.customerData = [];
        this.isCustomerLoading = false;
      }
    });

    // Pickup Pincode Search Subscription
    this.pincodeSearchSubject.pipe(debounceTime(400)).subscribe((term: string) => {
      if (term?.trim() && term.length >= 3) {
        this.getPincodeData(term, 'pickup');
      } else {
        this.pincodeData = [];
        this.pincodeNotFoundText = 'Please enter 3 more characters';
      }
    });

    // Destination Pincode Search Subscription
    this.destPincodeSearchSubject.pipe(debounceTime(400)).subscribe((term: string) => {
      if (term?.trim() && term.length >= 3) {
        this.getPincodeData(term, 'delivery');
      } else {
        this.destPincodeData = [];
        this.destPincodeNotFoundText = 'Please enter 3 more characters';
      }
    });

    // Consignor Pincode Search Subscription
    this.consignorPincodeSearchSubject.pipe(debounceTime(400)).subscribe((term: string) => {
      if (term?.trim() && term.length >= 2) {
        this.getPincodeData(term, 'consignor');
      } else {
        this.consignorPincodeData = [];
        this.consignorPincodeNotFoundText = 'Please enter 3 more characters';
      }
    });

    // Consignee Pincode Search Subscription
    this.consigneePincodeSearchSubject.pipe(debounceTime(400)).subscribe((term: string) => {
      if (term?.trim() && term.length >= 2) {
        this.getPincodeData(term, 'consignee');
      } else {
        this.consigneePincodeData = [];
        this.consigneePincodeNotFoundText = 'Please enter 3 more characters';
      }
    });
  }

  getPincodeData(term: string, type: 'pickup' | 'delivery' | 'consignor' | 'consignee') {
    const payload = {
      "FilterJson": {
        "ReportId": "223",
        "Prefix": term
      }
    };

    if (type === 'pickup') {
      this.isPincodeLoading = true;
      this.pincodeNotFoundText = 'Loading...';
    } else if (type === 'delivery') {
      this.isDestPincodeLoading = true;
      this.destPincodeNotFoundText = 'Loading...';
    } else if (type === 'consignor') {
      this.isConsignorPincodeLoading = true;
      this.consignorPincodeNotFoundText = 'Loading...';
    } else if (type === 'consignee') {
      this.isConsigneePincodeLoading = true;
      this.consigneePincodeNotFoundText = 'Loading...';
    }

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        const data = res.Table1 || [];
        if (type === 'pickup') {
          this.pincodeData = data;
          this.isPincodeLoading = false;
          if (data.length === 0) this.pincodeNotFoundText = 'No pincode found';
        } else if (type === 'delivery') {
          this.destPincodeData = data;
          this.isDestPincodeLoading = false;
          if (data.length === 0) this.destPincodeNotFoundText = 'No pincode found';
        } else if (type === 'consignor') {
          this.consignorPincodeData = data;
          this.isConsignorPincodeLoading = false;
          if (data.length === 0) this.consignorPincodeNotFoundText = 'No pincode found';
        } else if (type === 'consignee') {
          this.consigneePincodeData = data;
          this.isConsigneePincodeLoading = false;
          if (data.length === 0) this.consigneePincodeNotFoundText = 'No pincode found';
        }
      },
      error: () => {
        if (type === 'pickup') {
          this.pincodeData = [];
          this.isPincodeLoading = false;
          this.pincodeNotFoundText = 'Error fetching data';
        } else if (type === 'delivery') {
          this.destPincodeData = [];
          this.isDestPincodeLoading = false;
          this.destPincodeNotFoundText = 'Error fetching data';
        } else if (type === 'consignor') {
          this.consignorPincodeData = [];
          this.isConsignorPincodeLoading = false;
          this.consignorPincodeNotFoundText = 'Error fetching data';
        } else if (type === 'consignee') {
          this.consigneePincodeData = [];
          this.isConsigneePincodeLoading = false;
          this.consigneePincodeNotFoundText = 'Error fetching data';
        }
      }
    });
  }

  showPopup(prqNo?: string) {
    this.PRQNo = prqNo;
    this.initForm();
    // this.getContract();
    this.getFleetType()
    this.modalRef = this.modalService.show(this.Templatepod, {
      backdrop: 'static',
      class: 'modal-lg modal-dialog-centered'
    });
    if (prqNo) {
      this.editPRQ(prqNo);
    }
  }

  rebuildForm() {
    const ewayBill = this.prqForm.get('ewayBill')?.value;
    const serviceType = this.prqForm.get('service_Type')?.value;

    this.initForm();

    this.prqForm.patchValue({
      ewayBill: ewayBill,
      service_Type: serviceType
    });

    this.customerData = [];
    this.pincodeData = [];
    this.destPincodeData = [];
  }

  initForm() {
    this.prqForm = new FormGroup({
      indentNo: new FormControl(null),
      groupCode: new FormControl(null),
      customerCode: new FormControl(null, Validators.required),
      prqDate: new FormControl(new Date(), Validators.required),
      pkgs: new FormControl(null, Validators.required),
      fleetType: new FormControl(null),
      weight: new FormControl('', Validators.required),
      ftlType: new FormControl(null),
      service_Type: new FormControl(null, Validators.required),
      pinCode: new FormControl(null, Validators.required), // Pickup Pin Code
      desPincode: new FormControl(null, Validators.required),
      // consigneeNameAdd: new FormControl('', Validators.required), // Delivery Address
      branchCode: new FormControl(''), // Pickup Branch
      customer_Name: new FormControl(''),
      desBranchCode: new FormControl(''), // Destination Branch
      ewayBill: new FormControl(''),
      fromCity: new FormControl('', Validators.required),
      fromCityCode: new FormControl(''),
      transportMode: new FormControl(null, Validators.required),
      coldChainCategory: new FormControl(null),
      tempRange: new FormControl(''),
      ewayBillNo: new FormControl(''),
      ewayBillDate: new FormControl(''),
      ewayExpDate: new FormControl(''),
      invoiceNo: new FormControl(''),
      invoiceDate: new FormControl(''),
      invoiceValue: new FormControl(''),
      consignorName: new FormControl(''),
      consigneeName: new FormControl(''),
      consignorAddress: new FormControl(''),
      consigneeAddress: new FormControl(''),
      consignorPin: new FormControl(null),
      consigneePin: new FormControl(null)
    });

    this.prqForm.get('service_Type')?.valueChanges.subscribe((val) => {
      const ftlControl = this.prqForm.get('ftlType');
      if (val === 'FTL') {
        ftlControl?.setValidators(Validators.required);
      } else {
        ftlControl?.clearValidators();
      }
      ftlControl?.updateValueAndValidity();
    });

    this.prqForm.get('ewayBill')?.valueChanges.subscribe((val) => {
      const ewayFields = ['ewayBillNo', 'ewayBillDate', 'ewayExpDate', 'invoiceNo', 'invoiceDate', 'invoiceValue'];
      ewayFields.forEach(field => {
        const control = this.prqForm.get(field);
        if (val === 'with') {
          control?.setValidators(Validators.required);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      });
    });
  }

  onClose() {
    this.modalRef.hide();
    this.initForm();
    this.customerData = [];
    this.customerNotFoundText = 'Please enter 3 more characters';
    this.emailData = [];
    this.emailNotFoundText = 'Please enter 3 more characters';
    this.pincodeData = [];
    this.destPincodeData = [];
    this.pincodeNotFoundText = 'Please enter 3 more characters';
    this.destPincodeNotFoundText = 'Please enter 3 more characters';
  }

  onChangePincode(event: any) {
    this.pincodeData = [];
    this.pincodeNotFoundText = 'Please enter 3 more characters';
    this.prqService.getBranchCityFromPincode(event?.Value).subscribe((res: any) => {
      if (res.success && res.data && res.data.length > 0) {
        const loc = res.data[0];
        this.prqForm.patchValue({
          branchCode: loc.branch,
          fromCity: loc.city,
          fromCityCode: loc.cityCode
        });
      }
    });
  }

  onChangeDestPincode(event: any) {
    this.destPincodeData = [];
    this.destPincodeNotFoundText = 'Please enter 3 more characters';
    this.prqService.getBranchCityFromPincode(event?.Value).subscribe((res: any) => {
      if (res.success && res.data && res.data.length > 0) {
        const loc = res.data[0];
        this.prqForm.patchValue({
          desBranchCode: loc.branch
        });
      }
    });
  }

  onCustomerSelect(event: any) {
    if (event && event.text) {
      this.prqForm.patchValue({
        customer_Name: event.text
      });
    } else {
      this.prqForm.patchValue({
        customer_Name: ''
      });
    }
    this.getContract(event?.id);
  }

  onColdChainCategoryChange(event?: any) {
    const category = event?.value || event?.target?.value || (typeof event === 'string' ? event : null) || this.prqForm.get('coldChainCategory')?.value;
    if (category === 'Chiller') {
      this.prqForm.patchValue({ tempRange: '0°C to 25°C' });
    } else if (category === 'Refer') {
      this.prqForm.patchValue({ tempRange: '-0°C to -18°C' });
    } else {
      this.prqForm.patchValue({ tempRange: '' });
    }
  }

  getTransportModes(searchText: string | null = null, mode: any) {
    this.basicDetailService.getGeneralMasterList('TRN', '', '').subscribe({
      next: (response: any) => {
        if (response) {
          this.transportModes = response.data.filter((item: any) => mode.includes(item.codeDesc));
        }
      },
      error: (response: any) => {
        this.sweetAlertService.error(response);
      },
    });
  }

  getContract(customerId?: any) {
    const custCode = 'C00120010';
    // const custCode = this.docketService.baseUsername;
    this.prqService.getContractDetail(customerId).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          const serviceTypesStr = response.data[0].serviceTypes || '';
          const transportTypesStr = response.data[0].transportTypes || '';
          this.getTransportModes('', transportTypesStr)

          this.serviceData = serviceTypesStr.split(',').map((s: string) => ({ name: s.trim(), value: s.trim() })).filter((s: any) => s.value !== '');
        }
      },
      error: (response: any) => {
        this.sweetAlertService.error(response);
      },
    });
  }

  getFleetType(searchText: string | null = null) {
    this.basicDetailService.getGeneralMasterList('FTLTYP', '', '').subscribe({
      next: (response: any) => {
        if (response) {
          this.fleetTypeData = response.data;
        }
      }
    });
  }

  formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(+year, +month - 1, +day);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(',', '').toLowerCase();
  };

  editPRQ(prqNo: string) {
    const payload = {
      "FilterJson": {
        "ReportId": "225",
        "PRQNo": prqNo
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response && response.Table1 && response.Table1.length > 0) {
          const data = response.Table1[0];
          if (data.CustomerCode) {
            this.customerData = [{ id: data.CustomerCode, text: data.CustomerName }];
            this.getContract(data.CustomerCode);
          }
          if (data.PickupPincode) this.pincodeData = [{ Value: data.PickupPincode, Text: data.PickupPincode }];
          if (data.DeliveryPincode) this.destPincodeData = [{ Value: data.DeliveryPincode, Text: data.DeliveryPincode }];
          if (data.ConsignorPincode) this.consignorPincodeData = [{ Value: data.ConsignorPincode, Text: data.ConsignorPincode }];
          if (data.ConsigneePincode) this.consigneePincodeData = [{ Value: data.ConsigneePincode, Text: data.ConsigneePincode }];
          setTimeout(() => {
            // Map the available fields from ReportId 222
            this.prqForm.patchValue({
              groupCode: data.PRQNo,
              ewayBill: data.EwayBillType,
              prqDate: data.PRQDate ? new Date(data.PRQDate) : new Date(),
              service_Type: data.ServiceType,
              customerCode: data.CustomerCode,
              fromCity: data.FromCity,
              customer_Name: data.CustomerName,
              pkgs: data.PKGS,
              weight: data.ApproxWeight,
              transportMode: data.TransitMode,
              ftlType: data.FTLType,
              pinCode: data.PickupPincode,
              desPincode: data.DeliveryPincode,
              desBranchCode: data.ToCity,
              coldChainCategory: data.ColdChainCategory,
              tempRange: data.TempRange,
              consignorName: data.ConsignorName,
              consigneeName: data.ConsigneeName,
              consignorAddress: data.ConsignorAddress,
              consigneeAddress: data.ConsigneeAddress,
              consignorPin: data.ConsignorPincode,
              consigneePin: data.ConsigneePincode,
              ewayBillNo:data.EWayBillNo,
              ewayBillDate:data.EWayBillDate,
              ewayExpDate:data.EWayBillExpiryDate,
              invoiceNo:data.InvoiceNo,
              invoiceDate:data.InvoiceDate,
              invoiceValue:data.InvoiceValue
            });
          }, 500);
        }

      },
      error: (response: any) => {
        this.sweetAlertService.error(response);
      },
    });
  }
  getEwayBillData(event: any) {
    const search = event.target.value;
    if (search.length.toString() === "12") {
      this.basicDetailService.checkEWayBill(search).subscribe({
        next: (checkRes: any) => {
          if (checkRes.status === "N" && search.length.toString() === "12") {
            // If not exist in ERP, call eWayBillData API
            this.basicDetailService.eWayBillData(search).subscribe({
              next: (response: any) => {
                if (response.status === 1) {
                  const invoiceDate = response.eWayBillInvoiceDate ? new Date(response.eWayBillInvoiceDate) : null;
                  const expiryDate =
                    response.eWayBillExpiredDate && response.eWayBillExpiredDate !== '1900-01-01T00:00:00'
                      ? new Date(response.eWayBillExpiredDate)
                      : null;

                  if (invoiceDate) {
                    const today = new Date();
                    const diffTime = Math.abs(today.getTime() - invoiceDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays > 15) {
                      this.sweetAlertService.warning("Error! E-Way Bill is older than 15 days.");
                      this.prqForm.patchValue({
                        ewayinvoiceDate: null,
                        ewayBillExpiry: null,
                        ewayBillDate: null,
                        invoicedate: null,
                        ewayBillNo: null,
                        invoiceNo: null,
                        declaredvalue: null,
                        transportation_distance: null
                      });
                      return;
                    }
                  }

                  if (expiryDate && expiryDate < new Date()) {
                    this.sweetAlertService.warning("Please Check EWayBill Expired Date !!!!");
                    this.prqForm.patchValue({
                      ewayinvoiceDate: null,
                      ewayBillExpiry: null,
                      ewayBillDate: null,
                      invoicedate: null,
                      ewayBillNo: null,
                      invoiceNo: null,
                      declaredvalue: null,
                      transportation_distance: null
                    });
                    return;
                  }
                  const fmtDate = (dStr: any) => {
                    if (!dStr || dStr === '1900-01-01T00:00:00') return null;
                    const d = new Date(dStr);
                    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                  };

                  if (response.toPincode) {
                    this.consigneePincodeData = [{ Value: response.toPincode.toString(), Text: response.toPincode.toString() }];
                  }
                  if (response.pincode) {
                    this.consignorPincodeData = [{ Value: response.pincode.toString(), Text: response.pincode.toString() }];
                  }

                  this.prqForm.patchValue({
                    ewayinvoiceDate: fmtDate(response.eWayBillInvoiceDate),
                    ewayBillDate: fmtDate(response.invdt),
                    ewayExpDate: fmtDate(response.eWayBillExpiredDate),
                    invoiceDate: fmtDate(response.invdt),
                    ewayBillNo: search,
                    invoiceNo: response.invno,
                    invoiceValue: response.decval,
                    consignorName: response.csgnm,
                    consigneeName: response.csgenm,
                    consignorAddress: response.csgnAdd,
                    consigneeAddress: response.csgeAdd,
                    consigneePin: response.toPincode ? response.toPincode.toString() : null,
                    consignorPin: response.pincode ? response.pincode.toString() : null,
                  })
                }
              },
              error: () => {
                this.sweetAlertService.error("Error !! Unable to fetch EWayBill data.");
              }
            });
          } else {
            this.sweetAlertService.warning("This EWay Bill Already Exist in ERP !!!");
            this.prqForm.patchValue({
              ewayinvoiceDate: null,
              ewayExpDate: null,
              invoicedate: null,
              ewayBillNo: null,
              ewayBillDate: null,
              invoiceNo: null,
              invoiceValue: null
            });
          }
        },
        error: () => {
          this.sweetAlertService.error("Error !! Failed to check EWay Bill in ERP.");
        }
      });

    }else{
      if (search.length > 0 && search.length < 12) {
        this.prqForm.get('ewayBillNo')?.setErrors({ maxlength: true });
        this.prqForm.get('ewayBillNo')?.markAsDirty();
      } else if (search.length === 12 || search.length === 0) {
        this.prqForm.get('ewayBillNo')?.setErrors(null);
      }
    }
  }

  onSubmit() {
    if (this.prqForm.valid) {
      const formData = this.prqForm.getRawValue();
      let branchCode = this.docketService.loginUserList.LocationCode;
      let finyear = this.docketService.loginUserList.FinYear;
      const payload = {
        customerCode: formData.customerCode || '',
        customerName: formData.customer_Name || '',
        pkgs: Number(formData.pkgs) || 0,
        approxWeight: Number(formData.weight) || 0,
        transitMode: formData.transportMode || '',
        ftlType: formData.ftlType || '',
        pickupPincode: formData.pinCode?.toString() || '',
        fromCity: formData.fromCity || '',
        deliveryPincode: formData.desPincode?.toString() || '',
        toCity: formData.desBranchCode || '',
        coldChainCategory: formData.coldChainCategory || '',
        tempRange: formData.tempRange || '',
        ewayBillType: formData.ewayBill || '',
        serviceType: formData.service_Type || '',
        eWayBillNo: formData.ewayBillNo || '',
        eWayBillDateStr: formData.ewayBillDate || '',
        eWayBillExpiryDateStr: formData.ewayExpDate || '',
        invoiceNo: formData.invoiceNo || '',
        invoiceDateStr: formData.invoiceDate || '',
        invoiceValue: Number(formData.invoiceValue) || 0,
        consignorName: formData.consignorName || '',
        consigneeName: formData.consigneeName || '',
        consignorAddress: formData.consignorAddress || '',
        consigneeAddress: formData.consigneeAddress || '',
        consignorPincode: formData.consignorPin?.toString() || '',
        consigneePincode: formData.consigneePin?.toString() || '',
        prqDate: formData.prqDate || '',
        baseLocationCode: branchCode || '',
        baseUserName: this.docketService.loginUserList.BaseUserName || '',
        baseFinYear: finyear,
        type: formData.groupCode ? 'E' : '',
        prqNo: formData.groupCode || ''
      };

      this.prqService.submitPRQ(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.sweetAlertService.success(`${res.data.message} : <b style="color:#0d6efd">${res.data.id}</b>`);
            this.dataEmitter.emit();
            this.onClose();
          } else {
            this.sweetAlertService.error(res.message);
          }
        },
        error: (err) => {
          let errorMessage = err.error?.message;
          if (!errorMessage && err.error?.errors) {
            errorMessage = Object.values(err.error.errors).flat().join('\\n');
          }
          if (!errorMessage) {
            errorMessage = err.error?.title || 'An error occurred';
          }
          this.sweetAlertService.error(errorMessage);
        }
      });
    } else {
      this.prqForm.markAllAsTouched();
      const invalidControls = [];
      const controls = this.prqForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalidControls.push(name);
        }
      }
      console.log('Invalid Controls:', invalidControls);
    }
  }
}
