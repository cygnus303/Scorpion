import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';

@Injectable({
  providedIn: 'root'
})
export class THCMasterService {


  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) {}

  getVendorsList(vendors: any) {
    return this.apiHandlerService.Post(`THC/GetVendors`,vendors);
  }

  getCityList(): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetCity`);
  }

  getTripSheet(vehicleNo:string): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/TripSheetFromVehicle?vehicleNo=${vehicleNo}`);
  }

  getVahicleCapacity(id:string): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/VehicleCapacity?id=${id}`);
  }

  getPANnumber(vendor:any): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/GetPanNoFromVendor?vendor=${vendor}`);
  }

  getvehicleDetailFromVendor(vendorType:string,vendor:string): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/VehicleFromVendor?vendorType=${vendorType}&vendor=${vendor}`);
  }

  getTDSLedger(): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/GetTDSLedger`);
  }

  getNewVehicleDetail(vehicleNo:string): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/NewGetVehicleDetails?vehicleNo=${vehicleNo}`);
  }

  getDAList(type:string): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/GetDeliveryAgentList?type=${type}`);
  }

  avalabledocketinPRS(vendors: any) {
    return this.apiHandlerService.Post(`THC/AvalabledocketinPRS`,vendors);
  }
  
  getTDSDetailsFromVendor(vendorCode:any): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Post(`THC/GetTDSDetailsFromVendor`,vendorCode);
  }

  getDeliveryAgentMobileNo(agentCode:any): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Post(`THC/CheckAgentMRCollection`,agentCode);
  }

  getMFListFromRoute(payload:any): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Post(`THC/GetMFListFromRoute`,payload);
  }

  getRoutesFromRouteType(payload:any): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/GetRoutesFromRouteType?routeType=${payload.routeType}&isEmpty=${payload.isEmpty}&locationCode=${payload.locationCode}`);
  }
  
  challanSubmit(payload:any): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Post(`THC/ChallanSubmit`,payload);
  }

  
  getVehicleType(vehicleNo:string): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/VehicleType?vehicleNo=${vehicleNo}`);
  }

  getEWayBillExpiryDateByMF(payload:any): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Post(`THC/GetEWayBillExpiryDateByMF`,payload);
    }
    
  getAirport(locationCode:string): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Get(`THC/GetAirport?locationCode=${locationCode}`);
  }

   getFlights(payload:any): Observable<IApiBaseResponse<any[]>>{
    return this.apiHandlerService.Post(`THC/GetFlights`,payload);
    }

  getCustomerListForTHC(searchTerm:string){
    return this.apiHandlerService.Get(`THC/getCustomerListForTHC?searchTerm=${searchTerm}`);
  }

  getAllCityByLocation(locCode:string,searchTerm:string){
    return this.apiHandlerService.Get(`THC/GetAllCityByLocation?locCode=${locCode}&searchTerm=${searchTerm}`);
  }

  getFlightSchTime(payload:any){
    return this.apiHandlerService.Get(`THC/GetFlightSchTime?flight=${payload.flightCode}&airport=${payload.airport}`);
  }
}
