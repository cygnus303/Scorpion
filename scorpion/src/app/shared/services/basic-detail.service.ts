import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import {  billingPartyRequest, cityResponse, DestinationsList, DKTChargesResponse, GSTNOListResponse, IGSTchargesDetailResponse, pinCodeResponse } from '../models/general-master.model';

@Injectable({
  providedIn: 'root'
})
export class BasicDetailService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  getGeneralMasterList(codeType: string, searchText: string | null,codeId: string | number | null): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`External/${codeType}`, {
      searchText: searchText || '',codeId: codeId ?? ''
    });
  }

  getBillingParty(payload:billingPartyRequest): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`Operation/billing-party?PartyName=${payload.searchTerm}&Paybas=${payload.paybs}&Location=${payload.location}`);
  }

  getpincodeData(searchTerm: string): Observable<IApiBaseResponse<pinCodeResponse[]>> {
    return this.apiHandlerService.Get(`Operation/pincode?prefix=${searchTerm}`);
  }

  getCityData(locCode: string, searchTerm: string): Observable<IApiBaseResponse<cityResponse[]>> {
    return this.apiHandlerService.Get(`Operation/citymaster-by-location?LocCode=${locCode}&Prefix=${searchTerm}`);
  }

 getGCDestinations(searchTerm: string): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetGCDestinations?prefix=${searchTerm}`);
  }

  getGetVehicleNumbers(searchTerm: string): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetVehicleNumbers?prefix=${searchTerm}`);
  }

  getGSTNODetailsList(searchTerm: string): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetGSTNODetails?ewbNo=${searchTerm}`);
  }
  getGSTNOList(searchTerm: string): Observable<IApiBaseResponse<GSTNOListResponse>> {
    return this.apiHandlerService.Get(`Operation/gst-details?gstNo=${searchTerm}&baseCompanyCode=${'C003'}`);
  }
  GetStep2Details(data: any): Observable<IApiBaseResponse<GSTNOListResponse>> {
    return this.apiHandlerService.Get(`Operation/GetStep2Details`,data);
  }

  getChargeDetail(): Observable<any>{
    return this.apiHandlerService.Get(`Operation/dkt-charges`);
  }

   getIGSTchargesDetail(): Observable<any>{
    return this.apiHandlerService.Get(`Operation/get-charges?DocumentType=${'DKT'}`);
  }


  get(): Observable<IApiBaseResponse<DKTChargesResponse>>{
    return this.apiHandlerService.Get(`Operation/CYGNUS-Modules-Rules`);
  }

  getOtherChargesDetail(){
    return this.apiHandlerService.Get(`Operation/GetOtherChargesDetails`);
  }

   GetPincodeOrigin(data: any){
    return this.apiHandlerService.Get(`Operation/GetPincodeOrigin`,data);
  }

   GetDKTGSTForGTA(data: any){
    return this.apiHandlerService.Post(`Operation/GetDKTGSTForGTA`,data);
  }

     GetGSTFromTrnMode(data: any){
    return this.apiHandlerService.Get(`Operation/GetGSTFromTrnMode?trnMode=${data}`);
  }
 GetFreightContractDetails(data: any){
    return this.apiHandlerService.Post(`Operation/GetFreightContractDetails`, data);
  }
}
