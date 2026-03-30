import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }
  
  
    GetConsignnorList(): Observable<any> {
      return this.apiHandlerService.Get(`Master/GetConsignnorCustomerListJson`);
    }

    getConsigneeList(): Observable<any> {
      return this.apiHandlerService.Get(`Master/GetConsigneeCustomerListJson`);
    }

    getBusinessTypeCategory(): Observable<any> {
      return this.apiHandlerService.Get(`Master/GetBusinessTypeCategory`);
    }

    getEmployeeDropdown(searchTerm:any,baseUserName:string): Observable<any> {
      return this.apiHandlerService.Get(`Ticket/EmployeeDropDownList?searchTerm=${searchTerm}&baseUserName=${baseUserName}`);
    }

    getEmployeeDetail(userId:string): Observable<any> {
      return this.apiHandlerService.Get(`Master/GetEmpDetails?userId=${userId}`);
    }

    getTypewiseGSTDetail(payload:any){
      return this.apiHandlerService.Post(`Master/TypeWiseGSTDetails`,payload);
    }
}
