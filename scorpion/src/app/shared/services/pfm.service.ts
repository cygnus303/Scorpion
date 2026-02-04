import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';

@Injectable({
  providedIn: 'root'
})
export class PFMService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  checkScanSFDocNo(payload:any){
    return this.apiHandlerService.Get(`Operation/CheckScanFMDocno?docNo=${payload.docNo}&docType=${payload.docType}&documentNo=${payload.documentNo}&BaseLocationCode=${payload.BaseLocationCode}&HeadOfficeCode=${payload.HeadOfficeCode}`);
  }
}
