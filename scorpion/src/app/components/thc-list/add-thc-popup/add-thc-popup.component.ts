import { Component, TemplateRef, ViewChild } from '@angular/core';
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
  public ThcType:string='';
  @ViewChild('TemplateTHC', { static: true }) TemplateTHC!: TemplateRef<any>;

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

  buildForm() {
    const mobileNo = /^[0-9]{10}$/;
    this.ThcForm = this.fb.group({
      tHCDate: [this.formatDateTime(new Date())],
      routeType: [Validators.required],
      actualDeptDate: [this.formatDateTime(new Date())],
      scheduleDeptDate: [this.formatDateTime(new Date())],
      vendorType: [],
      bidType: [null],
      bidNo: [null],
      BiddingVendor:[''],
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
      driver1Licence: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{2}\s?\d{11}$/)]],
      d1_DOB: [''],
      driver1Name: [],
      driver1RTONo: [],
      driver1LicenceValDate: [],
      driver1MobileNo: [null, [Validators.pattern(mobileNo), Validators.required]],
      contractAmount: [0, [Validators.required, Validators.min(1), Validators.max(99999999)]],
      isTDSEnabled: [false],
      tDSOnAmount: [0],
      totalTDSAmount: [0],
      netAmount: [0],
      advanceAmount: [0, this.docketService.loginUserList.Type === '1' ? Validators.required : null],
      balanceAmount: [0],
      advanceLocation: [],
      balanceLocation: [],
      entryBy: [this.docketService.loginUserList.BaseUserName],
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

  showPopup(type: string) {
    this.ThcType = type;
    this.buildForm();
    this.getLocationData();
    this.modalRef = this.modalService.show(this.TemplateTHC, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  closePopup() {
    this.modalRef?.hide();
  }

  getVendorsList(event: any) {
    this.ThcForm.patchValue({
      vendorCode: null
    })
    
    const vendorType = event?.target?.value;
    const bidTypeCtrl = this.ThcForm.get('bidType');
    if (vendorType === '19') {
      bidTypeCtrl?.setValidators([Validators.required]);
    } else {
      bidTypeCtrl?.clearValidators();
      bidTypeCtrl?.setValue(null);
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

  getRoutesFromRouteType(event: any) {
    this.ThcForm.patchValue({
      vendorType: null,
      vendorCode: null,
      routeCode: null
    })

    const selectedRouteType = event?.target?.value;
    const paylaod = {
      routeType: selectedRouteType,
      isEmpty: 'N',
      locationCode: this.docketService.loginUserList.LocationCode
    }
    this.THCService.getRoutesFromRouteType(paylaod).subscribe({
      next: (response: any) => {
        if (response) {
          this.routeNameList = response
        }
      },
      error: (err) => {
        console.error('Error fetching vehicle details:', err.error.message);
        this.sweetAlertService.error(err.error.message)
      }
    });
    if (selectedRouteType === 'S') {
      this.getVehicleType('O')
    }
    if (selectedRouteType === 'A') {
      this.getAirportDetail()
      this.getAirlineList()
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
    this.getTDSDetailsFromVendor(event);
    this.getVehicleFromVendorList(event);
    if (this.ThcForm.value.vendorType === 'XX1') {
      this.GetVehicleTypesForChallanFromRouteVendType()
    } else {
      this.getVehicleType('O')
    }
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

    if (event.value === 'O') {
      this.ThcForm.patchValue({
        vehicleType: '',
        fTLType: null,
        registrationDate: null,
        eNGINENO: '',
        cHASISNO: '',
        rCBOOKNO: '',
        insuranceDate: null,
        fitnessDate: null,
      });
    }
    this.checkInsuranceExpiry();
    this.checkFitnessExpiry();
    this.checkLicenseExpiry();
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
          })
        }
      },
    });
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
      licenseControl?.markAsTouched();
      this.ThcForm.get('d1_DOB')?.markAsTouched();
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

  changeAmountApplicable(event: any) {
    this.ThcForm.patchValue({ tDSOnAmount: event.target.value });
    this.calculateNetAmount()
  }

  calculateNetAmount() {
    const contractAmount = Number(this.ThcForm.get('contractAmount')?.value) || 0;
    const chargesGroup = this.ThcForm.get('charges') as FormGroup;
    let netChargesEffect = 0;

    if (this.chargesDetailsList && this.chargesDetailsList.length) {
      this.chargesDetailsList.forEach(ch => {
        const ctrl = chargesGroup.get(ch.chargecode);
        const val = Number(ctrl?.value) || 0;
        if (ch.operator === '+' || ch.operator === '+') {
          netChargesEffect += val;
        } else if (ch.operator === '-' || ch.operator === '−') {
          netChargesEffect -= val;
        } else {
          netChargesEffect += val;
        }
      });
    } else {
      const telephoneCharges = Number(this.ThcForm.get('telephoneCharges')?.value) || 0;
      const humaliCharges = Number(this.ThcForm.get('humaliCharges')?.value) || 0;
      const mamulCharges = Number(this.ThcForm.get('mamulCharges')?.value) || 0;
      netChargesEffect = telephoneCharges + humaliCharges - mamulCharges;
    }

    const netAmountBeforeTDS = contractAmount + netChargesEffect;

    const staxOnAmount = parseFloat(this.ThcForm.get('tDSOnAmount')?.value || '0');
    const isTDSEnabled = this.ThcForm.get('isTDSEnabled')?.value;
    const tdsRate = parseFloat(this.ThcForm.get('TDSPercent')?.value || '0');
    let tdsAmount = 0;

    if (isTDSEnabled) {
      tdsAmount = this.rounditn((staxOnAmount * tdsRate) / 100, 0);
    }

    const finalNet = netAmountBeforeTDS - tdsAmount;

    this.ThcForm.patchValue({
      totalTDSAmount: tdsAmount.toFixed(2),
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
}
