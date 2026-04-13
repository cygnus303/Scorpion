import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';

@Injectable({
  providedIn: 'root'
})
export class PFMapiService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  PODForwardingList(payload: any) {
    return this.apiHandlerService.Post(`Operation/PODForwardingList`, payload);
  }

  PFMgenerate(payload: any) {
    return this.apiHandlerService.Post(`Operation/PFMgenerate`, payload);
  }

  PFMForward(payload: any) {
    return this.apiHandlerService.Post(`Operation/PFMforward`, payload);
  }

  NewForwardFMAckDocumentsDone(payload: any) {
    return this.apiHandlerService.Post(`Operation/NewForwardFMAckDocumentsDone`, payload);
  }

  PFMCourierUpdate(payload: any) {
    return this.apiHandlerService.Post(`Operation/PFMCourierUpdate`, payload);
  }

  GetCourierDetails(fmNo: string) {
    return this.apiHandlerService.Get(`Operation/GetCourierDetails?fmNo=${encodeURIComponent(fmNo)}`);
  }

  GetPrsList(payload: any) {
    return this.apiHandlerService.Post(`Operation/GetPrsList`, payload);
  }
}
