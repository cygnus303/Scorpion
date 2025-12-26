import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryUpdateService {

constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

 deliveryUpdate(paylaod: any): Observable<any> {
    return this.apiHandlerService.Post(`THC/add-update`,paylaod);
  }

    checkPODValidation(formData:any){
    return this.apiHandlerService.Post(`THC/check-validation`,formData);
   }
}
