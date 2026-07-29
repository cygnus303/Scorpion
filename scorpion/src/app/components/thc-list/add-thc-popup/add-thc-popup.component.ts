import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonModule, DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, FormControl } from '@angular/forms';
import { generalMasterResponse, StatesFromPartyCodeRepsonse } from 'app/shared/models/general-master.model';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { ChallanService } from 'app/shared/services/challan.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { DocketService } from 'app/shared/services/docket.service';
import { AirportListResponse, ChargesResponse, FlightsListResponse, VehicleTypeListResponse, VendeorsResponse } from 'app/shared/models/thc-master.model';
import { DeliveryAgentService } from 'app/shared/services/delivery-agent.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonDateService } from 'app/shared/services/common-date.service';
import { LocationListResponse } from 'app/shared/models/delivery-agent.model';
import { CustomerService } from 'app/shared/services/customer.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
@Component({
  selector: 'app-add-thc-popup',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, ReactiveFormsModule, BsDatepickerModule],
  providers: [BsModalService],
  templateUrl: './add-thc-popup.component.html',
  styleUrl: './add-thc-popup.component.scss'
})
export class AddThcPopupComponent {
  public modalRef!: BsModalRef;
  public routeNameList: StatesFromPartyCodeRepsonse[] = [];
  public vendorsList: VendeorsResponse[] = [];
  public vehicleNoList: any[] = [];
  public ThcForm!: FormGroup;
  public selectedDigit: number = 10;
  public vehicleTypeList: VehicleTypeListResponse[] = [];
  public isVehicleLoading: boolean = false;
  public minDate: Date | undefined;
  public maxDate: Date | undefined;
  public today: Date = new Date();
  public isInsuranceExpired: boolean = false;
  public isFitnessExpired: boolean = false;
  public isLicenseExpired: boolean = false;
  public isPatching: boolean = false;
  public locationData: LocationListResponse[] = [];
  public airportList: AirportListResponse[] = [];
  public airlineList: generalMasterResponse[] = [];
  public flightsList: FlightsListResponse[] = [];
  public isLoadingMF = false;
  public contractAmtMsg: string = '';
  public chargesDetailsList: ChargesResponse[] = [];
  public lastFetchedVehicleNo: string | null = null;
  public ThcType: string = '';
  public bidData: any;
  public isBidVendorReadonly: boolean = false;
  public isBidDriverReadonly: boolean = false;
  public isBidVehicleReadonly: boolean = false;
  public isBidMobileReadonly: boolean = false;
  public isBidEngineNoReadonly: boolean = false;
  public isBidChassisNoReadonly: boolean = false;
  public isBidRCBookNoReadonly: boolean = false;
  public isBidRegDateReadonly: boolean = false;
  public isBidInsDateReadonly: boolean = false;
  public selectedMfs: any[] = [];
  public isSubmitting :boolean=false;
  public isBidFitDateReadonly: boolean = false;
  @ViewChild('TemplateTHC', { static: true }) TemplateTHC!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService,
    public challanService: ChallanService,
    private sweetAlertService: SweetAlertService,
    private THCService: THCMasterService,
    public docketService: DocketService,
    public fb: FormBuilder,
    private datePipe: DatePipe,
    public basicDetailService: BasicDetailService,
    public commonDateService: CommonDateService,
    private deliveryAgentService: DeliveryAgentService,
    private customerService: CustomerService,
    private dynamicDataService: DynamicDataService,
    public generalMasterService: GeneralMasterService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

  public isRouteModeAutoSelected: boolean = false;

  buildForm() {
    const mobileNo = /^[0-9]{10}$/;
    
    let initialRouteType = this.ThcType === 'A' ? 'S' : null;
    this.isRouteModeAutoSelected = false;
    
    if (this.ThcType === 'A' && this.selectedMfs && this.selectedMfs.length > 0) {
      const mode = this.selectedMfs[0].routE_MODE;
      if (mode && mode.toUpperCase() === 'AIR') {
        initialRouteType = 'A';
      } else if (mode && mode.toUpperCase() === 'ROAD') {
        initialRouteType = 'S';
      }
      this.isRouteModeAutoSelected = true;
    }

    this.ThcForm = this.fb.group({
      tHCDate: [this.formatDateTime(new Date())],
      routeType: [initialRouteType, Validators.required],
      actualDeptDate: [this.formatDateTime(new Date())],
      scheduleDeptDate: [this.formatDateTime(new Date())],
      vendorType: [],
      bidType: [null],
      bidNo: [null],
      BiddingVendor: [null],
      vendorCode: [],
      lorryOwnerPanNo: [],
      vendorName: [],
      ERD: [],
      vehicleNo: [],
      mKTVehicleNo: [],
      vehicleType: [null],
      fTLType: [],
      registrationDate: [],
      eNGINENO: [],
      cHASISNO: [],
      rCBOOKNO: [],
      insuranceDate: [],
      fitnessDate: [],
      driver1Licence: ['', initialRouteType === 'S' ? [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{2}\s?\d{11}$/)] : [Validators.pattern(/^[A-Za-z]{2}\d{2}\s?\d{11}$/)]],
      d1_DOB: [''],
      driver1Name: [],
      driver1RTONo: [],
      driver1LicenceValDate: [],
      driver1MobileNo: [null, initialRouteType === 'S' ? [Validators.pattern(mobileNo), Validators.required] : [Validators.pattern(mobileNo)]],
      contractAmount: [0, [Validators.required, Validators.min(1), Validators.max(99999999)]],
      isTDSEnabled: [false],
      tDSOnAmount: [0],
      totalTDSAmount: [0],
      netAmount: [0],
      advanceAmount: [0, this.docketService.loginUserList.Type === '1' ? Validators.required : null],
      balanceAmount: [0],
      advanceLocation: [],
      balanceLocation: [],
      entryBy: [],
      vehicleCapacity: [],
      isOverLoad: [],
      wtLoaded: [0],
      vehicleCapacityUti: [0],
      overLoadReason: [],
      sealNo: [],
      TDSAcccode: [],
      vehicleNO: [null],
      TDSPercent: [],
      PANNO: [],
      charges: new FormGroup({}),
      flightCode: [],
      airportCode: [],
      airLine: [],
      flightScheduleTime: [],
      airWayBillNo: [],
      routeCode: [null, Validators.required],
    }, { validators: this.advanceNotGreaterThanNet.bind(this) });

    this.ThcForm.get('routeType')?.valueChanges.subscribe(val => {
      const licenceCtrl = this.ThcForm.get('driver1Licence');
      const mobileCtrl = this.ThcForm.get('driver1MobileNo');
      
      const hiddenFields = [
        'registrationDate', 'eNGINENO', 'cHASISNO', 'rCBOOKNO', 
        'insuranceDate', 'fitnessDate', 'driver1Name', 
        'driver1RTONo', 'driver1LicenceValDate'
      ];

      if (val === 'S') {
        licenceCtrl?.setValidators([Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{2}\s?\d{11}$/)]);
        mobileCtrl?.setValidators([Validators.pattern(mobileNo), Validators.required]);
      } else {
        licenceCtrl?.setValidators([Validators.pattern(/^[A-Za-z]{2}\d{2}\s?\d{11}$/)]);
        mobileCtrl?.setValidators([Validators.pattern(mobileNo)]);
        
        hiddenFields.forEach(f => {
          const ctrl = this.ThcForm.get(f);
          if (ctrl) {
            ctrl.clearValidators();
            ctrl.updateValueAndValidity();
          }
        });
      }
      licenceCtrl?.updateValueAndValidity();
      mobileCtrl?.updateValueAndValidity();
    });

    this.ThcForm.get('bidType')?.valueChanges.subscribe(val => {
      this.isBidVendorReadonly = false;
      this.isBidDriverReadonly = false;
      this.isBidVehicleReadonly = false;
      this.isBidMobileReadonly = false;
      this.isBidEngineNoReadonly = false;
      this.isBidChassisNoReadonly = false;
      this.isBidRCBookNoReadonly = false;
      this.isBidRegDateReadonly = false;
      this.isBidInsDateReadonly = false;
      this.isBidFitDateReadonly = false;
      const vendorType = this.ThcForm.get('vendorType')?.value;
      const biddingVendorCtrl = this.ThcForm.get('BiddingVendor');

      if (vendorType === '19' && val === 'With') {
        biddingVendorCtrl?.setValidators([Validators.required]);
        this.getBidDetail();
        this.ThcForm.patchValue({ vehicleNO: 'O' });
      } else {
        biddingVendorCtrl?.clearValidators();
        biddingVendorCtrl?.setValue(null);
      }
      biddingVendorCtrl?.updateValueAndValidity();
    });

    this.fetchPreparedByEmployee();
  }

  formatDateTime(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = pad(date.getDate());
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${d} ${m} ${y}, ${pad(hours)}:${minutes} ${ampm}`;
  }

  fetchPreparedByEmployee() {
    const searchText = this.docketService.loginUserList?.UserId;
    const baseUserName = this.docketService.loginUserList?.BaseUserName;
    if (!searchText || !baseUserName) return;

    this.customerService.getEmployeeDropdown(searchText, baseUserName).subscribe({
      next: (response: any) => {
        if (Array.isArray(response) && response.length > 0) {
          const emp = response[0];
          const val = emp.id ? `${emp.id} : ${emp.text}` : emp.text;
          this.ThcForm?.get('entryBy')?.setValue(val);
        }
      }
    });
  }

  showPopup(type: string, mfs?: any) {
    this.ThcType = type;
    this.selectedMfs = mfs || [];

    this.buildForm();
    if(type === 'A'){
      this.getRoutesFromMF();
    }
    this.calculateWeightAndUtilization();
    this.getLocationData();
    this.generalMasterService.getOverloadReason();
    this.modalRef = this.modalService.show(this.TemplateTHC, { class: 'modal-xl modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  closePopup() {
    this.modalRef?.hide();
    this.routeNameList = [];
    if (this.ThcForm) {
      this.ThcForm.get('routeCode')?.setValue(null);
    }
  }

  getVendorsList(event: any) {
    this.isBidVendorReadonly = false;
    this.isBidDriverReadonly = false;
    this.isBidVehicleReadonly = false;
    this.isBidMobileReadonly = false;
    this.isBidEngineNoReadonly = false;
    this.isBidChassisNoReadonly = false;
    this.isBidRCBookNoReadonly = false;
    this.isBidRegDateReadonly = false;
    this.isBidInsDateReadonly = false;
    this.isBidFitDateReadonly = false;
    this.ThcForm.patchValue({
      vendorCode: null,
      bidType: null,
      BiddingVendor: null
    });

    const vendorType = event?.target?.value;
    const bidTypeCtrl = this.ThcForm.get('bidType');
    const biddingVendorCtrl = this.ThcForm.get('BiddingVendor');

    if (vendorType === '19' && this.ThcType === 'A') {
      bidTypeCtrl?.setValidators([Validators.required]);
    } else {
      bidTypeCtrl?.clearValidators();
      biddingVendorCtrl?.clearValidators();
      biddingVendorCtrl?.updateValueAndValidity();
    }
    bidTypeCtrl?.updateValueAndValidity();

    const data = {
      vendorType: vendorType,
      branchCode: this.docketService.loginUserList.LocationCode,
      userName: this.docketService.loginUserList.BaseUserName,
      documentType: "1"
    }
    this.THCService.getVendorsList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.vendorsList = response.data;
        }
      },
    });
  }

  getRoutesFromMF(event?: any) {

    const selectedRouteType = event ? event?.target?.value : (this.ThcForm.get('routeType')?.value || 'S');
        // Construct unique ToBH_CODE from selected MFs
    const tobhCodes = this.selectedMfs.map(mf => mf.toBH_CODE).filter(c => !!c);
    const uniqueTobhCodes = [...new Set(tobhCodes)].join(',');

    const payload = {
      FilterJson: {
        ReportId: "671",
        TCBR: this.docketService.loginUserList?.LocationCode || '',
        ToBH_CODE: uniqueTobhCodes,
        Route_Mode: selectedRouteType 
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        const data = res?.data || res || {};
        const table1 = data.Table1 || [];
        // Assuming this populates routeNameList or something similar
        this.routeNameList = table1;
        if (this.routeNameList.length === 0 && this.ThcForm) {
          this.ThcForm.get('routeCode')?.setValue(null);
        }
      },
      error: (err) => console.error('Error fetching dynamic data for THC popup', err)
    });
    if (selectedRouteType === 'S') {
      this.getVehicleType('O')
    }
    if (selectedRouteType === 'A') {
      this.getAirportDetail()
      this.getAirlineList()
    }
  }

  getRoutesFromRouteType(event?: any) {
    if(this.ThcType === 'E'){
 const selectedRouteType = event?.target?.value;
    const paylaod = {
      routeType: selectedRouteType ,
      isEmpty: 'N',
      locationCode: this.docketService.loginUserList.LocationCode
    }
    this.THCService.getRoutesFromRouteType(paylaod).subscribe({
      next: (response: any) => {
        if (response) {
          this.routeNameList = response;
          if (this.routeNameList.length === 0 && this.ThcForm) {
            this.ThcForm.get('routeCode')?.setValue(null);
          }
        } else {
          this.routeNameList = [];
          if (this.ThcForm) {
            this.ThcForm.get('routeCode')?.setValue(null);
          }
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
    if (event.codeId === 'S') {
      this.getVehicleType('O')
    }
    if (event.codeId === 'A') {
      this.getAirportDetail()
      this.getAirlineList()
  }
}else{
  this.getRoutesFromMF()
}
}

  getVehicleType(vehicleNo: string) {
    this.THCService.getVehicleType(vehicleNo).subscribe({
      next: (response: any) => {
        if (response) {
          this.vehicleTypeList = response.data;
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  getPANnumberData(event: any) {
    var vendorName = this.vendorsList.find((x: any) => x.vendor_Code === event)?.vendor_Name;
    if (vendorName) {
      const idx = vendorName.lastIndexOf(':');
      if (idx !== -1) vendorName = vendorName.substring(0, idx).trim();
    }
    this.ThcForm.patchValue({
      vehicleType: null,
      vehicleNO: null,
      vendorName: vendorName || event
    })
    this.THCService.getPANnumber(event).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.ThcForm.patchValue({
            lorryOwnerPanNo: response.data[0]?.panno,
            PANNO: response.data[0]?.panno
          })
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
    // this.getTDSDetailsFromVendor(event);
    this.getVehicleFromVendorList(event);
    // if (this.ThcForm.value.vendorType === 'XX1') {
    //   // this.GetVehicleTypesForChallanFromRouteVendType()
    // } else {
    //   this.getVehicleType('O')
    // }
  }

  getTDSDetailsFromVendor(vendorCode: string) {
    const payload = {
      venderCode: vendorCode
    }
    this.THCService.getTDSDetailsFromVendor(payload).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.ThcForm.patchValue({
            TDSAcccode: response.data.acccode,
            TDSPercent: response.data.tdsPercentage,
            isTDSEnabled: response.data.isTDSApplicable
          })
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
  }
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = months[date.getMonth()];
    return `${day} ${month} ${year}`;
  }


  advanceNotGreaterThanNet(control: AbstractControl) {
    const net = Number(control.get('netAmount')?.value) || 0;
    const adv = Number(control.get('advanceAmount')?.value) || 0;

    return adv > net ? { advanceInvalid: true } : null;
  }

  getVehicleFromVendorList(vendor: string) {
    this.THCService.getvehicleDetailFromVendor(this.ThcForm.value.vendorType, vendor).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.vehicleNoList = response.data;
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  getTripSheetList(event: any) {
    this.ThcForm.patchValue({ mKTVehicleNo: '' });
     if (event.value !== 'O') {
      this.getNewVehicleDetail(event.value)
    } else {
      this.ThcForm.patchValue({
        vehicleType: '',
        fTLType: null,
        registrationDate: null,
        eNGINENO: '',
        cHASISNO: '',
        rCBOOKNO: '',
        // permitDate: null,
        insuranceDate: null,
        fitnessDate: null,
      });
      if (event.value === 'O') {
        this.getVehicleType(event.value)
      }
    }
    this.checkInsuranceExpiry();
    this.checkFitnessExpiry();
    this.checkLicenseExpiry();
  }

    getNewVehicleDetail(vehicleNo: string) {
    this.THCService.getNewVehicleDetail(vehicleNo.toUpperCase()).subscribe({
      next: (response: any) => {
        if (response) {
          this.ThcForm.patchValue({
            vehicleType: response.data.vehicle_Type,
            fTLType: response.data.ftltyPe,
            eNGINENO: response.data.engineNo || '',
            cHASISNO: response.data.chasisNo || '',
            rCBOOKNO: response.data.rcBookNo || '',
            registrationDate: response.data.registrationDt ? new Date(response.data.registrationDt) : null,
            // permitDate: response.data.vehprmdt ? new Date(response.data.vehprmdt) : null,
            insuranceDate: response.data.insuranceValDt ? new Date(response.data.insuranceValDt) : null,
            fitnessDate: response.data.fitnessValDt ? new Date(response.data.fitnessValDt) : null,
            openKM: response.data.startKM
          });
          this.getVehicleCapacity(response.data.vehicle_Type)
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  updateVehicleRequiredValidator() {
    const form = this.ThcForm;
    const vendorType = form.get('vendorType')?.value;
    const vehicleNo = form.get('vehicleNO')?.value;
    const mktVehicleCtrl = form.get('mKTVehicleNo');
    if (vendorType === 'XX' || vehicleNo === 'O') {
      mktVehicleCtrl?.setValidators([Validators.required]);
    } else {
      mktVehicleCtrl?.clearValidators();
    }
    mktVehicleCtrl?.updateValueAndValidity();
  }

  onDigitChange(digit: number) {
    this.selectedDigit = digit;
    this.ThcForm.get('mKTVehicleNo')?.reset('');
  }

  validateVehicleNo() {
    const control = this.ThcForm.get('mKTVehicleNo');
    if (!control) return;
    let value = (control.value || '').toUpperCase();
    let filtered = '';
    const patternMap: { [key: number]: RegExp[] } = {
      7: [/[A-Z]/, /[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/], // GJ01A12
      8: [/[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/], // GJ01AB12
      9: [/[A-Z]/, /[A-Z]/, /\d/, /\d/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/], // GJ01AB123
      10: [/[A-Z]/, /[A-Z]/, /\d/, /\d/, /[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/], // GJ01AB1234
      11: [/[A-Z]/, /[A-Z]/, /\d/, /\d/, /[A-Z]/, /[A-Z]/, /[A-Z]/, /\d/, /\d/, /\d/, /\d/] // GJ01ABC1234
    };
    const pattern = patternMap[this.selectedDigit];
    if (pattern) {
      for (let i = 0; i < value.length && i < pattern.length; i++) {
        const ch = value[i];
        if (pattern[i].test(ch)) filtered += ch;
      }
    } else {
      filtered = value.replace(/[^A-Z0-9]/g, '').slice(0, this.selectedDigit);
    }
    if (filtered.length > this.selectedDigit) {
      filtered = filtered.slice(0, this.selectedDigit);
    }
    control.setValue(filtered, { emitEvent: false });
    if (filtered.length === this.selectedDigit && filtered !== this.lastFetchedVehicleNo) {
      this.lastFetchedVehicleNo = filtered;
      if (filtered.startsWith('TS')) {
        this.ThcForm.patchValue({
          eNGINENO: '',
          cHASISNO: '',
          rCBOOKNO: '',
          registrationDate: null,
          insuranceDate: null,
          fitnessDate: null
        });
      } else {
        this.getVehicleDetail(filtered);
      }
    }
  }

  getVehicleDetail(vehicleNo: string) {
    const params = {
      vehNo: vehicleNo.toUpperCase(),
      baseUserName: this.docketService.loginUserList.BaseUserName
    };
    this.isVehicleLoading = true;
    this.deliveryAgentService.getVehicleDetail(params).subscribe({
      next: (response: any) => {
        this.isVehicleLoading = false;
        if (response) {
          this.ThcForm.patchValue({
            eNGINENO: response.rc_eng_no || '',
            cHASISNO: response.rc_chasi_no || '',
            rCBOOKNO: response.rc_regn_no || '',
            registrationDate: response.rc_regn_dt ? new Date(response.rc_regn_dt) : null,
            insuranceDate: response.rc_insurance_upto ? new Date(response.rc_insurance_upto) : null,
            fitnessDate: response.rc_fit_upto ? new Date(response.rc_fit_upto) : null
          });
        }
      },
      error: (err) => {
        this.isVehicleLoading = false;
        this.ThcForm.patchValue({
          mKTVehicleNo: '',
          eNGINENO: '',
          cHASISNO: '',
          rCBOOKNO: '',
          registrationDate: null,
          insuranceDate: null,
          fitnessDate: null
        });
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  GetVehicleTypesForChallanFromRouteVendType() {
    const payload = {
      vehicleNo: this.ThcForm.value.vehicleNO ? this.ThcForm.value.vehicleNO : 'O',
      routeMode: this.ThcForm.value.routeType ? this.ThcForm.value.routeType : '',
      routeName: this.ThcForm.value.routeCode ? this.ThcForm.value.routeCode : '',
      vendorType: this.ThcForm.value.vendorType ? this.ThcForm.value.vendorType : '',
      vendorCode: this.ThcForm.value.vendorCode ? this.ThcForm.value.vendorCode : '',
      thcType: this.docketService.loginUserList.Type,
      baseLocationCode: this.docketService.loginUserList.LocationCode
    }
    if (this.ThcForm.value.vehicleNO || this.ThcForm.value.routeType || this.ThcForm.value.routeCode ||
      this.ThcForm.value.vendorType || this.ThcForm.value.vendorCode) {
      this.THCService.getVehicleTypesForChallanFromRouteVendType(payload).subscribe({
        next: (response: any) => {
          if (response) {
            this.vehicleTypeList = response.data;
          }
        }
      });
    }
  }

  onChangeVehicleType(event: any) {
    this.getVehicleCapacity(event.typeCode);
    this.ThcForm.patchValue({
      fTLType: event.fleet_Type
    })
  }

  getVehicleCapacity(id: string) {
    this.THCService.getVahicleCapacity(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.ThcForm.patchValue({
            vehicleCapacity: response.data.capacity
          });
          this.calculateWeightAndUtilization();
        }
      },
    });
  }

  calculateWeightAndUtilization() {
    if (!this.ThcForm) return;

    let totalWeight = 0;
    if (this.selectedMfs && Array.isArray(this.selectedMfs)) {
      this.selectedMfs.forEach(item => {
        totalWeight += Number(item.toT_ACTUWT || item.actuwt || item.ArrWeightQty || 0);
      });
    }
    const roundedWeight = Number(totalWeight.toFixed(2));
    this.ThcForm.patchValue({
      wtLoaded: roundedWeight
    });

    const vehicleCapacity = this.ThcForm.value.vehicleCapacity;
    const weightLoaded = roundedWeight;
    if (vehicleCapacity && weightLoaded) {
      const utilization = (weightLoaded / (vehicleCapacity * 1000)) * 100;
      const roundedUtilization = Number(utilization.toFixed(2));
      this.ThcForm.patchValue({
        vehicleCapacityUti: roundedUtilization
      });
    } else {
      this.ThcForm.patchValue({
        vehicleCapacityUti: 0
      });
    }
    if ((this.ThcForm.value.wtLoaded / 1000) > vehicleCapacity) {
      this.ThcForm.patchValue({
        isOverLoad: true
      })
    } else {
      this.ThcForm.patchValue({
        isOverLoad: false
      })
    }
  }


  checkInsuranceExpiry(event?: any) {
    const insurance = event ? event : this.ThcForm.value.insuranceDate;
    this.isInsuranceExpired = this.checkDateExpiry(insurance);
  }

  checkFitnessExpiry(event?: any) {
    const fitness = event ? event : this.ThcForm.value.fitnessDate;
    this.isFitnessExpired = this.checkDateExpiry(fitness);
  }

  checkLicenseExpiry(event?: any) {
    const license = event ? event : this.ThcForm.value.driver1LicenceValDate;
    this.isLicenseExpired = this.checkDateExpiry(license);
  }

  checkDateExpiry(dateValue: any): boolean {
    if (!dateValue) return false; // no message if empty
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  onChangeLicenceNumber(event?: any) {
    if (this.isPatching) { return }
    let dob = this.ThcForm.value.d1_DOB;
    let licenseNo = this.ThcForm.value.driver1Licence?.trim();
    if (event instanceof Date) {
      dob = event;
    }

    else if (event?.target) {
      licenseNo = event.target.value?.trim();
    }

    const licenseControl = this.ThcForm.get('driver1Licence');

    if (!licenseControl || licenseControl.invalid || !dob || !licenseNo) {
      setTimeout(() => {
        licenseControl?.markAsTouched();
        this.ThcForm.get('d1_DOB')?.markAsTouched();
      });
      return;
    }
    const payload = {
      vehicleNo: '', // not needed here
      licenseNo: licenseNo.toUpperCase(),
      dA_Code: null
    }
    this.deliveryAgentService.validationData(payload).subscribe({
      next: (response: any) => {
        if (response?.message === 'No duplicate found. You can proceed to save data.') {
          const params = {
            dlnumber: licenseNo.toUpperCase(),
            dob: dob ? `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}` : '',
            baseUserName: this.docketService.loginUserList.BaseUserName
          };
          this.deliveryAgentService.getLicenceDetail(params).subscribe({
            next: (response: any) => {
              if (response && response.data) {
                this.ThcForm.patchValue({
                  driver1Name: response.data.bioFullName ? response.data.bioFullName : '',
                  driver1RTONo: response.data.omRtoFullname ? response.data.omRtoFullname : '',
                  driver1LicenceValDate: response.data.validTillDate ? new Date(response.data.validTillDate) : null
                });
              }
            },
            error: (err) => {
              console.error('Error fetching license detail:', err);
              this.sweetAlertService.error(err.error.message)
            }
          });
        } else {
          this.sweetAlertService.info(response.message);
          this.ThcForm.patchValue({ driver1Licence: null });
        }
      }
    });
  }

  // changeAmountApplicable(event: any) {
  //   // this.ThcForm.patchValue({ tDSOnAmount: event.target.value });
  //   this.calculateNetAmount()
  // }

  calculateNetAmount() {
    const contractAmount = Number(this.ThcForm.get('contractAmount')?.value) || 0;
    // const chargesGroup = this.ThcForm.get('charges') as FormGroup;
    // let netChargesEffect = 0;

    // if (this.chargesDetailsList && this.chargesDetailsList.length) {
    //   this.chargesDetailsList.forEach(ch => {
    //     const ctrl = chargesGroup.get(ch.chargecode);
    //     const val = Number(ctrl?.value) || 0;
    //     if (ch.operator === '+' || ch.operator === '+') {
    //       netChargesEffect += val;
    //     } else if (ch.operator === '-' || ch.operator === '−') {
    //       netChargesEffect -= val;
    //     } else {
    //       netChargesEffect += val;
    //     }
    //   });
    // } else {
    //   const telephoneCharges = Number(this.ThcForm.get('telephoneCharges')?.value) || 0;
    //   const humaliCharges = Number(this.ThcForm.get('humaliCharges')?.value) || 0;
    //   const mamulCharges = Number(this.ThcForm.get('mamulCharges')?.value) || 0;
    //   netChargesEffect = telephoneCharges + humaliCharges - mamulCharges;
    // }

    // const netAmountBeforeTDS = contractAmount ;

    // const staxOnAmount = parseFloat(this.ThcForm.get('tDSOnAmount')?.value || '0');
    // const isTDSEnabled = this.ThcForm.get('isTDSEnabled')?.value;
    // const tdsRate = parseFloat(this.ThcForm.get('TDSPercent')?.value || '0');
    // let tdsAmount = 0;

    // if (isTDSEnabled) {
    //   tdsAmount = this.rounditn((staxOnAmount * tdsRate) / 100, 0);
    // }

    const finalNet = contractAmount;

    this.ThcForm.patchValue({
      // totalTDSAmount: tdsAmount.toFixed(2),
      netAmount: finalNet.toFixed(2),
    }, { emitEvent: false });

    // vendor-specific balanceAmount behavior (unchanged)
    if (['XX1', '04', '19', 'XX'].includes(this.ThcForm.value.vendorType)) {

      const netAmount = Number(this.ThcForm.get('netAmount')?.value) || 0;
      const advanceAmount = Number(this.ThcForm.get('advanceAmount')?.value) || 0;
      if (netAmount >= advanceAmount) {
        const balanceAmount = netAmount - advanceAmount;
        this.ThcForm.patchValue({ balanceAmount });
      }
    }
  }

  rounditn(value: number, digits: number): number {
    const multiplier = Math.pow(10, digits);
    return Math.round(value * multiplier) / multiplier;
  }

  restoreIfEmpty(controlName: string) {
    const ctrl = this.ThcForm.get(controlName);
    if (ctrl && (ctrl.value === '' || ctrl.value == null)) {
      ctrl.setValue(0);
    }
  }

  clearZero(controlName: string) {
    const ctrl = this.ThcForm.get(controlName);
    if (ctrl?.value === 0 || ctrl?.value === '0') {
      ctrl.setValue('');
    }
  }

  handleContractResponse(response: any) {
    const THCTYPE = this.docketService.loginUserList.Type?.toString(); // '1' | '2' | '3'
    const vendorType = this.ThcForm.value.vendorType;
    const data = response?.data || {};
    const contractID = (data.contractID ?? '').toString();
    const contractExpire = !!data.contractExpire;
    this.contractAmtMsg = '';

    // if ((THCTYPE === '3' && vendorType === '04') || (THCTYPE === '1' && vendorType === 'XX1')) {
    //   this.contractAmtMsg = '';
    // }
    if (!contractExpire && contractID !== '' && THCTYPE !== '2') {
      this.contractAmtMsg = '';
    }
    else if (!contractExpire && contractID !== '' && THCTYPE === '2') {
      this.contractAmtMsg = '';
    }
    else if (contractID === '' && (((THCTYPE === '3' || THCTYPE === '2') && vendorType === '04') || (THCTYPE === '1' && vendorType === 'XX1'))) {
      this.contractAmtMsg = 'Vendor Contract not found';
    }
    else if (THCTYPE === '1' && vendorType === 'XX1') {
      this.contractAmtMsg = 'Vendor Contract has Expired.';
    } else {
      this.contractAmtMsg = '';
    }
  }

  calculateBalanceAmount() {
    const netAmount = Number(this.ThcForm.get('netAmount')?.value) || 0;
    const advanceAmount = Number(this.ThcForm.get('advanceAmount')?.value) || 0;
    if (netAmount >= advanceAmount) {
      const balanceAmount = netAmount - advanceAmount;
      this.ThcForm.patchValue({ balanceAmount });
    }
  }

  getLocationData() {
    this.deliveryAgentService.getLocation().subscribe({
      next: (response) => {
        if (response) {
          this.locationData = response
          this.ThcForm.patchValue({
            balanceLocation: this.docketService.loginUserList.LocationCode,
            advanceLocation: this.docketService.loginUserList.LocationCode
          })
        }
      },
    })
  }

  getERDDate() {
    const raw = this.ThcForm.value.tHCDate;
    const formatted = this.datePipe.transform(raw, "dd MMMM yyyy hh:mm a");
    const payload = {
      routeCode: this.ThcForm.value.routeCode,
      thcDate: formatted
    }
    this.THCService.getERDDate(payload).subscribe({
      next: (response: any) => {
        this.ThcForm.patchValue({
          ERD: response.data.erD_DateTime
        })
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
      }
    });
  }

  getAirportDetail() {
    this.THCService.getAirport(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.airportList = response.data
          this.ThcForm.patchValue({
            airportCode: response.data[0]?.codeId
          });
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  getAirlineList() {
    this.basicDetailService.getGeneralMasterList('ALN ', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.airlineList = response.data;
        }
      },
    });
  }

  getFlights() {
    const payload = {
      airLine: this.ThcForm.value.airLine,
      airport: this.ThcForm.value.airportCode
    }
    if (!payload.airLine || !payload.airport) { return; }
    this.THCService.getFlights(payload).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.flightsList = response.data
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  getFlightSchTime() {
    const payload = {
      flightCode: this.ThcForm.value.flightCode,
      airport: this.ThcForm.value.airportCode
    }
    if (!payload.flightCode || !payload.airport) { return; }
    this.THCService.getFlightSchTime(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.ThcForm.patchValue({ flightScheduleTime: response?.schTime })
        }
      },
      error: (err) => {
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  getBidDetail() {
    this.THCService.getBidDetail(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response: any) => {
        this.bidData = response.data;
      }
    })
  }

  onChangeBid(event: any) {
    let bidNo = event?.bidNo;
    if (!bidNo) {
      this.isBidVendorReadonly = false;
      this.isBidDriverReadonly = false;
      this.isBidVehicleReadonly = false;
      this.isBidMobileReadonly = false;
      this.isBidEngineNoReadonly = false;
      this.isBidChassisNoReadonly = false;
      this.isBidRCBookNoReadonly = false;
      this.isBidRegDateReadonly = false;
      this.isBidInsDateReadonly = false;
      this.isBidFitDateReadonly = false;
      this.ThcForm.patchValue({
        vendorCode: null,
        driver1Name: null,
        mKTVehicleNo: null,
        driver1MobileNo: null,
      });
      if (this.ThcForm.get('bidType')?.value === 'With') {
        this.getVehicleType('O')

      }
      return;
    }
    this.THCService.getDataFromBid(bidNo).subscribe({
      next: (response: any) => {
        this.isBidVendorReadonly = !!response?.vendorCode;
        this.isBidDriverReadonly = !!response?.driverName;
        this.isBidVehicleReadonly = !!response?.vehicleNo;
        this.isBidMobileReadonly = !!response?.driverMobileNo;

        const payload: any = {
          vendorCode: response?.vendorCode || null,
          driver1Name: response?.driverName || null,
          mKTVehicleNo: response?.vehicleNo || null,
          driver1MobileNo: response?.driverMobileNo || null,
        };

        if (this.ThcForm.get('bidType')?.value === 'With') {
          payload.vehicleNO = 'O';
        }

        this.ThcForm.patchValue(payload);

        if (response?.vehicleNo) {
          this.getVehicleDetailFromBid(response?.vehicleNo);
        } else {
          this.ThcForm.patchValue({
            eNGINENO: null,
            cHASISNO: null,
            rCBOOKNO: null,
            registrationDate: null,
            insuranceDate: null,
            fitnessDate: null
          })
          this.isBidEngineNoReadonly = false;
          this.isBidChassisNoReadonly = false;
          this.isBidRCBookNoReadonly = false;
          this.isBidRegDateReadonly = false;
          this.isBidInsDateReadonly = false;
          this.isBidFitDateReadonly = false;
        }
      }
    })
  }

  getVehicleDetailFromBid(vehicleNo: string) {
    const params = {
      vehNo: vehicleNo.toUpperCase(),
      baseUserName: this.docketService.loginUserList.BaseUserName
    };
    this.isVehicleLoading = true;
    this.deliveryAgentService.getVehicleDetail(params).subscribe({
      next: (response: any) => {
        this.isVehicleLoading = false;
        if (response) {
          if (this.isBidVehicleReadonly) {
            this.isBidEngineNoReadonly = !!response.rc_eng_no;
            this.isBidChassisNoReadonly = !!response.rc_chasi_no;
            this.isBidRCBookNoReadonly = !!response.rc_regn_no;
            this.isBidRegDateReadonly = !!response.rc_regn_dt;
            this.isBidInsDateReadonly = !!response.rc_insurance_upto;
            this.isBidFitDateReadonly = !!response.rc_fit_upto;
          } else {
            this.isBidEngineNoReadonly = false;
            this.isBidChassisNoReadonly = false;
            this.isBidRCBookNoReadonly = false;
            this.isBidRegDateReadonly = false;
            this.isBidInsDateReadonly = false;
            this.isBidFitDateReadonly = false;
          }
          this.ThcForm.patchValue({
            eNGINENO: response.rc_eng_no || '',
            cHASISNO: response.rc_chasi_no || '',
            rCBOOKNO: response.rc_regn_no || '',
            registrationDate: response.rc_regn_dt ? new Date(response.rc_regn_dt) : null,
            insuranceDate: response.rc_insurance_upto ? new Date(response.rc_insurance_upto) : null,
            fitnessDate: response.rc_fit_upto ? new Date(response.rc_fit_upto) : null
          });
        }
      },
      error: (err) => {
        this.isVehicleLoading = false;
        this.ThcForm.patchValue({
          mKTVehicleNo: '',
          eNGINENO: '',
          cHASISNO: '',
          rCBOOKNO: '',
          registrationDate: null,
          insuranceDate: null,
          fitnessDate: null
        });
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
  }

  onSubmit() {
    if (this.ThcForm.valid) {
      const formValue = this.ThcForm.value;
      const getISOString = (dateVal: any) => {
        if (!dateVal) return null;
        let d: Date;
        if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
          const [y, m, day] = dateVal.split('-').map(Number);
          d = new Date(y, m - 1, day);
        } else {
          d = new Date(dateVal);
        }
        if (isNaN(d.getTime())) return null;

        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        const hours = ('0' + d.getHours()).slice(-2);
        const minutes = ('0' + d.getMinutes()).slice(-2);
        const seconds = ('0' + d.getSeconds()).slice(-2);
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
      };

      let thcChargeArray: any[] = [];
      if (this.chargesDetailsList && this.chargesDetailsList.length > 0) {
        this.chargesDetailsList.forEach((charge: any) => {
          thcChargeArray.push({
            chargecode: charge.chargecode,
            chargename: charge.chargename,
            operator: charge.operator,
            acccode: charge.acccode,
            chargeAmount: formValue.charges?.[charge.chargecode] ? Number(formValue.charges[charge.chargecode]) : 0,
            cnt: 0
          });
        });
      }


       const payload = {
      "CTH": {
        "ManualTHCNo": "",
        "THCDate": getISOString(formValue.tHCDate) || null,
        "THCBRCD": this.docketService.loginUserList?.LocationCode || "",
        "FROMCITY": "",
        "TOCITY": "",
        "THCType": 1,
        "RouteCategory": "",
        "RouteType": formValue.routeType || "",
        "RouteCode": formValue.routeCode || "",
        "RouteName": formValue.routeCode || "",
        "VehicleNO": formValue.vehicleNO === 'O' ? (formValue.mKTVehicleNo || "") : (formValue.vehicleNO || formValue.vehicleNo || ""),
        "OpenKM": 0.0,
        "TotalManifest": 0.0,
        "FreeSpace": 0.0,
        "WtLoaded": Number(formValue.wtLoaded) || 0.0,
        "IsOverLoad": formValue.isOverLoad || false,
        "OverLoadReason": formValue.overLoadReason || "",
        "VendorCode": formValue.vendorCode || "",
        "VendorName": formValue.vendorName || "",
        "VendorType": formValue.vendorType || "",
        "SUPPLYERNAME": "",
        "AirportCode": formValue.airportCode || "",
        "FlightCode": formValue.flightCode || "",
        "FlightScheduleTime": formValue.flightScheduleTime || "",
        "AirWayBillNo": formValue.airWayBillNo || "",
        "THCRemarks": "",
        "EntryBy": formValue.entryBy || "",
        "LorryOwnerPanNo": formValue.lorryOwnerPanNo || "",
        "SealNo": formValue.sealNo || "",
        "ActualDeptDate": getISOString(formValue.actualDeptDate) || null,
        "ScheduleDeptDate": getISOString(formValue.scheduleDeptDate) || null,
        "ScheduleTime": "",
        "LateDepaturereason": "",
        "IsEmpty": this.ThcType !== 'A',
        "IsCityEnabled": false,
        "DeliveryZone": "",
        "MKTVehicleNo": formValue.mKTVehicleNo || "",
        "VehicleCapacity": Number(formValue.vehicleCapacity) || 0.0,
        "VehicleCapacityUti": Number(formValue.vehicleCapacityUti) || 0.0,
        "TrainName": "",
        "TrainNo": "",
        "RRNo": "",
        "AirLine": formValue.airLine || "",
        "EWayBillNo": "",
        "EWayBillExpiredDate": null,
        "IsMonthlyBillAllow": false,
        "LoadingDate": null,
        "CityRouteCode": "",
        "CityRouteKM": "",
        "LoadingSlipAttachment": "",
        "ApprovedBy": "",
        "BiddingVendor":formValue.biddingVendor || "",
        "ERD": getISOString(formValue.ERD) || null,
        "Version": 0
      },
      "CTFD": {
        "ContractAmount": Number(formValue.contractAmount) || 0.0,
        "StandardContractAmount": 0.0,
        "AdvanceAmount": Number(formValue.advanceAmount) || 0.0,
        "AdvanceLocation": formValue.advanceLocation || "",
        "BalanceAmount": Number(formValue.balanceAmount) || 0.0,
        "BalanceLocation": formValue.balanceLocation || "",
        "PANNO": formValue.PANNO || formValue.lorryOwnerPanNo || "",
        "TotalTDSAmount": Number(formValue.totalTDSAmount) || 0.0,
        "IsMathadi": false,
        "MathadiSlipNo": "",
        "MathadiDate": null,
        "MathadiAmt": 0.0,
        "Is_Local_ODA_id": ""
      },
      "CTVD": {
        "VehicleNO": formValue.vehicleNO === 'O' ? (formValue.mKTVehicleNo || "") : (formValue.vehicleNO || formValue.vehicleNo || ""),
        "FTLType": formValue.fTLType || "",
        "Driver1Name": formValue.driver1Name || "",
        "Driver1MobileNo": formValue.driver1MobileNo || "",
        "Driver1RTONo": formValue.driver1RTONo || "",
        "Driver1Licence": formValue.driver1Licence || "",
        "D1_DOB": getISOString(formValue.d1_DOB) || "",
        "Driver1LicenceValDate": getISOString(formValue.driver1LicenceValDate) || null,
        "Driver2LicenceValDate": null,
        "CHASISNO": formValue.cHASISNO || "",
        "ENGINENO": formValue.eNGINENO || "",
        "RCBOOKNO": formValue.rCBOOKNO || "",
        "RegistrationDate": getISOString(formValue.registrationDate) || null,
        "FitnessDate": getISOString(formValue.fitnessDate) || null,
        "PermitDate": null,
        "InsuranceDate": getISOString(formValue.insuranceDate) || null,
        "VehicleTypeSize": formValue.vehicleType || "",
        "CustomerName": "",
        "Driver": ""
      },
      "ISAttechedVendor": false,
      "ISContractualVendor": false,
      "RateType": "",
       MFList: this.selectedMfs ? this.selectedMfs.map((mf: any) => ({
         TCNO: mf.tcno || "",
         TOT_DKT: mf.toT_DKT || 0,
         TOT_LOAD_PKGS: mf.toT_PKGS || 0,
         TOT_LOAD_ACTWT: mf.toT_ACTUWT || 0,
         IsEnabled: true
       })) : [],
       BaseLocationCode:this.docketService.loginUserList.LocationCode,
       BaseUserName:this.docketService.loginUserList.BaseUserName,
       BaseCompanyCode:this.docketService.loginUserList.Companycode,
       BaseFinYear:this.docketService.loginUserList.FinYear
      };

      console.log(payload);
      
      const formData = new FormData();
      formData.append('jsonrequest', JSON.stringify(payload));
      this.isSubmitting=true;
      this.THCService.thcGeneration(formData).subscribe({
        next: (response: any) => {
          if (response?.success) {
            if (response.data && response.data.isError) {
              const errorMsg = (response.data.message && response.data.message.length > 0)
                ? response.data.message.join(', ')
                : 'An error occurred while generating THC.';
              this.isSubmitting = false;
              this.sweetAlertService.error(errorMsg);
            } else {
              this.isSubmitting=false;
              this.sweetAlertService.success(`THC ${response.data?.docno || ''} Generated Successfully!!`);
              this.closePopup();
              this.dataEmitter.emit();
            }
          } else {
            this.isSubmitting=false;
            this.sweetAlertService.error('Failed to generate THC.');
          }
        },
        error: (err: any) => {
          console.error(err);
          this.isSubmitting=false;
          this.sweetAlertService.error('Something went wrong!');
        }
      });
    } else {
      this.ThcForm.markAllAsTouched();
      const invalidKeys = Object.keys(this.ThcForm.controls).filter(
        key => this.ThcForm.controls[key].invalid
      );
      console.log('Invalid Form Controls:', invalidKeys);
    }
  }
}