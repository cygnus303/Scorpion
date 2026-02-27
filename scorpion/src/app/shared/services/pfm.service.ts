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

  getCustomerDetail(searchTerm:string): Observable<any>{
    return this.apiHandlerService.Get(`Operation/dropdown?searchTerm=${searchTerm}`);
  }

  getForwardFMDocuments(payload:any): Observable<any>{
    return this.apiHandlerService.Post(`Operation/ForwardFMDocuments`,payload);
  }

  onSubmitForward(payload:any): Observable<any>{
    return this.apiHandlerService.Post(`Operation/ForwardFMDocumentsDone`,payload);
  }

   getForwardFMAckDocuments(payload:any): Observable<any>{
    return this.apiHandlerService.Post(`Operation/ForwardFMAckDocuments`,payload);
  }

  getFMDOCDetail(fmNo: any): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetFMDOCDetail?fmNo=${encodeURIComponent(fmNo)}`);
  }

  onSubmitAcknowledge(payload:any): Observable<any>{
    return this.apiHandlerService.Post(`Operation/ForwardFMAckDocumentsDone`,payload);
  }
  
  validateDocket(dockNo:string,location:string): Observable<any>{
    return this.apiHandlerService.Get(`Operation/GetValidDockForPFMEdit?dockNo=${dockNo}&location=${location}`);
  }

  onSubmitAckEdit(payload:any): Observable<any>{
    return this.apiHandlerService.Post(`Operation/ForwardFMDocumentsEditDone`,payload);
  }

  getDocumentTrackList(data:any): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetDocumentTrackList?docType=${data.docType}&docNo=${data.DocNo}`);
  }

  getROList(locCode:string){
    return this.apiHandlerService.Get(`Operation/GetLocationListFromROJson?locCode=${locCode}`);
  }

  getFMReport(payload:any): Observable<any>{
    return this.apiHandlerService.Post(`Operation/FMReport`,payload);
  }

  GetLocationListFromRO(locCode:string){
    return this.apiHandlerService.Get(`Operation/GetLocationListFromRO?locCode=${locCode}`);
  }

  GetYetToScan(payload:any){
    return this.apiHandlerService.Post(`Operation/yet-to-scan`,payload);
  }
  
  companyMasterDetails(companyCode:string){
    return this.apiHandlerService.Get(`Operation/CompanyMasterDetails?companyCode=${companyCode}`);
  }


  getPODReport(payload:any){
    return this.apiHandlerService.Post(`Operation/Get-POD-PFM-Details`,payload);
  }
}
