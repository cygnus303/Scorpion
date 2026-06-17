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

    cancelDocket(payload:any): Observable<IApiBaseResponse<any[]>>{
      return this.apiHandlerService.Post(`Operation/CancelDocket`,payload);
    }
    exportLRListing(params: any): Observable<any> {
      let query = `locCode=${params.locCode}&statusFilter=${params.statusFilter}&searchText=${params.searchText}&startDate=${params.startDate}&endDate=${params.endDate}`;
      return this.apiHandlerService.Get(`Operation/ExportLRListing?${query}`);
    }

    lrViewDetail(lrNumber:string): Observable<IApiBaseResponse<any[]>> {
      return this.apiHandlerService.Get(`Operation/View_LR_Details?lrNumber=${lrNumber}`);
    }
}
