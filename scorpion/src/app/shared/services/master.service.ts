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

   getVendorList(params:any){
    return this.apiHandlerService.Get(`Operation/GetVendorContractslist?vendorCode=${params.vendorCode}&matrixType=${params.matrixType}&vType=${params.vType}`);
   }

   getVendorContractTypeWise(params:any){
    return this.apiHandlerService.Get(`Operation/VendorContractTypeWise?Type=${params}`);
   }

    getRouteByMode(params:any){
    return this.apiHandlerService.Get(`Master/GetRouteByMode?id=${params.id}&searchTerm=${params.searchTerm}`);
   }
 
}
