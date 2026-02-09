import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PFMService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  checkScanSFDocNo(payload:any){
    return this.apiHandlerService.Get(`Operation/CheckScanFMDocno?docNo=${payload.docNo}&docType=${payload.docType}&documentNo=${payload.documentNo}&BaseLocationCode=${payload.BaseLocationCode}&HeadOfficeCode=${payload.HeadOfficeCode}`);
  }

  onSubmitScanFM(formData:any): Observable<any>{
    return this.apiHandlerService.Post(`Operation/add`,formData);
  }
}
