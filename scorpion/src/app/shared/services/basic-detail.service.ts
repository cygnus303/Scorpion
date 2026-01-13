import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { finalize, Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import { billingPartyRequest, cityResponse, DestinationsList, DKTChargesResponse, GSTNOListResponse, IGSTchargesDetailResponse, pinCodeResponse } from '../models/general-master.model';
import { DocketService } from './docket.service';
import { ApiLoadingService } from './APILoading.service';

@Injectable({
  providedIn: 'root'
})
export class BasicDetailService {
loginData: any = JSON.parse(localStorage.getItem("loginUserList") || 'null');

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService,public apiLoading: ApiLoadingService) {}

  getGeneralMasterList(codeType: string, searchText: string | null, codeId: string | number | null): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`External/${codeType}`, {
      searchText: searchText || '', codeId: codeId ?? ''
    });
  }

  getBillingParty(payload: billingPartyRequest): Observable<IApiBaseResponse<any[]>> {
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
    return this.apiHandlerService.Get(`Operation/gst-details?gstNo=${searchTerm}&baseCompanyCode=${this.loginData.Companycode}`);
  }
  GetStep2Details(data: any): Observable<IApiBaseResponse<GSTNOListResponse>> {
    return this.apiHandlerService.Get(`Operation/GetStep2Details`, data);
  }

  getChargeDetail(): Observable<any> {
    return this.apiHandlerService.Get(`Operation/dkt-charges`);
  }

  getIGSTchargesDetail(): Observable<any> {
    return this.apiHandlerService.Get(`Operation/get-charges?DocumentType=${'DKT'}`);
  }


  getModulesRule(): Observable<IApiBaseResponse<DKTChargesResponse>> {
    return this.apiHandlerService.Get(`Operation/CYGNUS-Modules-Rules`);
  }

  getOtherChargesDetail(payload: any) {
     this.apiLoading.start();
    return this.apiHandlerService.Post(`Operation/GetOtherChargesDetails`, payload).pipe(
    finalize(() => this.apiLoading.stop()) // ✅ Stop loader automatically when API completes
  );
  }

  GetPincodeOrigin(data: any) {
    return this.apiHandlerService.Get(`Operation/GetPincodeOrigin`, data);
  }

  GetDKTGSTForGTA(data: any) {
    return this.apiHandlerService.Post(`Operation/GetDKTGSTForGTA`, data);
  }

  GetGSTFromTrnMode(data: any) {
    return this.apiHandlerService.Get(`Operation/GetGSTFromTrnMode?trnMode=${data}`);
  }
 GetFreightContractDetails(data: any) {
  // ✅ Start loader automatically
  this.apiLoading.start();

  // Call API
  return this.apiHandlerService.Post(`Operation/GetFreightContractDetails`, data).pipe(
    finalize(() => this.apiLoading.stop()) // ✅ Stop loader automatically when API completes
  );
}
  getGSTCalculation(data: any) {
    return this.apiHandlerService.Post(`Operation/GetDocketGSTCalculation`, data);
  }

  contractservicecharge(contractId: any, transType: any) {
    return this.apiHandlerService.Get(`Operation/contract-service-charges?contractId=${contractId}&transType=${transType}`);
  }

  getPincodematrix(payload:any){
    return this.apiHandlerService.Get(`Operation/GetPincodeMatrixRate?kmFromLocation=${payload.kmFromLocation}&chrgwt=${payload.chrgwt}`)
  }

  getRuleDetail(payload:any){
    return this.apiHandlerService.Get(`Operation/GetRuleDetails?key=${payload.key}&paybas=${payload.paybas}`)
  }

  GetProRataCharge(payload:any){
    return this.apiHandlerService.Get(`Operation/GetProRataCharge`,payload)
  }
   fromOperation(payload:any){
    return this.apiHandlerService.Get(`Operation`,payload)
  }

   getStaxPaidBy(id:any){
    return this.apiHandlerService.Get(`Operation/GetStaxPaidBy/${id}`)
  }

   getFovContractDetails(payload:any){
     this.apiLoading.start();
    return this.apiHandlerService.Post(`Operation/GetFovContractDetails`,payload).pipe(
    finalize(() => this.apiLoading.stop()) // ✅ Stop loader automatically when API completes
  );
  }

    onSubmit(data: any) {
    return this.apiHandlerService.Post(`Operation/submit`, data);
  }

  docketValidation(data:any){
     return this.apiHandlerService.Post(`Operation/Doketcheck`, data);
  }

   getStatesFromPartyCode(data:any){
     return this.apiHandlerService.Get(`Operation/GetStatesFromPartyCode?customerCode=${data}`);
  }

  getPincodeMasterList(cityCode:any){
    return this.apiHandlerService.Get(`Operation/GetPincodeMasterList?cityCode=${cityCode}`)
  }

  referenceDocket(data:any){
     return this.apiHandlerService.Post(`Operation/check-valid-docket`, data);
  }

  eWayBillData(ewaybillNo:string){
     return this.apiHandlerService.Get(`Operation/GetEwaybillDetail?ewaybillNo=${ewaybillNo}`);
  }

  checkEWayBill(ewaybillNo:string){
     return this.apiHandlerService.Get(`Operation/CheckEWBD?ewbNo=${ewaybillNo}`);
  }

  dateSelectionRule(payload:any){
     return this.apiHandlerService.Get(`Operation/GetDateRules?moduleCode=${payload.moduleCode}&baseUserName=${payload.baseUserName}`);
  }

  getCompletion(payload:any){
     return this.apiHandlerService.Post(`Docket/FinancialEdit`,payload);
  }

  completionSubmit(data: any) {
    return this.apiHandlerService.Post(`Operation/AddDocket`, data);
  }

   checkEditDocket(payload:any){
     return this.apiHandlerService.Post(`Docket/CheckEditDocket`,payload);
  }

  getODADetail(pincode:string){
    return this.apiHandlerService.Get(`Operation/GetPincodeMatrixCharges?pincode=${pincode}`)
  }

  getMaxDiscount(payload:any){
    return this.apiHandlerService.Get(`Operation/max-discount?contractId=${payload.contractId}&docketDate=${payload.docketDate}`)

  }

  getBlockedCustomerList(payload:any){
    return this.apiHandlerService.Post(`Operation/Customer_List`,payload)
  }
}
