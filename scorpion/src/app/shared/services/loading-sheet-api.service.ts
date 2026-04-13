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

  getUnLoaderUserList(LocationCode: any) {
    return this.apiHandlerService.Get(`Operation/GetUnLoaderUserList?BaseLocationCode=${LocationCode}`);
  }

  getLoadingSheet(data: any) {
    return this.apiHandlerService.Get(`Operation/GetLoadingSheet?type=${data.type}&tcno=${data.tcno}&isBCProcess=${data.isBCProcess}&BaseUserName=${data.BaseUserName}`);
  }

  getLoadingSheetListing(payload: any) {
    return this.apiHandlerService.Post(`Operation/GetLSListing`, payload);
  }
}
