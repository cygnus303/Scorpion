import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import { billingTypeResponse } from '../models/general-master.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BasicDetailService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

    getBillingTypeList(codeType:string): Observable<IApiBaseResponse<billingTypeResponse[]>> {
    return this.apiHandlerService.Get(`Master/GetGeneralMasterData?CodeType=${codeType}`);
  }

    getBillingParty(searchTerm:string,location:string,paybs:string,header:HttpHeaders): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`Master/GetCustomerList?Search=${searchTerm}&Location=${location}&Paybas=${paybs}&${header}`);
  }

}
