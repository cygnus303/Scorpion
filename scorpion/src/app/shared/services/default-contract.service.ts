import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';

@Injectable({
  providedIn: 'root'
})
export class DefaultContractService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }


  calculateRate(payload:any){
    return this.apiHandlerService.Post(`Docket/CalculateRate`,payload);
  }

    DocketEnquirySubmit(payload:any){
    return this.apiHandlerService.Post(`Docket/DocketEnquiry_Submit`,payload);
  }


}
