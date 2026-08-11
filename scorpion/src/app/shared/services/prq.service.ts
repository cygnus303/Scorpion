import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';

@Injectable({
  providedIn: 'root'
})
export class PrqService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

    getContractDetail(custCode:string){
     return this.apiHandlerService.Get(`Master/GetContractForPRQ?custCode=${custCode}`)
  }

  submitPRQ(payload:any){
     return this.apiHandlerService.Post(`Master/SubmitPRQRequest`,payload)
  }

   getBranchCityFromPincode(pincode: string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`Master/GetBranchCityFromPincode?pincode=${pincode}`);
  }
  
  getCustomerList(partyName: string, paybas: string = ''): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`Master/GetAllBillingParty?partyName=${partyName}&paybas=${paybas}`);
  }

  downloadTemplate(){
    return this.apiHandlerService.DownloadFile(`User/DownloadPRQTemplate`);
  }

  validateExcel(payload:any){
    return this.apiHandlerService.Post(`User/UploadPRQExcel`,payload);
  }

  uploadExcel(payload:any){
    return this.apiHandlerService.PostDownloadFile(`User/SubmitBulkPRQ`,payload);
  }
}
