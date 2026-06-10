import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuAccessService } from '../../shared/services/menu-access.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { LoadingSheetService } from 'app/shared/services/loading-sheet.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-menu-access',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './menu-access.component.html',
  styleUrl: './menu-access.component.scss'
})
export class MenuAccessComponent implements OnInit {
  permissionsList: any[] = [];
  permissionColumns: any[] = [];
  searchText: string = '';
  selectedUserId: string = '';
  roleType: string | null = null;
  searchType: string = 'User';
  selectedModule: any = null;

  onSearchTypeChange() {
    this.roleType = null;
    this.selectedUserId = '';
    this.permissionsList = [];
    this.selectedModule = null;
    if (this.searchType === 'User') {
      this.selectedUserId = this.docketService.loginUserList.UserId;
      this.fetchUserMenus();
    }
  }

  get filteredPermissionsList() {
    if (!this.searchText) {
      return this.permissionsList;
    }
    const search = this.searchText.toLowerCase();
    return this.permissionsList.filter(module =>
      module.displayName.toLowerCase().includes(search)
    );
  }

  selectModule(module: any) {
    this.selectedModule = module;
  }

  constructor(
    @Inject(MenuAccessService) private menuAccessService: MenuAccessService,
    private docketService: DocketService,
    public generalMasterService: GeneralMasterService, private sweetAlertService: SweetAlertService, public LoadingSheetService: LoadingSheetService,
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      // this.docketService.loginUserList.LocationCode = 'PIM';
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.selectedUserId = this.docketService.loginUserList.UserId;
    this.LoadingSheetService.getUnLoaderUserList();
    this.generalMasterService.getRoleTypeDetail();
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
    let apiCall;
    if (this.searchType === 'Role') {
      const roleId = this.roleType;
      if (!roleId) {
        this.permissionsList = [];
        this.selectedModule = null;
        return;
      }
      apiCall = this.menuAccessService.getRoleMenus(roleId);
    } else {
      const userId = this.selectedUserId || this.docketService.loginUserList.UserId;
      apiCall = this.menuAccessService.getUserMenus(userId);
    }

    apiCall.subscribe({
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

        if (this.permissionsList.length > 0) {
          this.selectedModule = this.permissionsList[0];
        } else {
          this.selectedModule = null;
        }
      },
      error: (err) => console.error('Error fetching menus:', err)
    });
  }

  getPermission(module: any, col: any) {
    return module.permissions?.find((p: any) => p.menuaccess.toUpperCase() === col.action.toUpperCase());
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.filteredPermissionsList.forEach(module => {
      module.isSelected = checked;
      module.permissions?.forEach((p: any) => p.isUSERACCESS = checked);
    });
  }

  toggleRow(module: any, event: any) {
    const checked = event.target.checked;
    module.isSelected = checked;
    module.permissions?.forEach((p: any) => p.isUSERACCESS = checked);
    this.selectedModule = module;
  }

  toggleColumn(col: any, event: any) {
    const checked = event.target.checked;
    this.filteredPermissionsList.forEach(module => {
      const p = module.permissions?.find((perm: any) => perm.menuaccess.toUpperCase() === col.action.toUpperCase());
      if (p) p.isUSERACCESS = checked;
    });
  }

  isRowSelected(module: any): boolean {
    if (module.permissions && module.permissions.length > 0) {
      return module.permissions.every((p: any) => p.isUSERACCESS);
    }
    return !!module.isSelected;
  }

  isColumnAllSelected(col: any): boolean {
    const modulesWithPermission = this.filteredPermissionsList.filter(m =>
      m.permissions?.some((p: any) => p.menuaccess.toUpperCase() === col.action.toUpperCase())
    );
    if (modulesWithPermission.length === 0) return false;
    return modulesWithPermission.every(m => {
      const p = m.permissions?.find((perm: any) => perm.menuaccess.toUpperCase() === col.action.toUpperCase());
      return p?.isUSERACCESS;
    });
  }

  isAllSelected(): boolean {
    return this.filteredPermissionsList.length > 0 && this.filteredPermissionsList.every(module => this.isRowSelected(module));
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

    let apiCall;
    if (this.searchType === 'Role') {
      const payload = {
        roleId: this.roleType ? String(this.roleType) : '',
        rolePermissions: userPermissionArray
      };
      console.log('Submit Role Payload:', payload);
      apiCall = this.menuAccessService.saveRolePermissions(payload);
    } else {
      const payload = {
        userId: String(this.selectedUserId || this.docketService.loginUserList.UserId),
        userPermission: userPermissionArray
      };
      console.log('Submit User Payload:', payload);
      apiCall = this.menuAccessService.saveUserPermissions(payload);
    }

    apiCall.subscribe({
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
