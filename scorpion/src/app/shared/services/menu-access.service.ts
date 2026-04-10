import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuAccessService {
  private currentModulePermissions: any[] = [];

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  getMenus(userId: string): Observable<any> {
    return this.apiHandlerService.Get(`ActionModulePermission/GetMenus?userId=${userId}`);
  }

  savePermissions(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`ActionModulePermission/UserPermissionsave`, payload);
  }

  getUserModulePermissions(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`Operation/GetUserModulePermissions`, payload);
  }

  loadPermissions(moduleId: number, userId: string): Observable<any> {
    const payload = { 
      menuId: moduleId, 
      userId 
    };
    return this.getUserModulePermissions(payload).pipe(
      tap((response: any) => {
        if (response && response.permissions) {
          this.currentModulePermissions = response.permissions;
        } else {
          this.currentModulePermissions = [];
        }
      })
    );
  }

  hasPermission(access: string): boolean {
    if (!this.currentModulePermissions || this.currentModulePermissions.length === 0) return false;
    const permission = this.currentModulePermissions.find(p => p.menuaccess.toLowerCase() === access.toLowerCase());
    return permission ? permission.isUSERACCESS : false;
  }

}
