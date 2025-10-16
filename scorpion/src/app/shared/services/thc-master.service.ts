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
}
