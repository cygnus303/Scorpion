import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { ApiLoadingService } from './APILoading.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';

@Injectable({
  providedIn: 'root'
})
export class LrService {
   constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService,public apiLoading: ApiLoadingService) {}
  
    getLRList(payload:any): Observable<IApiBaseResponse<any[]>> {
      return this.apiHandlerService.Post(`Operation/GetLRListing`,payload);
    }

}
