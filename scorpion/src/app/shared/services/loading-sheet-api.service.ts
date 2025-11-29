import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingSheetApiService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) {}

  getLocationList(searchTerm:string){
    return this.apiHandlerService.Get(`Operation/GetLocationList?searchTerm=${searchTerm}`);
  }

  getDocketListForMF(payload:any){
    return this.apiHandlerService.Post(`Operation/GetDocketListForMFGeneration`,payload);
  }

  prepareLoadingSheet(payload: any) {
    return this.apiHandlerService.Post(`Operation/PrepareLoadingSheet`, payload);
  }

}
