import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { DeliveryAgent } from '../models/delivery-agent.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryAgentService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }


  addDeliveryAgent(paylaod: any): Observable<any> {
    return this.apiHandlerService.Post(`Master/AddOrUpdate`,paylaod);
  }

  getDeliveryAgent():Observable<any> {
    return this.apiHandlerService.Get(`Master/GetDAList`);
  }
}
