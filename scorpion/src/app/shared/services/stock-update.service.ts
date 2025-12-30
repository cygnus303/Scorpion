import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockUpdateService {

constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

 deliveryUpdate(): Observable<any> {
    return this.apiHandlerService.Get(`stock-update-users`);
  }

}
