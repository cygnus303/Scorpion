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
}
