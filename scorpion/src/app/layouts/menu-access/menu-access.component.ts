import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuAccessService } from '../../shared/services/menu-access.service';
import { forkJoin } from 'rxjs';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-menu-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-access.component.html',
  styleUrl: './menu-access.component.scss'
})
export class MenuAccessComponent implements OnInit {
  permissionsList: any[] = [];
  permissionColumns: any[] = [];

  constructor(
    @Inject(MenuAccessService) private menuAccessService: MenuAccessService,
    private docketService: DocketService,
    private generalMasterService: GeneralMasterService, private sweetAlertService: SweetAlertService
  ) { }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.generalMasterService.THCMasterService.getGeneralMasterDetail('NEWMENU').subscribe({
      next: (masterResponse) => {
        if (masterResponse.success) {
          const sortedActions = masterResponse.data.sort((a, b) => Number(a.codeId) - Number(b.codeId));
          this.permissionColumns = sortedActions.map((a: any) => ({
            id: a.codeId,
            action: a.codeDesc
          }));

          this.fetchUserMenus();
        }
      }
    });
  }

  fetchUserMenus() {
    this.menuAccessService.getMenus(this.docketService.loginUserList.UserId).subscribe({
      next: (response: any) => {
        const { menus, userPermissions } = response;
        this.permissionsList = menus.map((menu: any) => {
          const userPerm = userPermissions.find((up: any) => up.moduleId === menu.menuID);
          let mappedPermissions = userPerm?.permissions?.map((p: any) => {
            const col = this.permissionColumns.find(c => c.action.toUpperCase() === p.menuaccess.toUpperCase());
            return {
              id: col ? col.id : p.id,
              menuaccess: p.menuaccess,
              isUSERACCESS: p.isUSERACCESS
            };
          }) || [];

          return {
            ...menu,
            permissions: mappedPermissions
          };
        });
      },
      error: (err) => console.error('Error fetching menus:', err)
    });
  }

  getPermission(module: any, col: any) {
    return module.permissions?.find((p: any) => p.menuaccess.toUpperCase() === col.action.toUpperCase());
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.permissionsList.forEach(module => {
      module.permissions?.forEach((p: any) => p.isUSERACCESS = checked);
    });
  }

  toggleRow(module: any, event: any) {
    const checked = event.target.checked;
    module.permissions?.forEach((p: any) => p.isUSERACCESS = checked);
  }

  toggleColumn(col: any, event: any) {
    const checked = event.target.checked;
    this.permissionsList.forEach(module => {
      const p = module.permissions?.find((perm: any) => perm.menuaccess.toUpperCase() === col.action.toUpperCase());
      if (p) p.isUSERACCESS = checked;
    });
  }

  isRowSelected(module: any): boolean {
    return module.permissions?.length > 0 && module.permissions.every((p: any) => p.isUSERACCESS);
  }

  isColumnAllSelected(col: any): boolean {
    const modulesWithPermission = this.permissionsList.filter(m =>
      m.permissions?.some((p: any) => p.menuaccess.toUpperCase() === col.action.toUpperCase())
    );
    if (modulesWithPermission.length === 0) return false;
    return modulesWithPermission.every(m => {
      const p = m.permissions?.find((perm: any) => perm.menuaccess.toUpperCase() === col.action.toUpperCase());
      return p?.isUSERACCESS;
    });
  }

  isAllSelected(): boolean {
    return this.permissionsList.length > 0 && this.permissionsList.every(module => this.isRowSelected(module));
  }

  onSubmit() {
    const userPermissionArray: any[] = [];
    this.permissionsList.forEach(module => {
      const selectedPermissionIds = module.permissions
        .filter((p: any) => p.isUSERACCESS)
        .map((p: any) => p.id)
        .join(',');

      userPermissionArray.push({
        moduleId: module.menuID,
        permissions: selectedPermissionIds // comma separated string like "1,4" or ""
      });
    });

    const payload = {
      userId: this.docketService.loginUserList?.UserId || 'CYGNUSTEAM',
      userPermission: userPermissionArray
    };

    console.log('Submit Payload:', payload);

    this.menuAccessService.savePermissions(payload).subscribe({
      next: (results) => {
        this.sweetAlertService.success('Menu Access Updated Successfully!!')
        this.fetchData();
      },
      error: (err) => {
        console.error('Error saving permissions:', err);
      }
    });
  }
}
