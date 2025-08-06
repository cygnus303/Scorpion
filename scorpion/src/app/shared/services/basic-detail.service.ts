import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import {  billingPartyRequest, cityResponse, DestinationsList, pinCodeResponse } from '../models/general-master.model';

@Injectable({
  providedIn: 'root'
})
export class BasicDetailService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  getGeneralMasterList(codeType: string, searchText: string | null): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`External/${codeType}`, {
      searchText: searchText || ''
    });
  }

  getBillingParty(payload:billingPartyRequest): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`Operation/billing-party?PartyName=${payload.searchTerm}&Paybas=${payload.paybs}&Location=${payload.location}`);
  }

  getpincodeData(searchTerm: string): Observable<IApiBaseResponse<pinCodeResponse[]>> {
    return this.apiHandlerService.Get(`Operation/pincode?prefix=${searchTerm}`);
  }

  getCityData(locCode: string, searchTerm: string): Observable<IApiBaseResponse<cityResponse[]>> {
    return this.apiHandlerService.Get(`Operation/citymaster-by-location?LocCode=${locCode}&Prefix=${searchTerm}`);
  }

 getGCDestinations(searchTerm: string): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetGCDestinations?prefix=${searchTerm}`);
  }

  getGetVehicleNumbers(searchTerm: string): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetVehicleNumbers?prefix=${searchTerm}`);
  }

  getGSTNODetailsList(searchTerm: string): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetGSTNODetails?ewbNo=${searchTerm}`);
  }
}
