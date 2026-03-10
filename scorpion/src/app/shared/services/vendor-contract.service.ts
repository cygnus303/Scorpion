import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MasterService } from './master.service';
import { VehicleNumbersResponse } from '../models/general-master.model';
import { BasicDetailService } from './basic-detail.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { CityResponse, VehicleTypeListResponse } from '../models/thc-master.model';
import { LocationResponse } from '../models/loading-sheet.model';
import { LoadingSheetApiService } from './loading-sheet-api.service';
import { DocketService } from './docket.service';
import saveAs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class VendorContractService {
  public RouteData: any[] = [];
  public nextRouteValue = 'Please enter atleast 1 character';
  public noVehicleValue = 'Please enter atleast 1 character';
  public vehicleNumberData: VehicleNumbersResponse[] = [];
  public vehicleTypeList:VehicleTypeListResponse[]=[];
  public vendorProfileForm !: FormGroup;
    public nextLocationValue = 'Please enter atleast 1 character';
  public locationData: LocationResponse[] = [];
  public cityList:CityResponse[]=[];

  constructor(
    private masterService:MasterService,
    public basicDetailService: BasicDetailService,
    public THCMasterService: THCMasterService,
    public loadingSheetApiService:LoadingSheetApiService,private docketService:DocketService
  ) { }

   buildForm() {
    this.vendorProfileForm = new FormGroup({
      CONTRACTCD: new FormControl(null),
      VendorName: new FormControl(null),
      VendorTypeName: new FormControl(null),
      ContractDt: new FormControl(new Date()),
      Valid_uptodt: new FormControl(new Date()),
      Start_Dt: new FormControl(new Date()),
      Contract_loccode: new FormControl(null),
      VendorPerName: new FormControl(null),
      VendorWitness: new FormControl(null),
      VendorPerDesg: new FormControl(null),
      CompEmpDesg: new FormControl(null),
      CompEmpName: new FormControl(null),
      CompWitness: new FormControl(null),
      VendorCity: new FormControl(null),
      VendorPin: new FormControl(null),
      Vendor_Address: new FormControl(null),
      TDSAppl_YN: new FormControl(false),
      VendorCategory: new FormControl(null),
      VendorContractCat: new FormControl(null),
      TDS_Rate: new FormControl(0),
      Security_deposit_chq: new FormControl(null),
      Payment_interval: new FormControl(null),
      Security_deposit_date: new FormControl(new Date()),
      Security_deposit_Amt: new FormControl(0),
      Payment_Basis: new FormControl(null),
      Payment_loc: new FormControl(null),
      Monthly_Phone_Charges: new FormControl(0),
      Default_Charge:new FormControl(0),
      VendorType:new FormControl(null),
      VendorCode:new FormControl(null),
      MetrixType:new FormControl(null),
      ContractType:new FormControl(null),
      ContractId:new FormControl(null),
      routeBasedContracts: new FormArray([]), 
      distanceBasedContracts: new FormArray([]),
      cnoteBasedContracts: new FormArray([]),
      cnoteDeliveryCharges: new FormArray([]) 
    })
  }

  get routeBasedContracts(): FormArray {
    return this.vendorProfileForm.get('routeBasedContracts') as FormArray;
  }

  addRouteBasedContract() {
    const routeContract = new FormGroup({
      transMode: new FormControl(null,this.vendorProfileForm.value.VendorType === 'XX1' ? Validators.required :null),
      routeCode: new FormControl(null,this.vendorProfileForm.value.VendorType === 'XX1' ? Validators.required :null),
      ftL_Type: new FormControl(null),
      min_Charge: new FormControl(0),
      max_Charge: new FormControl(0),
      rate_Type: new FormControl(null),
      chg_Rate: new FormControl(0),
      id: new FormControl(0),
    });
    this.routeBasedContracts.push(routeContract);
  }

 removeRouteBasedContract(index: number) {
    this.routeBasedContracts.removeAt(index);
  }

  addRouteContract() {
    this.addRouteBasedContract();
  }

  get distanceBasedContracts(): FormArray {
    return this.vendorProfileForm.get('distanceBasedContracts') as FormArray;
  }

   addDistanceBasedContract() {
    const distanceContract = new FormGroup({
      ftL_Type: new FormControl(null),
      vehicle_Type: new FormControl(null),
      vehicle_Number: new FormControl(null),
      min_Amt_Committed: new FormControl(0),
      committed_Km: new FormControl(0),
      chg_Per_Add_Km: new FormControl(0),
      max_Amt_Committed: new FormControl(0),
      trips_PM: new FormControl(0),
      id: new FormControl(0),
    });
    this.distanceBasedContracts.push(distanceContract);
  }

  removeDistanceBasedContract(index: number) {
    this.distanceBasedContracts.removeAt(index);
  }

   addDistanceContract() {
    this.addDistanceBasedContract();
  }

  get cnoteBasedContracts(): FormArray {
    return this.vendorProfileForm.get('cnoteBasedContracts') as FormArray;
  }

  addCnoteBasedContract() {
    const group = new FormGroup({
      city: new FormControl(null,this.vendorProfileForm.value.VendorType === '04' ? Validators.required :null),
      location:new FormControl(null,this.vendorProfileForm.value.VendorType === '04' ? Validators.required :null),
      payBas: new FormControl(null),
      transMode: new FormControl(null),
      min_Charge: new FormControl(null),
      serviceType: new FormControl(null),
      rate_Type: new FormControl(null),
      chg_Rate: new FormControl(null),
      max_Charge: new FormControl(null),
      id: new FormControl(0),
    });

    this.cnoteBasedContracts.push(group);
  }

  removeCnoteBasedContract(index: number) {
    this.cnoteBasedContracts.removeAt(index);
  }

  addCnoteContract() {
    this.addCnoteBasedContract();
  }

  
  get cnoteDeliveryCharges(): FormArray {
    return this.vendorProfileForm.get('cnoteDeliveryCharges') as FormArray;
  }

  addCnoteDeliveryCharges() {
    const group = new FormGroup({
      location: new FormControl(null,this.vendorProfileForm.value.VendorType === '04' ? Validators.required :null),
      city: new FormControl(null,this.vendorProfileForm.value.VendorType === '04' ? Validators.required :null),
      payBas: new FormControl(null),
      transMode: new FormControl(null),
      oda: new FormControl(null),
      min_Charge: new FormControl(null),
      serviceType: new FormControl(null),
      rate_Type: new FormControl(null),
      chg_Rate: new FormControl(null),
      max_Charge: new FormControl(null),
      id: new FormControl(0),
    });
    this.cnoteDeliveryCharges.push(group);
  }

  removeCnoteDeliveryCharges(index: number) {
    this.cnoteDeliveryCharges.removeAt(index);
  }

  addDeliveryCharges() {
    this.addCnoteDeliveryCharges();
  }

   getRouteDetail(event: any, index: number) {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.nextRouteValue = 'Please enter at least 1 characters';
      return;
    }
     const mode =
       this.routeBasedContracts.at(index).get('transMode')?.value;
     const data = {
       searchTerm: searchText,
       id: mode
     };
    this.nextRouteValue = 'Searching..'
    this.masterService.getRouteByMode(data).subscribe({
      next: (response:any) => {
        if (response) {
          this.RouteData = response;
          this.nextRouteValue = 'No matches found';
        } else {
          this.RouteData = []
          this.nextRouteValue = ''
        }
      }
    });
  }

    resetNextRouteDropdown() {
    this.RouteData = [];
    this.nextRouteValue = 'Please enter at least 1 characters';
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
          this.vehicleNumberData = []
          this.noVehicleValue = ''
        }
      }
    });
  }

  resetvehicleNoDropdown() {
    this.vehicleNumberData = [];
    this.noVehicleValue = 'Please enter at least 1 characters';
  }

  getVehicleType(vehicleNo: string) {
    this.THCMasterService.getVehicleType(vehicleNo).subscribe({next: (response: any) => {
        if (response) {
          this.vehicleTypeList = response.data;
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
          this.locationData = [
          {
            id: 'All',
            text: 'All'
          },
          ...response.data
        ];
          this.nextLocationValue = 'No matches found';
        } else {
          this.locationData = []
          this.nextLocationValue = ''
        }
      }
    });
  }

    getCityList() {
    this.THCMasterService.getCityList().subscribe({
      next: (response) => {
        if (response) {
          this.cityList = [
          {
            city_code: 'All',
            location: 'All'
          },
          ...response
        ];
        }
      },
    });
  }

  DownloadContractExcelTemplate() {
    const parmas = {
      matrixType: this.vendorProfileForm.value.MetrixType,
      contractId: this.vendorProfileForm.value.ContractId || 0,
      moduleType: '1'
    }
    this.masterService.DownloadContractExcelTemplate(parmas).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, 'VendorRouteBaseContractTemplate.xlsx');
      },
      error: (err) => console.error('Excel export failed', err)
    });
  }
}
