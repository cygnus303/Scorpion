import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import { billingTypeResponse } from '../models/general-master.model';

@Injectable({
  providedIn: 'root'
})
export class GeneralMasterService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

    getBillingTypeList(codeType:string): Observable<IApiBaseResponse<billingTypeResponse[]>> {
    return this.apiHandlerService.Get(`Master/GetGeneralMasterData?CodeType=${codeType}`);
  }

    getBillingParty(searchTerm:string,location:string,paybs:string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`Master/GetCustomerList?Search=${searchTerm}&Location=${location}&Paybas=${paybs}`);
  }
}
