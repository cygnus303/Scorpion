import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockUpdateService {

constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

 stockUpdateUsers(data: any): Observable<any> {
    return this.apiHandlerService.Get(`THC/stock-update-users?searchTerm=${data.searchTerm}&baseLocationCode=${data.baseLocationCode}`);
  }

  getArrivalDetail(params:any){
     return this.apiHandlerService.Get(`THC/arrival-details?id=${params.id}&loadBy=${params.loadBy}&chargeType=${params.chargeType}&BaseLocationCode=${params.BaseLocationCode}&BaseUserName=${params.BaseUserName}`);
  }

  THCArrival(paylaod:any){
     return this.apiHandlerService.Post(`THC/THCArrivalDetails`,paylaod);
  }

    getStockUpdateDetails(params:any){
     return this.apiHandlerService.Get(`THC/stockupdatedetails?id=${params.id}&BaseLocationCode=${params.baseLocationCode}`);
  }

    getWarehouseData(locCode :any){
     return this.apiHandlerService.Get(`THC/WarehouseData/${locCode }`);
  }

  getStockUpdateDetail(params:any){
     return this.apiHandlerService.Get(`THC/stockupdatedetails?id=${params.id}&BaseLocationCode=${params.baseLocationCode}`);
  }

    onStockupdate(formData: any) {
    return this.apiHandlerService.Post(`THC/stockupdate`, formData);
  }
}
