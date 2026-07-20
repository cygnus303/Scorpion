import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { finalize, Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import { PRSGeneralMasterResponse } from '../models/thc-master.model';
import { ApiLoadingService } from './APILoading.service';

@Injectable({
  providedIn: 'root'
})
export class THCMasterService {


  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService, public apiLoading: ApiLoadingService) { }

  getVendorsList(vendors: any) {
    return this.apiHandlerService.Post(`THC/GetVendors`, vendors);
  }

  getCityList(): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetCity`);
  }

  getTripSheet(vehicleNo: string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/TripSheetFromVehicle?vehicleNo=${vehicleNo}`);
  }

  getVahicleCapacity(id: string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/VehicleCapacity?id=${id}`);
  }

  getPANnumber(vendor: any): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/GetPanNoFromVendor?vendor=${vendor}`);
  }

  getvehicleDetailFromVendor(vendorType: string, vendor: string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/VehicleFromVendor?vendorType=${vendorType}&vendor=${vendor}`);
  }

  getTDSLedger(): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/GetTDSLedger`);
  }

  getNewVehicleDetail(vehicleNo: string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/NewGetVehicleDetails?vehicleNo=${vehicleNo}`);
  }

  getDAList(type: string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/GetDeliveryAgentList?type=${type}`);
  }

  avalabledocketinPRS(vendors: any) {
    this.apiLoading.start();
    return this.apiHandlerService.Post(`THC/AvalabledocketinPRS`, vendors).pipe(
      finalize(() => this.apiLoading.stop())
    );
  }

  generate(data: any, vendors: any) {
    return this.apiHandlerService.Post(`THC/generate?TYP=${data.TYP}&BaseLocationCode=${data.baseLocationCode}&BaseCompanyCode=${data.baseCompanyCode}`, vendors);
  }

  getTDSDetailsFromVendor(vendorCode: any): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Post(`THC/GetTDSDetailsFromVendor`, vendorCode);
  }

  getDeliveryAgentMobileNo(agentCode: any): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Post(`THC/CheckAgentMRCollection`, agentCode);
  }

  getMFListFromRoute(payload: any): Observable<IApiBaseResponse<any[]>> {
    this.apiLoading.start();
    return this.apiHandlerService.Post(`THC/GetMFListFromRoute`, payload).pipe(
      finalize(() => this.apiLoading.stop())
    );
  }

  getRoutesFromRouteType(payload: any): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/GetRoutesFromRouteType?routeType=${payload.routeType}&isEmpty=${payload.isEmpty}&locationCode=${payload.locationCode}`);
  }

  challanSubmit(payload: any): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Post(`THC/ChallanSubmit`, payload);
  }


  getVehicleType(vehicleNo: string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/VehicleType?vehicleNo=${vehicleNo}`);
  }

  getEWayBillExpiryDateByMF(payload: any): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Post(`THC/GetEWayBillExpiryDateByMF`, payload);
  }

  getAirport(locationCode: string): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Get(`THC/GetAirport?locationCode=${locationCode}`);
  }

  getFlights(payload: any): Observable<IApiBaseResponse<any[]>> {
    return this.apiHandlerService.Post(`THC/GetFlights`, payload);
  }

  getCustomerListForTHC(searchTerm: string) {
    return this.apiHandlerService.Get(`THC/getCustomerListForTHC?searchTerm=${searchTerm}`);
  }

  getAllCityByLocation(locCode: string, searchTerm: string) {
    return this.apiHandlerService.Get(`THC/GetAllCityByLocation?locCode=${locCode}&searchTerm=${searchTerm}`);
  }

  getFlightSchTime(payload: any) {
    return this.apiHandlerService.Get(`THC/GetFlightSchTime?flight=${payload.flightCode}&airport=${payload.airport}`);
  }

  getChargesDetails() {
    return this.apiHandlerService.Get(`THC/GetChargesDetails?chargeType=${'GE'}`);
  }

  getContractData(payload: any) {
    return this.apiHandlerService.Post(`THC/GetContractAmount`, payload);
  }

  getDeliveryDetail(locationCode: string) {
    return this.apiHandlerService.Get(`THC/GetDeliveryZone?baseLocationCode=${locationCode}`);
  }

  getVehicleTypesForChallanFromRouteVendType(payload: any) {
    return this.apiHandlerService.Get(`THC/GetVehicleTypesForChallanFromRouteVendType?vehicleNo=${payload.vehicleNo}&routeMode=${payload.routeMode}&routeName=${payload.routeName}&vendorType=${payload.vendorType}&vendorCode=${payload.vendorCode}&thcType=${payload.thcType}&baseLocationCode=${payload.baseLocationCode}`);
  }

  getGeneralMasterDetail(codeType: string): Observable<IApiBaseResponse<PRSGeneralMasterResponse[]>> {
    return this.apiHandlerService.Get(`THC/GetGeneralMasterDetails?codeType=${codeType}`);
  }

  getGetBookedBy(id: string, locationCode: string, username: string) {
    return this.apiHandlerService.Get(`THC/GetBookedBy?id=${id}&location=${locationCode}&username=${username}`);
  }

  getERDDate(payload: any) {
    return this.apiHandlerService.Get(`THC/GetERD?routeCode=${payload.routeCode}&thcDate=${payload.thcDate}`);

  }

  getVendorType(location: any) {
    return this.apiHandlerService.Get(`THC/GetVendorType?location=${location}`);
  }

  getUserList(searchTerm: any) {
    return this.apiHandlerService.Post(`THC/SearchUsers`, searchTerm);
  }

  getBranchWiseLoadingUnloadingVendorList(data: any) {
    return this.apiHandlerService.Get(`THC/getBranchWiseLoadingUnloadingVendorListJson?type=${data?.type ? data?.type : 'L'}&vendorType=${data.vendorType}&baseLocationCode=${data.baseLocationCode}`);
  }

  getLoadingCharge(data: any) {
    return this.apiHandlerService.Get(`THC/GetLoadingCharge?brdc=${data.brdc}&loadingBy=${data.loadingBy}&chargeType=${data.chargeType}&typeModule=${data.typeModule}&vendorCode=${data.vendorCode}&loadUnloadType=${data.loadUnloadType}`);
  }

  getDeliveryUpdateData(data: any) {
    return this.apiHandlerService.Get(`THC/UpdateDRS?drsId=${data.drsId}&loadBy=${data.loadBy}&chargeType=${data.chargeType}&baseLocationCode=${data.baseLocationCode}`);
  }

  getDeliveryAgents(baseLocationCode: string) {
    return this.apiHandlerService.Get(`THC/DeliveryAgents?baseLocationCode=${baseLocationCode}`);
  }

  getPRSArrivalDetails(data: any) {
    return this.apiHandlerService.Get(`THC/PRSArrivalDetails?id=${data.id}&rateType=${data.rateType}&unloadBy=${data.unloadBy}&baseLocationCode=${data.baseLocationCode}`);
  }

  prsArrival(params: any, paylaod: any) {
    return this.apiHandlerService.Post(`THC/PRSArrivalDetailsSubmit?baseLocationCode=${params.baseLocationCode}&BaseCompanyCode=${params.BaseCompanyCode}&userid=${params.userid}`, paylaod);
  }

  getDocketInvoiceDetails(dockNo: string) {
    return this.apiHandlerService.Get(`THC/GetDocketInvoiceDetails?dockNo=${dockNo}`);
  }

  onSubmitEwaybill(payload: any) {
    return this.apiHandlerService.Post(`THC/SubmitEwayBillExpiryDateChange`, payload);
  }
  getPRSArrivalList(payload: any) {
    return this.apiHandlerService.Post(`THC/arrival-listPage`, payload);
  }

  getDepartureDetail(payload: any) {
    return this.apiHandlerService.Post(`Operation/departure`, payload);
  }

  submitTHCDeparture(payload: any) {
    return this.apiHandlerService.Post(`THC/THCDepartureSubmit`, payload);
  }

  getHCCDetail(payload: any) {
    return this.apiHandlerService.Post(`THC/HHCFinancialEditDetail`, payload);
  }

  submitHCC(payload: any, params: any) {
    return this.apiHandlerService.Post(`THC/HCCSubmit?baseLocationCode=${params.baseLocationCode}&basefinyear=${params.basefinyear}&userid=${params.userid}&companycode=${params.companycode}`, payload);
  }

  getHCCList(payload: any): Observable<any> {
    this.apiLoading.start();
    return this.apiHandlerService.Post(`Operation/GetHCCList`, payload).pipe(
      finalize(() => this.apiLoading.stop())
    );
  }

  getHCCViewDetail(payload:any){
    return this.apiHandlerService.Post(`Operation/GetHCCData`, payload);
  }

   getHCCCancel(payload:any){
    return this.apiHandlerService.Post(`Operation/HCCCancellation`, payload);
   }

  getHCCDynamicData(payload: any) {
    return this.apiHandlerService.Post(`Operation/GetDynamicData`, payload);

  }

  getBidDetail(location: string){
    return this.apiHandlerService.Get(`Operation/closed-bids?BranchCode=${location}`);
  }

  getDataFromBid(bidNo: string){
    return this.apiHandlerService.Get(`Operation/bid-details?bidNo=${bidNo}`);
  }

  thcSubmit(formData:any){
    return this.apiHandlerService.Post(`THC/THCSubmit`,formData);
  }

  thcGeneration(formData:any){
    return this.apiHandlerService.Post(`THC/THCGeneration`,formData);
  }
}
