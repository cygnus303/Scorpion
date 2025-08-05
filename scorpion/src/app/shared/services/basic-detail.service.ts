import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import { billingTypeResponse, cityResponse, pinCodeResponse } from '../models/general-master.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BasicDetailService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  getBillingTypeList(codeType: string, searchText: string | null): Observable<IApiBaseResponse<billingTypeResponse[]>> {
    return this.apiHandlerService.Get(`External/${codeType}?searchText=${searchText}`);
  }

  getBillingParty(searchTerm: string, location: string, paybs: string, header: HttpHeaders): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`Master/GetCustomerList?Search=${searchTerm}&Location=${location}&Paybas=${paybs}&${header}`);
  }

  getpincodeData(searchTerm: string): Observable<IApiBaseResponse<pinCodeResponse[]>> {
    return this.apiHandlerService.Get(`Operation/pincode?prefix=${searchTerm}`);
  }

  getCityData(locCode: string, searchTerm: string): Observable<IApiBaseResponse<cityResponse[]>> {
    return this.apiHandlerService.Get(`Operation/citymaster-by-location?LocCode=${locCode}&Prefix=${searchTerm}`);
  }


}
