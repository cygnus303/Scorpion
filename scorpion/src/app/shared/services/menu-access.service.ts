import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuAccessService {

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  getMenus(userId: string): Observable<any> {
    return this.apiHandlerService.Get(`ActionModulePermission/GetMenus?userId=${userId}`);
  }

  savePermissions(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`ActionModulePermission/UserPermissionsave`, payload);
  }

}
