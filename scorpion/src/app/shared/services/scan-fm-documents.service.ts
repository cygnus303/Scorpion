import { Injectable } from '@angular/core';
import { PFMService } from './pfm.service';
import { DocketService } from './docket.service';
import { LoadingSheetApiService } from './loading-sheet-api.service';
import { LocationResponse } from '../models/loading-sheet.model';

@Injectable({
  providedIn: 'root'
})
export class ScanFmDocumentsService {
  public locationData: LocationResponse[] = [];
  public nextLocationValue = 'Please enter atleast 1 character';
  public ROData: any;
  public locationList: any;
  public companyMasterDetailsList: any;
  public recordOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: 'All', value: 'all' }
  ];

  constructor(public pfmService: PFMService, public docketService: DocketService,public loadingSheetApiService: LoadingSheetApiService,) { }
  getLocationData() {
    this.pfmService.getROList(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        this.ROData = response;
      }
    })
  }

  getLocationListFromROList(event: any) {
    this.pfmService.GetLocationListFromRO(event).subscribe({
      next: (response) => {
        this.locationList = response;
      }
    })
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

   getCompanyMasterDetails() {
    this.pfmService.companyMasterDetails(this.docketService.loginUserList.Companycode).subscribe({
      next: (response) => {
        this.companyMasterDetailsList = response.data;
      }
    })
  }

}
