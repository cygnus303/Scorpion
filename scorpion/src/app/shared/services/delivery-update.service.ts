import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryUpdateService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  deliveryUpdate(paylaod: any): Observable<any> {
    return this.apiHandlerService.Post(`THC/add-update`, paylaod);
  }

  counterDelivery(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`THC/CounterDelivery`, payload);
  }

  checkPODValidation(formData: any) {
    return this.apiHandlerService.Post(`THC/check-validation`, formData);
  }

  CheckPODValidation(formData: any, BaseUserName: string) {
    return this.apiHandlerService.Post(`THC/CheckPODValidation?BaseUserName=${BaseUserName}`, formData);
  }
}
