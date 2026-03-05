import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

   constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

   getVendorData(params:any){
    return this.apiHandlerService.Get(`Operation/SearchVendorListJsonByFlag?flag=${params.flag}&vendorType=${params.vendorType}&searchTerm=${params.searchTerm}`);
   }
 
}
