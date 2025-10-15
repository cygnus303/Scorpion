import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import { CityResponse, VendeorsResponse } from '../models/thc-master.model';

@Injectable({
  providedIn: 'root'
})
export class THCMasterService {


  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) {}

  getVendorsList(vendors: any) {
      return this.apiHandlerService.Post(`THC/GetVendors`,vendors);
    }

    getCityList(): Observable<any> {
      return this.apiHandlerService.Get(`Operation/GetCity`);
    }
}
