import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { IApiBaseResponse } from '../interface/api-base-action-response';
import { DocDataDetail } from '../models/appointment-delivery';

@Injectable({
  providedIn: 'root'
})
export class AppointmentDeliveryService {
  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) {}

  getDeliveryAppointmentData(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`Operation/GetDeliveryAppointmentData`, payload);
  }

  getDeliveryAppointmentDataExcel(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`Operation/GetDeliveryAppointmentDataExcel`, payload);
  }

  getDeliveryAppointmentDetail(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`Operation/GetDeliveryAppointmentDetail`, payload);
  }

  addEditAppointment(payload: any, baseUserName: string): Observable<any> {
    return this.apiHandlerService.Post(`Operation/AddEditAppointment?baseUserName=${baseUserName}`, payload);
  }

  checkDeliveryEligibility(docketNo: string, entryType: string): Observable<any> {
    return this.apiHandlerService.Get(`Operation/CheckDeliveryEligibility?docket=${docketNo}&type=${entryType}`);
  }

  generateCsdMsdNo(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`Operation/GenerateCsdMsdNo`, payload);
  }

  getDocDataDetail(docketNo: string): Observable<any> {
    return this.apiHandlerService.Get(`Operation/GetDocData?docNo=${docketNo}`);
  }
}
