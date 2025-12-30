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

}
