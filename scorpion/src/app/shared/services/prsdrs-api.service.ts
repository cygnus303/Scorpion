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

   docketList(drsNo:string){
    return this.apiHandlerService.Get(`THC/pending-docketsDrs?drsNo=${drsNo}`);
   }

   singleDRSUpdateDetail(params:any){
    return this.apiHandlerService.Get(`THC/GetUpdateDRSDataById?dockNo=${params.dockNo}&drsCode=${params.drsCode}&dockSf=${params.dockSf}`);
   }

   getDeliveryDetail(){
    return this.apiHandlerService.Get(`THC/delivery-reasons`);
   }

   submitSingleCnoteDRSUpdate(payload:any){
    return this.apiHandlerService.Post(`THC/update-single-drs`, payload);
   }

  GetTHCFinancialEditDetail(payload:any){
    return this.apiHandlerService.Post(`THC/GetTHCFinancialEditDetail`, payload);
   }

  GetInvokeContractDetailsDktwise(payload: any) {
    return this.apiHandlerService.Post(`THC/GetInvokeContractDetailsDktwise`, payload);
  }

  THCEditUpdate(payload: any) {
    return this.apiHandlerService.Post(`THC/THCEditUpdate`, payload);
  }

   getTHCArrivalList(payload:any){
    return this.apiHandlerService.Post(`THC/GetTHCArrivalList`, payload);
  }

  getTHCList(payload:any){
    return this.apiHandlerService.Post(`THC/GetTHCNewlList`, payload);
  }

  getTHCEditDetail(params:any){
    return this.apiHandlerService.Get(`THC/THCFinancialEditDetail?thcNo=${params.thcNo}&vendorType=${params.vendorType}`);
  }

  THCSubmit(payload:any){
    return this.apiHandlerService.Post(`THC/THCCriteriaSubmit`,payload);
  }
  
}
