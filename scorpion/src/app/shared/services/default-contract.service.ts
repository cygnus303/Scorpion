import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { LoadingService } from './loading.service';
import { finalize } from 'rxjs';
 

@Injectable({
  providedIn: 'root'
})
export class DefaultContractService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService,public apiLoading: LoadingService) { }


  calculateRate(payload:any){
    this.apiLoading.start();
  return this.apiHandlerService.Post(`Docket/CalculateRate`, payload).pipe(
    finalize(() => this.apiLoading.stop()) // ✅ Stop loader automatically when API completes
  );
  }

    DocketEnquirySubmit(payload:any){
    return this.apiHandlerService.Post(`Docket/DocketEnquiry_Submit`,payload);
  }


}
