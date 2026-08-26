import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { DeliveryAgent } from '../models/delivery-agent.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryAgentService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }


  addDeliveryAgent(paylaod: any): Observable<any> {
    return this.apiHandlerService.Post(`Master/AddOrUpdate`, paylaod);
  }

  getDeliveryAgent(data: any): Observable<any> {
    return this.apiHandlerService.Get(`Master/GetDAList`, data);
  }

  getDeliveryAgentByCodeList(code: string): Observable<any> {
    return this.apiHandlerService.Get(`Master/GetDAByCode?daCode=${code}`);
  }

  deliveryAgentExport(): Observable<any> {
    return this.apiHandlerService.DownloadFile(`Master/DA-export-excel`);
  }

  getVendors(location:string): Observable<any> {
    return this.apiHandlerService.Get(`External/GetVendors?Location=${location}`);
  }

  getLocation(): Observable<any> {
    return this.apiHandlerService.Get(`External/GetLocations`);
  }

  getLicenceDetail(params: any) {
    return this.apiHandlerService.Get(`Master/GetDriverDetails?dlnumber=${params.dlnumber}&dob=${params.dob}&baseUserName=${params.baseUserName}`);
  }

  getVehicleDetail(params: any) {
    return this.apiHandlerService.Get(`Master/GetVehicleDetails?vehNo=${params.vehNo}&baseUserName=${params.baseUserName}`);
  }

  validationData(payload: any) {
    return this.apiHandlerService.Post(`Master/validate`, payload);
  }

  onResetPassword(payload: any) {
    return this.apiHandlerService.Post(`User/PasswordReset`, payload);
  }

  showDAPassword(code: string) {
    return this.apiHandlerService.Get(`User/GetPasswordFromUserID?id=${code}`);
  }

  daStatusChange(payload: any) {
    return this.apiHandlerService.Post(`Master/UpdateDAStatus`, payload);
  }

  createUser(code: number): Observable<any> {
    return this.apiHandlerService.Post(`User/CreateUser?User=${code}`, {});
  }
}
