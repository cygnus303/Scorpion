import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { VehicleNumbersResponse } from 'app/shared/models/general-master.model';
import { LocationResponse, UnLoaderUserListResponse } from 'app/shared/models/loading-sheet.model';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { ChallanService } from 'app/shared/services/challan.service';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { LoadingSheetApiService } from 'app/shared/services/loading-sheet-api.service';
import { LoadingSheetService } from 'app/shared/services/loading-sheet.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-loading-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule,SharedModule],
  templateUrl: './loading-sheet.component.html',
  styleUrls: ['./loading-sheet.component.scss']
})
export class LoadingSheetComponent {
  public isgetLoadingList: boolean = false;
  public nextLocationValue = 'Please enter atleast 1 character';
  public noVehicleValue = 'Please enter atleast 1 character';
  public locationData: LocationResponse[] = [];
  public vehicleNumberData: VehicleNumbersResponse[] = [];
  public unLoaderUserList: UnLoaderUserListResponse[] = [];
  public totalDocketSelected!:number;
  public totalPkgs: number = 0;
  public totalActWt: number = 0;
  public isLoadingSheet:boolean = false;
  public today: Date = new Date();



  public LsTypeList = [{text: "LTL", value: "LTL" },{ text: "FTL",value: "FTL"}];
  constructor(
    public loadingSheetService: LoadingSheetService,
    public generalMasterService: GeneralMasterService,
    public docketService: DocketService,
    public commonService: CommonService,
    public challanService: ChallanService,
    public THCMasterService: THCMasterService,
    public loadingSheetApiService: LoadingSheetApiService,
    public basicDetailService: BasicDetailService
  ) { }

ngOnInit(){
   const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      // this.docketService.loginUserList.LocationCode =  'ABH';
      // this.docketService.loginUserList.Type = 'ULS';
      // this.docketService.loginUserList.TCNO = 'LS/ABH/2526/007092';
      //  this.docketService.loginUserList.IsBCProcess = 'N';
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.isgetLoadingList =  this.docketService.loginUserList.Type === 'ULS' ? true :false;
    this.loadingSheetService.buildForm();
    
    if(this.docketService.loginUserList.Type === 'ULS'){
      this.getUnLoaderUserList();
      this.getLoadingSheet();
      this.loadingSheetService.LSForm.get('loadingByUser')?.setValidators([Validators.required]);
      this.loadingSheetService.LSForm.get('LoadingSupervisor')?.setValidators([Validators.required]);
    }else{
      this.getVendorType();
      this.generalMasterService.getLSModedata();
      this.generalMasterService.getModeData();
      this.generalMasterService.getChargeTypeData();
      this.loadingSheetService.LSForm.get('loadingByUser')?.clearValidators();
      this.loadingSheetService.LSForm.get('loadingByUser')?.setValue('');
      this.loadingSheetService.LSForm.get('LoadingSupervisor')?.clearValidators();
      this.loadingSheetService.LSForm.get('LoadingSupervisor')?.setValue('');
    }

      this.loadingSheetService.LSForm.get('rdVehicle')?.valueChanges.subscribe((value) => {
      this.loadingSheetService.LSForm.get('vehno')?.setValue('');
});
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
    if (this.loadingSheetService.LSForm.value.loadingBy && this.loadingSheetService.LSForm.value.loadingBy !== 'XX9') {
      rateType?.setValidators([Validators.required]);
    } else {
      rateType?.setValidators(null);
      rateType?.setValue(null);
    }
   rateType?.updateValueAndValidity();
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

  getUnLoaderUserList() {
    this.loadingSheetApiService.getUnLoaderUserList(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.unLoaderUserList = response.data;
        }
      }
    });
  }

   getLoadingSheet() {
     const payload ={
     type:this.docketService.loginUserList.Type,
     tcno:this.docketService.loginUserList.TCNO,
     isBCProcess:this.docketService.loginUserList.IsBCProcess,
     BaseUserName:this.docketService.loginUserList.LocationCode,
    }
    this.isLoadingSheet = true;
    this.loadingSheetApiService.getLoadingSheet(payload).subscribe({
      next: (response:any) => {
        if (response) { 
          this.isLoadingSheet = false;
           this.loadingSheetService.LSForm.patchValue({
             lsType:response.lsType,
             NEXTLOC:response.nextloc,
             mathadiAmt:response.mathadiAmt,
             manualLsNO:response.manualLsNO,
             lsNO:response.lsNO,
             lsDate:new Date(response.lsDate),
             loadingCharge:response.loadingCharge,
             isMathadi:response.isMathadi,
           });
          if (response && Array.isArray(response.docketListForMFGeneration)) {
            this.loadingSheetService.setDocketList(response.docketListForMFGeneration);
          }
        }
      },error: (err) => {
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
    }
  }

formatDateNoTimezone(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
}

lSTransportMode(event: any) {
  const f = this.loadingSheetService.LSForm;
  const loadingBy = f.get('loadingBy');
  const vendorCode = f.get('vendorCode');
  const loadingCharge = f.get('loadingCharge');
  const rateType = f.get('rateType');
  const setRequired = (ctrl: any, validators: any[]) => {
    ctrl?.setValidators(validators);
    ctrl?.updateValueAndValidity();
  };
  const clearField = (ctrl: any) => {
    ctrl?.clearValidators();
    ctrl?.setValue(null);
    ctrl?.updateValueAndValidity();
  };
  if (event?.codeId === 'S') {
    setRequired(loadingBy, [Validators.required]);
    setRequired(vendorCode, [Validators.required]);
    setRequired(loadingCharge, [Validators.required, Validators.min(0.01)]);
  } else {
    clearField(loadingBy);
    clearField(vendorCode);
    clearField(0);
    clearField(rateType);
  }
}

  getDocketListForMFDetail(){
    this.isLoadingSheet = true;
    const payload={
      baseLocationCode: this.docketService.loginUserList.LocationCode,
      nextStopLocation: this.loadingSheetService.LSForm.value.nextStopLocation,
      transportMode: this.loadingSheetService.LSForm.value.transportMode || '',
      fromDate: this.loadingSheetService.LSForm.value.reportrange ? this.formatDateNoTimezone(this.loadingSheetService.LSForm.value.reportrange[0]) : null,
      toDate: this.loadingSheetService.LSForm.value.reportrange ? this.formatDateNoTimezone(this.loadingSheetService.LSForm.value.reportrange[1]): null,
      destinationList: this.loadingSheetService.LSForm.value.destinationList,
      docketNoList:this.loadingSheetService.LSForm.value.docketNoList,
      lsDate: this.formatDateNoTimezone(new Date(this.loadingSheetService.LSForm.value.lsDate)),
      loadingBy: this.loadingSheetService.LSForm.value.loadingBy ||'',
      rateType: this.loadingSheetService.LSForm.value.rateType || '',
      baseCompanyCode:this.docketService.loginUserList.Companycode
    }
    this.loadingSheetApiService.getDocketListForMF(payload).subscribe({
      next: (response) => {
        this.isLoadingSheet = false;
        if (response && Array.isArray(response)) {
          this.loadingSheetService.setDocketList(response);
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
  } else if(packageLB < 1){
    row.get('PackageLB')?.setErrors({ minLimit: true });
  }else {
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


}
