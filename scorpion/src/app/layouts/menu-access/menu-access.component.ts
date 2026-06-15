import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuAccessService } from '../../shared/services/menu-access.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { LoadingSheetService } from 'app/shared/services/loading-sheet.service';
import { NgSelectModule } from '@ng-select/ng-select';

interface AccessRow {
  moduleId: any;
  permissions: { [id: string]: boolean };
}

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
  
  searchType: string = 'User';
  selectedUserId: string | null = null;
  roleType: string | null = null;

  isModalOpen: boolean = false;
  modalRows: AccessRow[] = [];

  constructor(
    @Inject(MenuAccessService) private menuAccessService: MenuAccessService,
    private docketService: DocketService,
    public generalMasterService: GeneralMasterService,
    private sweetAlertService: SweetAlertService,
    public LoadingSheetService: LoadingSheetService,
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    
    // Default selected user if available
    if (this.docketService.loginUserList?.UserId) {
        this.selectedUserId = this.docketService.loginUserList.UserId;
    }

    this.LoadingSheetService.getUnLoaderUserList();
    this.generalMasterService.getRoleTypeDetail();
    this.fetchData();
  }

  fetchData() {
    this.generalMasterService.THCMasterService.getGeneralMasterDetail('NEWMENU').subscribe({
      next: (masterResponse) => {
        if (masterResponse.success) {
          const sortedActions = masterResponse.data.sort((a: any, b: any) => Number(a.codeId) - Number(b.codeId));
          this.permissionColumns = sortedActions.map((a: any) => ({
            id: a.codeId,
            action: a.codeDesc
          }));
          
          if (this.selectedUserId) {
             this.fetchUserMenus();
          }
        }
      }
    });
  }

  onSearchTypeChange() {
    this.roleType = null;
    this.selectedUserId = null;
    this.permissionsList = [];
    
    if (this.searchType === 'User' && this.docketService.loginUserList?.UserId) {
       this.selectedUserId = this.docketService.loginUserList.UserId;
       this.fetchUserMenus();
    }
  }

  fetchUserMenus() {
    let apiCall;
    if (this.searchType === 'Role') {
      const roleId = this.roleType;
      if (!roleId) {
        this.permissionsList = [];
        return;
      }
      apiCall = this.menuAccessService.getRoleMenus(roleId);
    } else {
      const userId = this.selectedUserId;
      if (!userId) {
        this.permissionsList = [];
        return;
      }
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
      },
      error: (err) => console.error('Error fetching menus:', err)
    });
  }

  get assignedPermissions() {
    if (!this.permissionsList || this.permissionsList.length === 0) return [];
    
    return this.permissionsList
      .filter(m => m.permissions && m.permissions.some((p: any) => p.isUSERACCESS))
      .map(m => {
        return {
          moduleName: m.displayName,
          actions: m.permissions.filter((p: any) => p.isUSERACCESS).map((p: any) => p.menuaccess)
        };
      });
  }

  get selectedName(): string {
    if (this.searchType === 'Role' && this.roleType) {
       const role = this.generalMasterService.roleTypeList.find((r: any) => r.codeId === this.roleType);
       return role ? role.codeDesc : this.roleType;
    } else if (this.searchType === 'User' && this.selectedUserId) {
       const user = this.LoadingSheetService.unLoaderUserList.find((u: any) => u.userId === this.selectedUserId);
       return user ? user.name : this.selectedUserId;
    }
    return '';
  }

  get selectedId(): string {
    return this.searchType === 'Role' ? (this.roleType || '') : (this.selectedUserId || '');
  }

  openModal() {
    if (this.searchType === 'User' && !this.selectedUserId) {
      // Trying to use a warning toast or falling back
      if (this.sweetAlertService.warning) {
         this.sweetAlertService.warning("Please select a User first.");
      } else {
         this.sweetAlertService.success("Please select a User first.");
      }
      return;
    }
    if (this.searchType === 'Role' && !this.roleType) {
      if (this.sweetAlertService.warning) {
         this.sweetAlertService.warning("Please select a Role first.");
      } else {
         this.sweetAlertService.success("Please select a Role first.");
      }
      return;
    }

    this.modalRows = [];
    const assigned = this.permissionsList.filter(m => m.permissions && m.permissions.some((p: any) => p.isUSERACCESS));
    
    if (assigned.length > 0) {
      assigned.forEach(m => {
        const row: AccessRow = { moduleId: m.menuID, permissions: {} };
        m.permissions.forEach((p: any) => {
          if (p.isUSERACCESS) {
            row.permissions[p.id] = true;
          }
        });
        this.modalRows.push(row);
      });
    } else {
      this.addAccessRow();
    }
    
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  addAccessRow() {
    this.modalRows.push({ moduleId: null, permissions: {} });
  }

  removeRow(index: number) {
    if (this.modalRows.length === 1) {
      if (this.sweetAlertService.warning) {
         this.sweetAlertService.warning("At least one row required.");
      } else {
         this.sweetAlertService.success("At least one row required.");
      }
      return;
    }
    this.modalRows.splice(index, 1);
  }

  getModuleDetails(moduleId: any) {
    return this.permissionsList.find(m => m.menuID === moduleId);
  }

  onModuleChange(row: AccessRow, index: number) {
    if (!row.moduleId) return;
    
    // Check if this module is already selected in another row
    const isDuplicate = this.modalRows.some((r, i) => i !== index && r.moduleId === row.moduleId);
    
    if (isDuplicate) {
      if (this.sweetAlertService.warning) {
         this.sweetAlertService.warning("This module is already selected in another row.");
      } else {
         this.sweetAlertService.success("This module is already selected in another row.");
      }
      
      // Reset the selection
      setTimeout(() => {
        row.moduleId = null;
        row.permissions = {};
      });
    } else {
      // Clear permissions when a new unique module is selected
      row.permissions = {};
    }
  }

  isAllRowsSelected(): boolean {
    if (this.modalRows.length === 0) return false;
    let allSelected = true;
    for (const row of this.modalRows) {
      if (!row.moduleId) {
        allSelected = false;
        break;
      }
      const mod = this.getModuleDetails(row.moduleId);
      if (!mod || !mod.permissions || mod.permissions.length === 0) {
        allSelected = false;
        break;
      }
      for (const p of mod.permissions) {
        if (!row.permissions[p.id]) {
          allSelected = false;
          break;
        }
      }
      if (!allSelected) break;
    }
    return allSelected;
  }

  toggleAllRows(event: any): void {
    const isChecked = event.target.checked;
    for (const row of this.modalRows) {
      if (row.moduleId) {
        const mod = this.getModuleDetails(row.moduleId);
        if (mod && mod.permissions) {
          mod.permissions.forEach((p: any) => {
            row.permissions[p.id] = isChecked;
          });
        }
      }
    }
  }

  isRowSelected(row: AccessRow): boolean {
    if (!row.moduleId) return false;
    const mod = this.getModuleDetails(row.moduleId);
    if (!mod || !mod.permissions || mod.permissions.length === 0) return false;
    
    return mod.permissions.every((p: any) => row.permissions[p.id]);
  }

  toggleRow(row: AccessRow, event: any): void {
    const isChecked = event.target.checked;
    if (row.moduleId) {
      const mod = this.getModuleDetails(row.moduleId);
      if (mod && mod.permissions) {
        mod.permissions.forEach((p: any) => {
          row.permissions[p.id] = isChecked;
        });
      }
    }
  }

  saveAccess() {
    const userPermissionArray: any[] = [];
    let hasError = false;
    
    // Create a map to combine permissions if the same module is selected multiple times
    const modulePermMap = new Map<any, Set<any>>();

    // Initialize map with previously assigned modules so we can send empty permissions if they are removed
    const originallyAssigned = this.permissionsList.filter(m => m.permissions && m.permissions.some((p: any) => p.isUSERACCESS));
    originallyAssigned.forEach(m => {
       modulePermMap.set(m.menuID, new Set());
    });

    for (let i = 0; i < this.modalRows.length; i++) {
      const row = this.modalRows[i];
      if (!row.moduleId) {
        hasError = true;
        break;
      }
      
      const mod = this.getModuleDetails(row.moduleId);
      if (!mod) continue;
      
      if (!modulePermMap.has(row.moduleId)) {
         modulePermMap.set(row.moduleId, new Set());
      }
      const permSet = modulePermMap.get(row.moduleId)!;
      
      mod.permissions.forEach((p: any) => {
        if (row.permissions[p.id]) {
           permSet.add(p.id);
        }
      });
    }

    if (hasError) {
      if (this.sweetAlertService.warning) {
         this.sweetAlertService.warning("Select Module Name for all rows.");
      } else {
         this.sweetAlertService.success("Select Module Name for all rows.");
      }
      return;
    }

    modulePermMap.forEach((permSet, moduleId) => {
       // We push all items in the map. If a previously assigned module was removed,
       // it will be sent with an empty permissions string, which tells the backend to remove it.
       userPermissionArray.push({
          moduleId: moduleId,
          permissions: Array.from(permSet).join(',')
       });
    });

    let apiCall;
    if (this.searchType === 'Role') {
      const payload = {
        roleId: this.roleType ? String(this.roleType) : '',
        rolePermissions: userPermissionArray
      };
      apiCall = this.menuAccessService.saveRolePermissions(payload);
    } else {
      const payload = {
        userId: String(this.selectedUserId),
        userPermission: userPermissionArray
      };
      apiCall = this.menuAccessService.saveUserPermissions(payload);
    }

    apiCall.subscribe({
      next: (results) => {
        this.sweetAlertService.success('Access saved successfully!');
        this.fetchUserMenus(); // Refresh table
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving permissions:', err);
        if ((this.sweetAlertService as any).error) {
           (this.sweetAlertService as any).error('Error saving permissions');
        } else {
           this.sweetAlertService.success('Error saving permissions');
        }
      }
    });
  }

  getActionBadgeClass(action: string): string {
    const a = action.toLowerCase();
    if (a.includes('add') || a.includes('quick')) return 'bg-success-subtle text-success border border-success-subtle';
    if (a.includes('edit')) return 'bg-primary-subtle text-primary border border-primary-subtle';
    if (a.includes('view')) return 'bg-info-subtle text-info border border-info-subtle';
    if (a.includes('download') || a.includes('print')) return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    if (a.includes('cancel')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    return 'bg-primary-subtle text-primary border border-primary-subtle';
  }
}
