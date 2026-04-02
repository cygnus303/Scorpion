import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';

@Injectable({
  providedIn: 'root'
})
export class PRSDRSApiService {

   constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

   getDRSList(payload: any) {
    return this.apiHandlerService.Post('THC/DRSNewList', payload);
   }

   onCancelDRS(payload: any) {
    return this.apiHandlerService.Post(`THC/PDCCancellationSubmit`, payload);
   }
  
}
