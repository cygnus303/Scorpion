import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuAccessService {
  private currentModulePermissions: any[] = [];

  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  getRoleMenus(roleId: string): Observable<any> {
    return this.apiHandlerService.Get(`ActionModulePermission/GetRoleWiseMenu?RoleId=${roleId}`);
  }

  saveRolePermissions(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`ActionModulePermission/RoleWisePermissionSave`, payload);
  }

  getUserMenus(userId: string): Observable<any> {
    return this.apiHandlerService.Get(`ActionModulePermission/GetMenus?userId=${userId}`);
  }

  saveUserPermissions(payload: any): Observable<any> {
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

  public permissions: { [key: string]: boolean } = {};

  hasPermission(access: string): boolean {
    if (!access) return false;
    const key = access.trim().toLowerCase();
    
    // Check our new permissions object
    if (this.permissions[key]) {
      return true;
    }
    
    // Fallback to currentModulePermissions if populated
    if (this.currentModulePermissions && this.currentModulePermissions.length > 0) {
      const perm = this.currentModulePermissions.find(p => p.menuaccess.toLowerCase() === key);
      return perm ? perm.isUSERACCESS : false;
    }
    
    return false;
  }

  loadMenuPermissions(moduleId: number, userId?: string): void {
    this.permissions = {}; // reset
    this.getUserRolePermission(moduleId, userId).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data && response.data.permissionNames) {
          response.data.permissionNames.split(',').forEach((p: string) => {
            this.permissions[p.trim().toLowerCase()] = true;
          });
        }
      },
      error: (err: any) => {
        console.error('Error fetching menu permissions:', err);
      }
    });
  }

  getUserRolePermission(moduleId: number, userId?: string): Observable<any> {
    if (!userId) {
      const saved = localStorage.getItem("loginUserList");
      if (saved) {
        try {
          userId = JSON.parse(saved).UserId;
        } catch (e) {
          console.error('Error parsing loginUserList from localStorage', e);
        }
      }
    }
    return this.apiHandlerService.Get(`Operation/get-user-role-permission?userId=${userId || ''}&moduleId=${moduleId}`);
  }

}
