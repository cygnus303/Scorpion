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
import { mobileNo } from 'app/shared/constants/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonDateService } from 'app/shared/services/common-date.service';
import { LocationListResponse } from 'app/shared/models/delivery-agent.model';
import { Subject } from 'rxjs';
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
  public routeModeList: generalMasterResponse[] = [];
  public routeNameList: StatesFromPartyCodeRepsonse[] = [];
  private avalablePRSSubject = new Subject<any>();
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
  public isPermitExpired: boolean = false;
  public isLicenseExpired: boolean = false;
  public isPatching: boolean = false;
  public locationData: LocationListResponse[] = [];
  public isFilterApplied: boolean = false;
  public filterList: any;
  public airportList: AirportListResponse[] = [];
  public airlineList: generalMasterResponse[] = [];
  public flightsList: FlightsListResponse[] = [];
  public isLoadingMF = false;
  public contractAmtMsg: string = '';
  public chargesDetailsList: ChargesResponse[] = [];
  public lastFetchedVehicleNo: string | null = null;
  public ThcType:string='';
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;

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
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }

  }

  buildForm() {
    this.ThcForm = this.fb.group({
      manualTHCNo: ['N/A'],
      tHCDate: [this.formatDateTime(new Date())],
      // loadingDate: [new Date()],
      isEmpty: [],
      routeType: [Validators.required],
      routeName: [],
      actualDeptDate: [this.formatDateTime(new Date())],
      scheduleDeptDate: [this.formatDateTime(new Date())],
      // CityRouteKM: [],
      vendorType: [],
      vendorCode: [],
      lorryOwnerPanNo: [],
      // fromAddress: [],
      // toAddress: [],
      distanceInKM: [],
      from_City: [],
      to_City: [],
      vendorName: [],
      // FROMCITY: [Validators.required],
      // TOCITY: [Validators.required],
      ERD: [],
      loadingSlipAttachment: [],
      vehicleNo: [],
      mKTVehicleNo: [],
      tripSheetNo: [],
      vehicleType: [null],
      fTLType: [],
      registrationDate: [],
      eNGINENO: [],
      cHASISNO: [],
      rCBOOKNO: [],
      // permitDate : [],
      insuranceDate: [],
      fitnessDate: [],
      driver1Licence: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{2}\s?\d{11}$/)]],
      d1_DOB: [''],
      driver1Name: [],
      driver1RTONo: [],
      driver1LicenceValDate: [],
      driver1MobileNo: [null, [Validators.pattern(mobileNo), ...([Validators.required])]],
      driver2Name: [],
      driver2MobileNo: [null, [Validators.pattern(mobileNo)]],
      driver2Licence: [],
      driver2RTONo: [],
      driver2LicenceValDate: [],
      deliveryAgent: [],
      DeliveryAgentName: [],
      deliveryAgentMoNo: [],
      eWayBillNo: [],
      eWayBillExpiredDate: [],
      approvedBy: [null],
      is_Local_ODA_id: [],
      totalDockets: [Validators.required, Validators.min(1)],
      contractAmount: [0, [Validators.required, Validators.min(1), Validators.max(99999999)]],
      isTDSEnabled: [],
      tDSOnAmount: [0],
      totalTDSAmount: [0],
      netAmount: [0],
      advanceAmount: [0, this.docketService.loginUserList.Type === '1' ? Validators.required : null],
      balanceAmount: [0],
      advanceLocation: [],
      balanceLocation: [],
      entryBy: [this.docketService.loginUserList.BaseUserName],
      openKM: [0],
      closeKM: [],
      vehicleCapacity: [],
      THCRemarks: [],
      isOverLoad: [],
      wtLoaded: [0],
      vehicleCapacityUti: [0],
      overLoadReason: [],
      deliveryZone: [],
      lateDepaturereason: [],
      freeSpace: [],
      sealNo: [],
      standardContractAmount: [],
      isMonthlyBillAllow: [],
      TDSAcccode: [],
      vehicleNO: [null],
      avalabledocketinPRS: new FormArray([]),
      avalableForTHC: new FormArray([]),
      TDSPercent: [],
      Loadingcharge: [],
      PANNO: [],
      // telephoneCharges: [0],
      // humaliCharges: [0],
      // mamulCharges: [0],
      charges: new FormGroup({}),
      flightCode: [],
      airportCode: [],
      trainNo: [],
      trainName: [],
      RRNo: [],
      airLine: [],
      flightScheduleTime: [],
      airWayBillNo: [],
      TotalManifest: [Validators.required, Validators.min(1)],
      routeCode: [null, Validators.required],
      customerName: [],
      vendorChargesCode: [],
      rate: [],
      ISNEWDA: [false],
      VendName: [],
      maxLimit: [],
      IsMonthly: [false]
    }, { validators: this.advanceNotGreaterThanNet.bind(this) })
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

  showPopup(type:string) {
    this.ThcType=type;
    this.buildForm();
    this.challanDateAccess()
    this.isFilterApplied = true;
    this.getERDDate();
    // this.getChargesDetails();
    this.getLocationData();
    // this.getRouteMode();
    // this.getDepartmentReason();
    // this.getTDSLedgerList();
    // this.getApprovedByData();

    // const allowedVendorCodes = ['04', 'XX1', 'XX5'];
    // this.challanService.vendorTypeList = this.challanService.vendtyData.filter((x: any) => allowedVendorCodes.includes(x.codeId));

    // this.ThcForm.get('netAmount')?.valueChanges.subscribe(() => {
    //   this.ThcForm.updateValueAndValidity({ onlySelf: false });
    // });

    // this.ThcForm.get('advanceAmount')?.valueChanges.subscribe(() => {
    //   this.ThcForm.updateValueAndValidity({ onlySelf: false });
    // });

    // this.ThcForm.get('isEmpty')?.valueChanges.subscribe((isEmpty: boolean) => {
    //   const approvedByCtrl = this.ThcForm.get('approvedBy');
    //   if (isEmpty) {
    //     approvedByCtrl?.setValidators([Validators.required]);
    //     this.ThcForm.patchValue({ customerName: null, routeCode: null });
    //   } else {
    //     approvedByCtrl?.clearValidators();
    //     approvedByCtrl?.setValue(null);  // optional → reset field
    //   }
    //   approvedByCtrl?.updateValueAndValidity();
    // });

    const dt = this.docketService.bsValue;
    // this.actualDeptTime = this.formatTime(dt);
    this.challanDateAccess();


    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  challanDateAccess() {
    const payload = {
      moduleCode: '04',
      baseUserName: this.docketService.baseUsername
    };
    this.commonDateService.userDateSelection(payload).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          const rule = res[0];
          this.minDate = new Date(rule.min_Date);
          if (rule.backDate_Days && rule.backDate_Days > 0) {
            const today = new Date();
            this.minDate = new Date(today.setDate(today.getDate() - rule.backDate_Days));
          }
          this.maxDate = new Date();
        }
      }
    });
  }

  public buildMfGroup(item: any): FormGroup {
    return new FormGroup({
      selected: new FormControl(false),
      TCNO: new FormControl(item.tcno || ''),
      Manual: new FormControl(item.manual || ''),
      TCBR: new FormControl(item.tcbr || ''),
      TC_Date: new FormControl(item.tC_Date || item.tcdt_ddmmyyyy || ''),
      ToBH_CODE: new FormControl(item.toBH_CODE || ''),
      TOT_DKT: new FormControl(item.toT_DKT ?? 0),
      Packages: new FormControl(item.packages || ''),
      Weight: new FormControl(item.weight || ''),
      TotalInternalDocument: new FormControl(item.totalInternalDocument ?? 0),
      VehicleNo: new FormControl(item.vehicleNo || ''),
      TOT_LOAD_PKGS: new FormControl(item.toT_LOAD_PKGS || ''),
      TOT_LOAD_ACTWT: new FormControl(item.toT_LOAD_ACTWT || ''),
      MyRouteName: new FormControl(item.myRouteName || ''),
      tcdt_ddmmyyyy: new FormControl(item.tcdt_ddmmyyyy || '')
    });
  }

  get avalabledocket(): FormArray {
    return this.ThcForm.get('avalabledocketinPRS') as FormArray;
  }

  closePopup() {
    this.modalRef?.hide();
  }

  getVendorsList(event: any) {
    this.ThcForm.patchValue({
      vendorCode: null
    })
    const data = {
      vendorType: event?.target?.value,
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
    if (this.ThcForm.value.vendorType === 'XX4' || this.ThcForm.value.vendorType === 'XX1') {
      this.GetVehicleTypesForChallanFromRouteVendType()
    } else {
      this.getVehicleType('O')
    }
    if (this.ThcForm.value.vendorType === '04') {
      this.avalabledocketinPRS(event);
    }
    this.getContractDetail()
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

  avalabledocketinPRS(event?: any) {
    if (this.docketService.loginUserList.Type === '1') {
      return;
    }
    if (this.ThcForm.value?.vendorType !== '04' && event) {
      return;
    }
    const data = this.challanService.filterList;
    const payload = {
      fromdt: this.formatDate(data?.dateRange[0]),
      todt: this.formatDate(data?.dateRange[1]),
      dttyp: data.dttyp ? data.dttyp : '',
      paybas: data.paybas ? data.paybas : 'ALL',
      trn: data.trnMod ? data.trnMod : 'ALL',
      bustyp: data.bustyp ? data.bustyp : 'ALL',
      status: this.ThcForm.value?.vendorType === '04' ? 'B' : 'P',
      doctyp: this.docketService.loginUserList.Type === '2' ? "PRS" : "DRS",
      baseLocationCode: this.docketService.loginUserList.LocationCode,
      docketList: data.docketList ? data.docketList : '',
      alloted_To: this.ThcForm.value?.vendorType === '04' ? this.ThcForm.value.vendorCode : '',
      loadingBy: data.loadingBy,
      chrgType: data.chrgType ? data.chrgType : "ALL",
      odaType: data.odaType ? data.odaType : '',
      baseCompanyCode: this.docketService.loginUserList.Companycode,
      flag: data.flag,
    };

    this.avalablePRSSubject.next(payload);

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
      // this.getNewVehicleDetail(event.value)
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
        // this.getVehicleType(event.value)
      }
    }
    this.checkInsuranceExpiry();
    this.checkFitnessExpiry();
    this.checkLicenseExpiry()
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
            // permitDate: response.rc_permit_valid_upto ? new Date(response.rc_permit_valid_upto) : null,
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
    console.log(event);
    console.log(this.ThcForm.get('vehicleType')?.value, 'vehicleType')
    console.log(this.ThcForm.get('fTLType')?.value, 'fTLType')
  }

  getVehicleCapacity(id: string) {
    this.THCService.getVahicleCapacity(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.ThcForm.patchValue({
            vehicleCapacity: response.data.capacity,
            // TDSAcccode:response.data.acccode
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
    //   this.challanForm.patchValue({
    //     balanceAmount: finalNet.toFixed(2)
    //   }, { emitEvent: false });
    // }

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

  getContractDetail(ctrl?: AbstractControl) {
    this.contractAmtMsg = '';
    const docket = ctrl?.value;
    const payload = {
      thctype: this.docketService.loginUserList.Type,
      totalWeight: Number(this.ThcForm.value.wtLoaded),
      weightAdjust: 0,
      isAllowAdhoc: false,
      isAdhoc: false,
      isAllowTAM: false,
      vendorCode: this.ThcForm.value.vendorCode,
      routeCode: this.ThcForm.value.routeCode || '',
      routeMODE: this.ThcForm.value.routeType || '',
      ftL_Type: this.ThcForm.value.fTLType || '',
      vehicle: this.ThcForm.value.vehicleNO || '',
      from_City: this.ThcForm.value.FROMCITY || '',
      to_City: this.ThcForm.value.TOCITY || '',
      paybas: docket?.PayBas ? docket?.PayBas : this.avalabledocket.controls[0]?.value?.PayBas || '',
      dockno: docket?.DOCKNO ? docket?.DOCKNO : this.avalabledocket.controls[0]?.value?.DOCKNO || '',
    };
    if (payload.vendorCode !== "" && payload.vendorCode !== null && (payload.paybas === undefined || payload.paybas === "" || (this.docketService.loginUserList.Type === "2" && this.ThcForm.value.vendorType === '04'))) {
      this.THCService.getContractData(payload).subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.handleContractResponse(response)
            if (!response.data.contractExpire && !response.data.ContractID && this.docketService.loginUserList.Type !== '2') {
              if (this.docketService.loginUserList.Type === '1') {
                this.ThcForm.patchValue({
                  contractAmount: response.data.contractAmount
                });
                this.ThcForm.patchValue({
                  tDSOnAmount: response.data.contractAmount
                });
                this.calculateNetAmount()
              }
              this.ThcForm.patchValue({
                standardContractAmount: response.data.standardContractAmount
              })
            }
          }
        },
        error: (err) => {
          console.error('Error fetching contract details:', err.error.message);
        }
      });
    }
  }

  patchAvailableDockets(data: any[]) {
    this.avalabledocket.clear();

    data.forEach((item) => {
      let tatInHrs = '-';
      if (item.Commited_Dely_Date) {
        const arrival = new Date(item.Commited_Dely_Date);
        const now = new Date();
        const diffMs = now.getTime() - arrival.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        tatInHrs = diffHrs.toString();
      }

      const group = new FormGroup({
        isSelected: new FormControl(false),
        ID: new FormControl(item.id ?? 0),
        DOCKNO: new FormControl(item.dockno || ''),
        DOCKSF: new FormControl(item.docksf || ''),
        manual_dockno: new FormControl(item.manual_dockno || ''),
        Docket_Mode: new FormControl(item.docket_Mode || ''),
        Bkg_Date: new FormControl(item.bkg_Date || ''),
        Arrival_Date: new FormControl(item.arrival_Date || ''),
        Commited_Dely_Date: new FormControl(item.commited_Dely_Date || ''),
        ORGNCD: new FormControl(item.orgncd || ''),
        DEST_CD: new FormControl(item.desT_CD || ''),
        Curr_Loc: new FormControl(item.curr_Loc || ''),
        entryBy: new FormControl(item.entryBy || ''),
        PendPkgQty: new FormControl(item.pendPkgQty ?? 0),
        ArrPkgQty: new FormControl(item.arrPkgQty ?? 0),
        PKGSNO: new FormControl(item.pkgsno ?? 0),
        PayBas: new FormControl(item.payBas || ''),
        PAYBAS_Str: new FormControl(item.paybaS_Str || ''),
        ATAD: new FormControl(item.atad || ''),
        CDELDT: new FormControl(item.cdeldt || ''),
        businesstype: new FormControl(item.businesstype || ''),
        TRN_MOD: new FormControl(item.trN_MOD || ''),
        ACTUWT: new FormControl(item.actuwt ?? 0),
        ArrWeightQty: new FormControl(item.arrWeightQty ?? 0),
        CHRGWT: new FormControl(item.chrgwt ?? 0),
        Freight: new FormControl(item.freight ?? 0),
        DKTTOT: new FormControl(item.dkttot ?? 0),
        Handlingchrg: new FormControl(item.handlingchrg ?? 0),
        SVCTAX: new FormControl(item.svctax ?? 0),
        CND: new FormControl(item.cnd ?? 0),
        IsEnabled: new FormControl(item.isEnabled ?? false),
        Rate: new FormControl(item.rate ?? 0),
        MaxLimit: new FormControl(item.maxLimit ?? 0),
        NewRate: new FormControl(item?.newRate ?? 0),
        CNT: new FormControl(item.cnt ?? 0),
        Message: new FormControl(item.message || ''),
        EWayBillNo: new FormControl(item.eWayBillNo || ''),
        PKGSNO_Load: new FormControl(item.pkgsnO_Load ?? 0),
        CHRGWT_Load: new FormControl(item.chrgwT_Load ?? 0),
        IsRemoved: new FormControl(item.isRemoved ?? false),
        subreasoncode: new FormControl(item.subreasoncode || ''),
        party_name: new FormControl(item.party_name || ''),
        Consignor_Name: new FormControl(item.consignor_Name || ''),
        Stock_Update_DT: new FormControl(item.stock_Update_DT || ''),
        FreeStorageDays: new FormControl(item.freeStorageDays || ''),
        DemurrageCharge: new FormControl(item.demurrageCharge ?? 0),
        DAMCNT: new FormControl(item.damcnt ?? 0),
        RequestCNT: new FormControl(item.requestCNT ?? 0),
        ContractAmount: new FormControl(item.contractAmount ?? 0),
        bcSerialNo: new FormControl(item.bcSerialNo),
        tatInHrs: new FormControl(item.tatInHrs),
        rateType: new FormControl(this.ThcForm.value.chrgType ? this.ThcForm.value.chrgType : null),
        charge: new FormControl(0),
        rateError: new FormControl(''),
        partY_CODE: new FormControl(item.partY_CODE || ''),
        csgenm: new FormControl(item.csgenm || ''),
        luVendorTyp: new FormControl(item.luVendorTyp || null),
        luVendorCode: new FormControl(item.luVendorCode || null),
        hccAmt: new FormControl(0)
      });

      const initialVendorType = group.get('luVendorTyp')?.value;
      if (initialVendorType && initialVendorType !== 'XX9') {
        group.get('luVendorCode')?.setValidators([Validators.required]);
        group.get('rateType')?.setValidators([Validators.required]);
      } else {
        group.get('luVendorCode')?.clearValidators();
        group.get('rateType')?.clearValidators();
      }
      group.get('luVendorCode')?.updateValueAndValidity({ emitEvent: false });
      group.get('rateType')?.updateValueAndValidity({ emitEvent: false });
      group.get('rateType')?.valueChanges.subscribe(() => this.calculateCharge(group));
      group.get('NewRate')?.valueChanges.subscribe(() => this.calculateCharge(group));
      this.avalabledocket.push(group);
    });
  }

  calculateCharge(group: FormGroup) {
    const isValid = this.validateRate(group);
    if (!isValid) {
      group.get('charge')?.setValue((0).toFixed(2), { emitEvent: false });
      this.updateTotalLoadingCharge();
      return;
    }
    const rateType = group.get('rateType')?.value;
    const newRate = parseFloat(group.get('NewRate')?.value || 0);
    const actuwt = parseFloat(group.get('ACTUWT')?.value || 0);
    const pkgsno = parseFloat(group.get('PKGSNO')?.value || 0);
    let charge = 0;
    switch (rateType) {
      case '1': // PER KG
        charge = actuwt * newRate;
        break;
      case '3': // PER PACKAGES
        charge = pkgsno * newRate;
        break;
      case '4': // FLAT
        charge = newRate;
        break;
      default:
        charge = 0;
    }
    group.get('charge')?.setValue(charge.toFixed(2), { emitEvent: false });
    this.updateTotalLoadingCharge()
  }

  updateTotalLoadingCharge() {
    const total = this.avalabledocket.controls.reduce((sum, ctrl) => {
      if (ctrl.get('isSelected')?.value) { // ✅ only include checked rows
        return sum + parseFloat(ctrl.get('charge')?.value || 0);
      }
      return sum;
    }, 0);

    this.ThcForm.get('Loadingcharge')?.setValue(total.toFixed(2), { emitEvent: false });
  }

  validateRate(group: FormGroup): boolean {
    const loadingBy = this.filterList?.loadingBy;
    if (loadingBy === 'XX9') {
      group.get('rateError')?.setValue('');
      return true; // no validation when XX9
    }

    const rateType = group.get('rateType')?.value;
    const rate = parseFloat(group.get('NewRate')?.value || '0') || 0;
    const chrgwt = parseFloat(group.get('CHRGWT')?.value || '0') || 0;
    const noofpkg = parseFloat(group.get('PKGSNO')?.value || '0') || 0;
    if (chrgwt === 0) {
      group.get('rateError')?.setValue('Charge weight is zero cannot validate rate.');
      group.get('NewRate')?.setValue('0.00', { emitEvent: false });
      return false;
    }

    let maxlimitcalculation = 0;

    if (rateType === '4') {
      maxlimitcalculation = rate / chrgwt;
    } else if (rateType === '3') {
      maxlimitcalculation = (rate * noofpkg) / chrgwt;
    } else {
      maxlimitcalculation = rate;
    }
    if (maxlimitcalculation > 5.0) {
      group.get('rateError')?.setValue('Rate Amount Is High Please Check');
      group.get('NewRate')?.setValue('0.00', { emitEvent: false });
      return false;
    } else {
      group.get('rateError')?.setValue('');
      return true;
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
  get avalableForTHC(): FormArray {
    return this.ThcForm.get('avalableForTHC') as FormArray;
  }

  updateTotalManifest(mfNo: string): void {

    this.getContractDetail();
    const totals = this.avalableForTHC.controls.reduce((acc, g) => {
      if (g.get('selected')?.value) {
        acc.totalManifests += 1;
        acc.totalWeight += Number(g.get('TOT_LOAD_ACTWT')?.value) || 0;
      }
      return acc;
    }, { totalManifests: 0, totalWeight: 0 });

    this.ThcForm.patchValue({
      TotalManifest: totals.totalManifests,
      wtLoaded: totals.totalWeight,
    }, { emitEvent: false });

    const vehicleCapacity = this.ThcForm.value.vehicleCapacity;
    const weightLoaded = this.ThcForm.value.wtLoaded;
    if (vehicleCapacity && weightLoaded) {
      const utilization = (weightLoaded / (vehicleCapacity * 1000)) * 100;
      const roundedUtilization = Math.round(utilization * 100) / 100;

      this.ThcForm.patchValue({
        vehicleCapacityUti: roundedUtilization
      });
    } else {
      this.ThcForm.patchValue({
        vehicleCapacityUti: 0
      });
    }
    if (this.ThcForm.value.wtLoaded > vehicleCapacity) {
      this.ThcForm.patchValue({
        isOverLoad: true
      })
    }
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
