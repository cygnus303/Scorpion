import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
  public LsTypeList = [
    {
      text: "LTL",
      value: "LTL"
    },
    {
      text: "FTL",
      value: "FTL"
    }
  ];
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
  LoadingSheetList = [
    {
      "CnoteNo": "62970933",
      "ManualCnoteNo": "62970933",
      "BkgDate": "31 Oct 25",
      "TransMode": "ROAD CARGO",
      "BkgLoc": "PIM",
      "DelyLoc": "CNI",
      "CityFromTo": "PIMPLAS - CHENNAI",
      "CommDelyDate": "03 Nov 2025",
      "Rate": "PER KG",
      "Pkgs_LB": 10,
      "Wt_LB": 120
    },
    {
      "CnoteNo": "62970934",
      "ManualCnoteNo": "62970934",
      "BkgDate": "31 Oct 25",
      "TransMode": "ROAD CARGO",
      "BkgLoc": "PIM",
      "DelyLoc": "AMD",
      "CityFromTo": "PIMPLAS - AHMEDABAD",
      "CommDelyDate": "03 Nov 2025",
      "Rate": "PER KG",
      "Pkgs_LB": 10,
      "Wt_LB": 140
    },
    {
      "CnoteNo": "62970935",
      "ManualCnoteNo": "62970935",
      "BkgDate": "31 Oct 25",
      "TransMode": "ROAD CARGO",
      "BkgLoc": "PIM",
      "DelyLoc": "KUMR",
      "CityFromTo": "PIMPLAS - BAMUNIMAIDAN",
      "CommDelyDate": "09 Nov 2025",
      "Rate": "PER KG",
      "Pkgs_LB": 30,
      "Wt_LB": 22
    },
    {
      "CnoteNo": "62970936",
      "ManualCnoteNo": "62970936",
      "BkgDate": "06 Nov 25",
      "TransMode": "ROAD CARGO",
      "BkgLoc": "PIM",
      "DelyLoc": "AMD",
      "CityFromTo": "PIMPLAS - AHMEDABAD",
      "CommDelyDate": "10 Nov 2025",
      "Rate": "PER KG",
      "Pkgs_LB": 8,
      "Wt_LB": 265
    },
    {
      "CnoteNo": "62970937",
      "ManualCnoteNo": "62970937",
      "BkgDate": "06 Nov 25",
      "TransMode": "ROAD CARGO",
      "BkgLoc": "PIM",
      "DelyLoc": "AMD",
      "CityFromTo": "PIMPLAS - AHMEDABAD",
      "CommDelyDate": "10 Nov 2025",
      "Rate": "PER KG",
      "Pkgs_LB": 2,
      "Wt_LB": 120
    },
    {
      "CnoteNo": "62970938",
      "ManualCnoteNo": "62970938",
      "BkgDate": "06 Nov 25",
      "TransMode": "ROAD CARGO",
      "BkgLoc": "PIM",
      "DelyLoc": "JAI",
      "CityFromTo": "PIMPLAS - JAIPUR",
      "CommDelyDate": "10 Nov 2025",
      "Rate": "PER KG",
      "Pkgs_LB": 2,
      "Wt_LB": 20
    }
  ]

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
  }
  
  getvendoCodeData(event:any){
    this.loadingSheetService.LSForm.patchValue({VendorName:event?.codeDesc})
    this.challanService.branchWiseLoadingUnloading(event?.codeId)
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
    this.isgetLoadingList = true
  }

}
