import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { VehicleNumbersResponse } from 'app/shared/models/general-master.model';
import { LocationResponse } from 'app/shared/models/loading-sheet.model';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { ChallanService } from 'app/shared/services/challan.service';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { LoadingSheetApiService } from 'app/shared/services/loading-sheet-api.service';
import { LoadingSheetService } from 'app/shared/services/loading-sheet.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from 'app/shared/shared/shared.module';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { VendorChargeHelperService } from 'app/shared/services/vendor-charge.service';
import { CustomerService } from 'app/shared/services/customer.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-lsupdate-popup',
  standalone: true,
  imports: [CommonModule, RouterModule, NgSelectModule, ReactiveFormsModule, BsDatepickerModule, SharedModule, FormsModule],
  templateUrl: './lsupdate-popup.component.html',
  styleUrl: './lsupdate-popup.component.scss',
  providers: [BsModalService]
})
export class LSUpdatePopupComponent {
  public modalRef!: BsModalRef;
  public isgetLoadingList: boolean = false;
  public nextLocationValue = 'Please enter atleast 1 character';
  public noVehicleValue = 'Please enter atleast 1 character';
  public locationData: LocationResponse[] = [];
  public vehicleNumberData: VehicleNumbersResponse[] = [];
  public totalDocketSelected!: number;
  public totalPkgs: number = 0;
  public totalActWt: number = 0;
  public isLoadingSheet: boolean = false;
  public today: Date = new Date();
  public isSubmitting: boolean = false;
  public headerVendorList: any[] = [];
  public headerVendor: any = null;
  public rowVendorList: any[][] = [];
   public env=environment
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  public LsTypeList = [{ text: "LTL", value: "LTL" }, { text: "FTL", value: "FTL" }];
  constructor(
    public loadingSheetService: LoadingSheetService,
    public generalMasterService: GeneralMasterService,
    public docketService: DocketService,
    public commonService: CommonService,
    public challanService: ChallanService,
    public THCMasterService: THCMasterService,
    public loadingSheetApiService: LoadingSheetApiService,
    public sweetAlertService: SweetAlertService,
    public vendorChargeHelper: VendorChargeHelperService,
    public basicDetailService: BasicDetailService, private cd: ChangeDetectorRef, private modalService: BsModalService,
    private customerService: CustomerService
  ) { }


  openModal(data: any, type: string) {
    this.docketService.loginUserList.TCNO = data.lsNo;
    this.docketService.loginUserList.IsBCProcess = data.isBCProcess;
    this.docketService.loginUserList.Type = type;
    this.isgetLoadingList = type === 'ULS' ? true : false;
    this.loadingSheetService.buildForm();
    this.fetchPreparedByEmployee();

    if (type === 'ULS') {
      this.getVendorType();
      this.generalMasterService.getChargeTypeData();
      this.loadingSheetService.getUnLoaderUserList();
      this.getLoadingSheet(data, type);
      this.loadingSheetService.LSForm.get('loadingByUser')?.setValidators([Validators.required]);
      this.loadingSheetService.LSForm.get('LoadingSupervisor')?.setValidators([Validators.required]);
      this.loadingSheetService.LSForm.get('shiftInCharge')?.setValidators([Validators.required]);

    } else {
      this.generalMasterService.getLSModedata();
      this.generalMasterService.getModeData();
      this.loadingSheetService.LSForm.get('loadingByUser')?.clearValidators();
      this.loadingSheetService.LSForm.get('loadingByUser')?.setValue('');
      this.loadingSheetService.LSForm.get('LoadingSupervisor')?.clearValidators();
      this.loadingSheetService.LSForm.get('LoadingSupervisor')?.setValue('');
      this.loadingSheetService.LSForm.get('shiftInCharge')?.clearValidators();
      this.loadingSheetService.LSForm.get('shiftInCharge')?.setValue('');
    }
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
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
          this.loadingSheetService.LSForm?.get('preparedBy')?.setValue(val);
        }
      }
    });
  }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      // this.docketService.loginUserList.LocationCode =  'BWH';
      // this.docketService.loginUserList.Type = 'LS';
      // this.docketService.loginUserList.TCNO = 'LS/BWH/2526/007803';
      //  this.docketService.loginUserList.IsBCProcess = 'N';
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

  getvendoCodeData(event: any) {
    this.loadingSheetService.LSForm.patchValue({ vendorName: event?.codeDesc })
    const ChargedBy = event?.codeId;
    if (ChargedBy === 'B' || ChargedBy == '04') {
      this.challanService.getChargesVendorsList('04');
    }
    if (ChargedBy === 'A' || ChargedBy == 'XX1') {
      this.challanService.getChargesVendorsList('XX1');
    }
    if (ChargedBy === 'M') {
      this.challanService.getChargesVendorsList('19');
    }
    if (ChargedBy === 'XX5' || ChargedBy === 'XX8') {
      this.challanService.branchWiseLoadingUnloading(event?.codeId);
    }
    const rateType = this.loadingSheetService.LSForm.get('rateType');
    const vendorCode = this.loadingSheetService.LSForm.get('vendorCode');
    // const loadingCharge = this.loadingSheetService.LSForm.get('loadingCharge');
    if (this.loadingSheetService.LSForm.value.loadingBy && this.loadingSheetService.LSForm.value.loadingBy !== 'XX9') {
      rateType?.setValidators([Validators.required]);
      // vendorCode?.setValidators([Validators.required]);
      // loadingCharge?.setValidators([Validators.required]);
    } else {
      rateType?.setValidators(null);
      rateType?.setValue(null);

      // vendorCode?.setValidators(null);
      // vendorCode?.setValue(null);

      // loadingCharge?.setValidators(null);
      // loadingCharge?.setValue(null);
    }
    rateType?.updateValueAndValidity();

    // vendorCode?.updateValueAndValidity();

    // loadingCharge?.updateValueAndValidity();
  }


  getVendorType() {
    this.THCMasterService.getVendorType(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          const mTypeRow = response.data.find((x: any) => x.documentType === 'M');
          if (mTypeRow) {
            const vendorTypes = mTypeRow.loading_VendorType.split(',');
            this.generalMasterService.getLoadingByDetail(vendorTypes);
          }
        }
      }
    });
  }

  getLoadingCharge(event: any) {
    if (!event) {
      this.loadingSheetService.LSForm.patchValue({
        vendorName: null
      });
      return;
    }

    this.loadingSheetService.LSForm.patchValue({
      vendorName: event.text   // 👈 Vendor Name store
    });
    const data = {
      loadUnloadType: 'L',
      vendorCode: event.value,
      typeModule: 'M',
      chargeType: this.docketService.loginUserList.chargeType,
      brdc: this.docketService.loginUserList.LocationCode,
      loadingBy: this.loadingSheetService.LSForm.value.loadingBy,
    };
    if (['XX5'].includes(this.loadingSheetService.LSForm.get('loadingBy')?.value)) {
      this.THCMasterService.getLoadingCharge(data).subscribe({
        next: (response: any) => {
          this.loadingSheetService.LSForm.patchValue({
            Rate: response.rate,
            loadedRateType: response.rateType
          });
          const lsArray = this.loadingSheetService.LSForm.get('docketList') as FormArray;
          lsArray?.controls.forEach((item: any, index) => {
            lsArray.controls[index].patchValue({
              newRate: response.rate,
              ratetype: response.rateType
            });
          });
        },
        error: (err) => {
          console.error('Error fetching loading charge:', err);
        }
      });
    }
  }

  getLoadingSheet(data: any, type: string) {
    const payload = {
      type: type,
      tcno: data.lsNo,
      isBCProcess: data.isBCProcess,
      BaseUserName: this.docketService.loginUserList.LocationCode,
    }
    this.isLoadingSheet = true;
    this.loadingSheetApiService.getLoadingSheet(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.isLoadingSheet = false;
          this.loadingSheetService.LSForm.patchValue({
            lsType: response.lsType,
            NEXTLOC: response.nextloc,
            mathadiAmt: response.mathadiAmt,
            manualLsNO: response.manualLsNO,
            lsNO: response.lsNO,
            lsDate: new Date(response.lsDate),
            loadingCharge: response.loadingCharge,
            isMathadi: response.isMathadi,
          });
          if (response && Array.isArray(response.docketListForMFGeneration)) {
            this.loadingSheetService.setDocketList(response.docketListForMFGeneration);
            this.prefetchVendorLists();
          }
        }
      }, error: (err) => {
        console.error("Error fetching docket list", err);
        this.isLoadingSheet = false;   // 🔥 stop loader on error
      },
      complete: () => {
        this.isLoadingSheet = false;   // 🔥 always stop loader
      }
    });
  }

  getLocationDetail(event: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.nextLocationValue = 'Please enter at least 1 characters';
      return;
    }
    this.nextLocationValue = 'Searching..'
    this.loadingSheetApiService.getLocationList(searchText).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.locationData = response.data;
          this.nextLocationValue = 'No matches found';
        } else {
          this.locationData = []
          this.nextLocationValue = ''
        }
      }
    });
  }

  resetNextLocationDropdown() {
    this.locationData = [];
    this.nextLocationValue = 'Please enter at least 1 characters';
  }

  getVehicleNumberDetail(event: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.noVehicleValue = 'Please enter at least 1 characters';
      return;
    }
    this.noVehicleValue = 'Searching..'
    this.basicDetailService.getGetVehicleNumbers(searchText).subscribe({
      next: (response) => {
        if (response) {
          this.vehicleNumberData = response;
          this.noVehicleValue = 'No matches found';
        } else {
          this.locationData = []
          this.noVehicleValue = ''
        }
      }
    });
  }

  resetvehicleNoDropdown() {
    this.vehicleNumberData = [];
    this.noVehicleValue = 'Please enter at least 1 characters';
  }

  getLoadinglist() {
    const form = this.loadingSheetService.LSForm;
    if (form.get('loadingBy')?.valid && form.get('nextStopLocation')?.valid && form.get('rateType')?.valid) {
      this.getDocketListForMFDetail();
      this.isgetLoadingList = true;
    } else {
      this.isgetLoadingList = false;
      form.get('loadingBy')?.markAsTouched();
      form.get('nextStopLocation')?.markAsTouched();
      form.get('rateType')?.markAsTouched();
      form.get('lsType')?.markAsTouched();
    }
  }

  formatDateNoTimezone(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  lSTransportMode(event: any) {
    if (event?.codeId === 'S' && this.docketService.loginUserList.Type === 'ULS') {
      // this.loadingSheetService.LSForm.get('loadingBy')?.setValidators([Validators.required]);
      // this.loadingSheetService.LSForm.get('vendorCode')?.setValidators([Validators.required]);
      // this.loadingSheetService.LSForm.get('loadingCharge')?.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      // this.loadingSheetService.LSForm.get('loadingBy')?.clearValidators();
      // this.loadingSheetService.LSForm.get('loadingBy')?.setValue(null);
      // this.loadingSheetService.LSForm.get('vendorCode')?.clearValidators();
      // this.loadingSheetService.LSForm.get('vendorCode')?.setValue(null);
      // this.loadingSheetService.LSForm.get('loadingCharge')?.clearValidators();
      // this.loadingSheetService.LSForm.get('loadingCharge')?.setValue(0);
      this.loadingSheetService.LSForm.get('rateType')?.clearValidators();
      this.loadingSheetService.LSForm.get('rateType')?.setValue(null);
    }
    this.cd.detectChanges();
  }

  getDocketListForMFDetail() {
    this.isLoadingSheet = true;
    const payload = {
      baseLocationCode: this.docketService.loginUserList.LocationCode,
      nextStopLocation: this.loadingSheetService.LSForm.value.nextStopLocation,
      transportMode: this.loadingSheetService.LSForm.value.transportMode || '',
      fromDate: this.loadingSheetService.LSForm.value.reportrange ? this.formatDateNoTimezone(this.loadingSheetService.LSForm.value.reportrange[0]) : null,
      toDate: this.loadingSheetService.LSForm.value.reportrange ? this.formatDateNoTimezone(this.loadingSheetService.LSForm.value.reportrange[1]) : null,
      destinationList: this.loadingSheetService.LSForm.value.destinationList,
      lsType: this.loadingSheetService.LSForm.value.lsType ? this.loadingSheetService.LSForm.value.lsType : '',
      docketNoList: this.loadingSheetService.LSForm.value.docketNoList,
      lsDate: this.formatDateNoTimezone(new Date(this.loadingSheetService.LSForm.value.lsDate)),
      loadingBy: this.loadingSheetService.LSForm.value.loadingBy || '',
      rateType: this.loadingSheetService.LSForm.value.rateType || '',
      baseCompanyCode: this.docketService.loginUserList.Companycode
    }
    this.loadingSheetApiService.getDocketListForMF(payload).subscribe({
      next: (response) => {
        this.isLoadingSheet = false;
        if (response && Array.isArray(response)) {
          this.loadingSheetService.setDocketList(response);
          this.prefetchVendorLists();
        }
      },
      error: (err) => {
        console.error("Error fetching docket list", err);
        this.isLoadingSheet = false;   // 🔥 stop loader on error
      },
      complete: () => {
        this.isLoadingSheet = false;   // 🔥 always stop loader
      }
    });

  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    const formArray = this.loadingSheetService.docketFormArray;

    formArray.controls.forEach((group: any) => {
      if (!group.value.message) { // message wali row par checkbox nathi
        group.get('isChecked')?.setValue(checked, { emitEvent: false });
      }
    });

    this.updateSelectedCount();
  }

  updateSelectedCount() {
    const formArray = this.loadingSheetService.docketFormArray;
    let selected = formArray.controls.filter((g: any) => g.value.isChecked);
    this.totalDocketSelected = selected.length;
    // SUM calculation
    this.totalPkgs = selected.reduce((sum: number, row: any) => {
      return sum + (Number(row.value.PackageLB) || 0);
    }, 0);
    this.totalActWt = selected.reduce((sum: number, row: any) => {
      return sum + (Number(row.value.WeightsLB) || 0);
    }, 0);
    selected.forEach((row: any) => {
      this.loadingSheetService.loadingRateCalc(row);
    });
    this.loadingSheetService.calculateTotal()
  }

  onPackageBlur(row: any) {
    const packageLB = Number(row.get('PackageLB')?.value);
    const max = Number(row.value.packagesLB);
    if (packageLB > max) {
      row.get('PackageLB')?.setErrors({ maxLimit: true });
    } else if (packageLB < 1) {
      row.get('PackageLB')?.setErrors({ minLimit: true });
    } else {
      row.get('PackageLB')?.setErrors(null);
      this.onPackagesFocusOut(row);
      this.updateSelectedCount();
    }
  }

  onPackagesFocusOut(row: any) {
    const enteredPackages = Number(row.get('PackageLB')?.value || 0);
    const originalPackages = Number(row.get('PackagesLB_old')?.value || 0);
    const originalWeight = Number(row.get('WeightLB_old')?.value || 0);
    const finalWeight = Math.round((originalWeight * enteredPackages) / originalPackages);
    row.get('WeightsLB')?.setValue(finalWeight);
    row.get('WeightsLB')?.setValue(finalWeight);
    row.get('autoPatchWeight')?.setValue(finalWeight);
    row.get('WeightEdited')?.setValue(false);
  }

  get isSubmitDisabled(): boolean {
    const type = this.docketService.loginUserList.Type;
    if (type === 'ULS' || type === 'LS') {
      const selected = this.loadingSheetService.docketFormArray.controls
        .filter((g: any) => g.value.isChecked);

      return selected.length === 0;
    }
    return false;
  }

  prepareLoadingSheet() {
    if (this.loadingSheetService.LSForm.valid) {
      this.isSubmitting = true; // Start loading state

      const { reportrange, docketList, ...formValuesWithoutRange } = this.loadingSheetService.LSForm.value;
      // const selected = (this.docketFormArray?.controls ?? []).filter(ctrl => ctrl.get('isChecked')?.value).map(ctrl => (ctrl as FormGroup).getRawValue());
      const selected = (this.loadingSheetService.docketFormArray?.controls ?? [])
        .filter(ctrl => ctrl.get('isChecked')?.value)
        .map(ctrl => ({
          dockno: ctrl.get('dockno')?.value,
          docksf: ctrl.get('docksf')?.value,
          pkgsno: Number(ctrl.get('pkgsno')?.value),
          actuwt: Number(ctrl.get('actuwt')?.value),
          docketDate: ctrl.get('docketDate')?.value,
          orgCode: ctrl.get('orgCode')?.value,
          packagesLB: Number(ctrl.get('PackageLB')?.value),
          weightLB: Number(ctrl.get('WeightsLB')?.value),
          reDestCode: ctrl.get('reDestCode')?.value,
          isChecked: ctrl.get('isChecked')?.value,
          newRate: this.docketService.loginUserList.Type === 'ULS' ? Number(ctrl.get('newRate')?.value) : 0,
          ratetype: this.docketService.loginUserList.Type === 'ULS' ? ctrl.get('ratetype')?.value ? ctrl.get('ratetype')?.value : '' : '',
          luVendorTyp: ctrl.get('luVendorTyp')?.value || '',
          luVendorCode: ctrl.get('luVendorCode')?.value || ''
        }));
      const payload = {
        vm: {
          ...formValuesWithoutRange,
          lsDate: new Date(this.loadingSheetService.LSForm.value.lsDate).toISOString() === "0000-12-31T18:06:32.000Z" ? new Date().toISOString().split('T')[0] : new Date(this.loadingSheetService.LSForm.value.lsDate).toISOString().split('T')[0],
          mathadiDate: new Date(this.loadingSheetService.LSForm.value.mathadiDate).toISOString(),
          vendorCode: this.loadingSheetService.LSForm.value.vendorCode ? this.loadingSheetService.LSForm.value.vendorCode : '',
          vehno: this.loadingSheetService.LSForm.value.vehno ? this.loadingSheetService.LSForm.value.vehno : '',
          lsType: this.loadingSheetService.LSForm.value.lsType ? this.loadingSheetService.LSForm.value.lsType : '',
          loadingBy: this.loadingSheetService.LSForm.value.loadingBy ? this.loadingSheetService.LSForm.value.loadingBy : '',
          nextStopLocation: this.loadingSheetService.LSForm.value.nextStopLocation ? this.loadingSheetService.LSForm.value.nextStopLocation : '',
          rateType: this.loadingSheetService.LSForm.value.rateType ? this.loadingSheetService.LSForm.value.rateType : '',
          fromDate: reportrange[0].toISOString(),
          toDate: reportrange[1].toISOString(),
          baseUserName: this.docketService.loginUserList.BaseUserName,
          baseFinYear: this.docketService.loginUserList.FinYear,
          baseLocationCode: this.docketService.loginUserList.LocationCode,
          baseCompanyCode: this.docketService.loginUserList.Companycode,
          location: this.docketService.loginUserList.LocationCode,
          Type: this.docketService.loginUserList.Type,
        },
        docketList: selected,
        internalDocumentList: [
          {
            "imNo": "",
            "isChecked": true,
            "packages": 0,
            "weight": 0
          }
        ],
      };
      this.loadingSheetApiService.prepareLoadingSheet(payload).subscribe({
        next: (response: any) => {
          this.isSubmitting = false; // Stop loading state

          if (response.success) {
            const isUls = response.type === 'ULS';
            const codeUrl = isUls
              ? `${this.env.liveUrl}ViewPrint/ViewMF?MFNO=${response.code}&src=angular`
              : `${this.env.liveUrl}ViewPrint/ViewLS?ChallanNo=${response.code}&src=angular`;

            let hcNumberHtml = '';
            if (response.hcNumber) {
              const hccList = response.hcNumber.split(',').map((h: string) => h.trim()).filter(Boolean);
              hcNumberHtml = hccList.map((hccNo: string) => {
                const hccUrl = `${this.env.liveUrl}ViewPrint/ViewHCC?DocumentNo=${response.code}&HCNo=${hccNo}&src=angular`;
                return `<a href="javascript:void(0);" onclick="window.open('${hccUrl}', 'popupWindow', 'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'); return false;" style="color: #0d6efd; text-decoration: underline; cursor: pointer;">${hccNo}</a>`;
              }).join(', ');
            }

            let alertHtml = `
              <div style="background: #fff; padding: 20px; border: 2px dashed #198754; border-radius: 10px; text-align: center;">
                <i class="fa fa-check-circle text-success" style="font-size: 40px; margin-bottom: 10px;"></i>
                <h4 class="text-success fw-bold m-0" style="font-size: 24px;">
                  <a href="javascript:void(0);" onclick="window.open('${codeUrl}', 'popupWindow', 'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'); return false;" style="color: #198754; text-decoration: underline; cursor: pointer;">${response.code}</a>
                </h4>
                ${hcNumberHtml ? `
                <hr style="border-top: 2px dashed #ccc; margin: 15px 0; opacity: 0.5;">
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                  <span style="font-size: 14px; color: #6c757d; display: block; margin-bottom: 5px;">HC Number</span>
                  <span style="font-size: 20px; font-weight: 600; letter-spacing: 1px;">${hcNumberHtml}</span>
                </div>
                ` : ''}
              </div>
            `;
            this.sweetAlertService.success(alertHtml);
            this.dataEmitter.emit()
            this.modalRef.hide();
          } else {
            this.sweetAlertService.error(response.message);
          }
        },
        error: (err: any) => {
          this.isSubmitting = false; // Stop loading state on error
          console.error('Error preparing loading sheet', err);
        }
      });
    } else {
      this.loadingSheetService.LSForm.markAllAsTouched();

      const invalidControls: string[] = [];
      const controls = this.loadingSheetService.LSForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalidControls.push(name);
        }
      }

      const docketList = this.loadingSheetService.LSForm.get('docketList') as FormArray;
      if (docketList) {
        docketList.controls.forEach((group: any, index: number) => {
          if (group.invalid && group.controls) {
            for (const key in group.controls) {
              if (group.controls[key].invalid) {
                invalidControls.push(`docketList[${index}].${key}`);
              }
            }
          }
        });
      }
      console.log('Invalid Controls on Submit:', invalidControls);
    }
  }

  
 openView(lsNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewLS?ChallanNo=${lsNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

    get isHQTR(): boolean {
    return this.docketService.loginUserList?.LocationCode === 'HQTR';
  }

    openMfNoView(mfNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewMF?MFNO=${mfNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

   openHCCModal(hccNo: string,documentNo:string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewHCC?DocumentNo=${documentNo}&HCNo=${hccNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  onHeaderHccVendorTypeChange(event: any) {
    this.headerVendor = null;
    this.vendorChargeHelper.handleHeaderHccVendorTypeChange(
      event?.codeId || event,
      this.loadingSheetService.LSForm.get('docketList') as FormArray,
      this.rowVendorList,
      (list: any[]) => this.headerVendorList = list,
      undefined,
      undefined,
      undefined,
      undefined,
      'L'
    );

    const type = event?.codeId || event;
    const formArray = this.loadingSheetService.LSForm.get('docketList') as FormArray;
    formArray.controls.forEach((group: any) => {
      group.get('newRate')?.patchValue(0);
      const vendorCodeCtrl = group.get('luVendorCode');
      const rateTypeCtrl = group.get('ratetype');
      if (type && type !== 'XX9') {
        vendorCodeCtrl?.setValidators([Validators.required]);
        rateTypeCtrl?.setValidators([Validators.required]);
      } else {
        vendorCodeCtrl?.clearValidators();
        rateTypeCtrl?.clearValidators();
      }
      vendorCodeCtrl?.updateValueAndValidity({ emitEvent: false });
      rateTypeCtrl?.updateValueAndValidity({ emitEvent: false });


    });
  }

  onHeaderRateTypeChange(event: any) {
    this.vendorChargeHelper.handleHeaderRateTypeChange(
      event?.codeId || event,
      this.loadingSheetService.LSForm.get('docketList') as FormArray,
      'ratetype'
    );
  }

  onHeaderVendorChange(event: any) {
    this.vendorChargeHelper.handleHeaderVendorChange(
      event?.value || event,
      this.loadingSheetService.LSForm.get('docketList') as FormArray,
      'luVendorCode',
      this.loadingSheetService.LSForm.get('mF_TransportMode')?.value === 'S' ? 'L' : 'U',
      this.loadingSheetService.LSForm.get('loadedRateType')?.value,
      'ratetype',
      'newRate',
      'luVendorTyp'
    );
  }

  onRowVendorTypeChange(event: any, index: number) {
    this.vendorChargeHelper.handleRowVendorTypeChange(
      event?.codeId || event,
      index,
      this.loadingSheetService.LSForm.get('docketList') as FormArray,
      this.rowVendorList,
      undefined,
      undefined,
      undefined,
      undefined,
      'L'
    );

    const formArray = this.loadingSheetService.LSForm.get('docketList') as FormArray;
    const group = formArray.at(index);
    group.get('newRate')?.patchValue(0);
    const vendorCodeCtrl = group.get('luVendorCode');
    const rateTypeCtrl = group.get('ratetype');
    const type = event?.codeId || event;
    if (type && type !== 'XX9') {
      vendorCodeCtrl?.setValidators([Validators.required]);
      rateTypeCtrl?.setValidators([Validators.required]);
    } else {
      vendorCodeCtrl?.clearValidators();
      rateTypeCtrl?.clearValidators();
    }
    vendorCodeCtrl?.updateValueAndValidity({ emitEvent: false });
    rateTypeCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onRowVendorCodeChange(event: any, index: number) {
    this.vendorChargeHelper.handleRowVendorCodeChange(
      event?.value || event,
      index,
      this.loadingSheetService.LSForm.get('docketList') as FormArray,
      this.loadingSheetService.LSForm.get('mF_TransportMode')?.value === 'S' ? 'L' : 'U',
      this.loadingSheetService.LSForm.get('loadedRateType')?.value,
      'ratetype',
      'newRate'
    );
  }

  prefetchVendorLists() {
    this.loadingSheetService.docketFormArray.controls.forEach((ctrl: any, index: number) => {
      const vendorTyp = ctrl.value.luVendorTyp;
      if (vendorTyp) {
        this.vendorChargeHelper.fetchVendorListFor(vendorTyp, (list: any[]) => {
          this.rowVendorList[index] = list;
        });
      }
    });
  }
}
