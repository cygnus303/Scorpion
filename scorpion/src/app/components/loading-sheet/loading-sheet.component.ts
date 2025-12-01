import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
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
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-loading-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule],
  templateUrl: './loading-sheet.component.html',
  styleUrls: ['./loading-sheet.component.scss']
})
export class LoadingSheetComponent {
  public isgetLoadingList: boolean = false;
  public nextLocationValue = 'Please enter atleast 1 character';
  public noVehicleValue = 'Please enter atleast 1 character';
  public locationData: LocationResponse[] = [];
  public vehicleNumberData: VehicleNumbersResponse[] = [];
  public LoadingSheetList:any;
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
      this.docketService.loginUserList.LocationCode =  'PIM';
      this.docketService.loginUserList.Type = 'LS';
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }

    this.loadingSheetService.buildForm();
    this.getVendorType();
    this.generalMasterService.getLSModedata();
    this.generalMasterService.getModeData();
    this.generalMasterService.getChargeTypeData();
    this.isgetLoadingList =  this.docketService.loginUserList.Type === 'ULS' ? true :false;
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
    if (this.loadingSheetService.LSForm.value.loadingBy) {
      rateType?.setValidators([Validators.required]);
    } else {
      rateType?.clearValidators();
      rateType?.setValue('');
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
    this.getDocketListForMFDetail();
        const form = this.loadingSheetService.LSForm;
    if (form.get('loadingBy')?.valid && form.get('nextStopLocation')?.valid) {
      this.isgetLoadingList = true;
    } else {
      this.isgetLoadingList = false;
       form.markAllAsTouched();
    }
  }

formatDateNoTimezone(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
}

  getDocketListForMFDetail(){
    const payload={
      baseLocationCode: this.docketService.loginUserList.LocationCode,
      nextStopLocation: this.loadingSheetService.LSForm.value.nextStopLocation,
      transportMode: this.loadingSheetService.LSForm.value.transportMode,
      fromDate: this.loadingSheetService.LSForm.value.reportrange ? this.formatDateNoTimezone(this.loadingSheetService.LSForm.value.reportrange[0]) : null,
      toDate: this.loadingSheetService.LSForm.value.reportrange ? this.formatDateNoTimezone(this.loadingSheetService.LSForm.value.reportrange[1]): null,
      destinationList: this.loadingSheetService.LSForm.value.destinationList,
      docketNoList:this.loadingSheetService.LSForm.value.docketNoList,
      lsDate: new Date(this.loadingSheetService.LSForm.value.lsDate)?.toISOString(),
      loadingBy: this.loadingSheetService.LSForm.value.loadingBy,
      rateType: this.loadingSheetService.LSForm.value.rateType,
      baseCompanyCode:this.docketService.loginUserList.Companycode
    }
    this.loadingSheetApiService.getDocketListForMF(payload).subscribe({
      next: (response) => {
        console.log(response);
        if(response && Array.isArray(response)){
        this.loadingSheetService.setDocketList(response);
        }
      }
    });
  }

  totalSelected:any
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

  this.totalSelected = formArray.controls.filter(
    (g: any) => g.value.isChecked
  ).length;

  console.log("Total selected =", this.totalSelected);
}

 
}
