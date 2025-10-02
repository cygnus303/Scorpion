import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { DeliveryAgent } from '../models/delivery-agent.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryAgentService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }


  addDeliveryAgent(paylaod: DeliveryAgent): Observable<any> {
    return this.apiHandlerService.Post(`Master/AddOrUpdate`,paylaod);
  }
}
