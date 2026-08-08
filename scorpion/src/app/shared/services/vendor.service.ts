import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService,) { }

  queryResponse(formData:any){
    return this.apiHandlerService.Post(`Master/SubmitVendorQueryResponse`,formData);
  }
}
