import { Injectable } from '@angular/core';
import { PFMService } from './pfm.service';
import { DocketService } from './docket.service';

@Injectable({
  providedIn: 'root'
})
export class ScanFmDocumentsService {
  public ROData: any;
  public locationList: any;
  constructor(public pfmService: PFMService, public docketService: DocketService) { }
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
}
