import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuAccessService } from '../../shared/services/menu-access.service';
import { forkJoin } from 'rxjs';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-menu-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-access.component.html',
  styleUrl: './menu-access.component.scss'
})
export class MenuAccessComponent implements OnInit {
  permissionsList: any[] = [];
  permissionColumns: string[] = [];

  constructor(@Inject(MenuAccessService) private menuAccessService: MenuAccessService, private docketService: DocketService) { }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.menuAccessService.getMenus(this.docketService.loginUserList.UserId).subscribe({
      next: (response: any) => {
        const { menus, actions, userPermissions } = response;

        // 1. Set Columns (using direct action names)
        this.permissionColumns = actions.map((a: any) => a.action);

        // 2. Set Permissions List
        this.permissionsList = menus.map((menu: any) => {
          const userPerm = userPermissions.find((up: any) => up.moduleId === menu.id || up.moduleId === menu.menuID);
          return {
            ...menu,
            permissions: userPerm ? userPerm.permissions : []
          };
        });
      },
      error: (err) => console.error('Error fetching menus:', err)
    });
  }

  getPermission(module: any, type: string) {
    return module.permissions?.find((p: any) => p.menuaccess.toUpperCase() === type.toUpperCase());
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

  toggleColumn(type: string, event: any) {
    const checked = event.target.checked;
    this.permissionsList.forEach(module => {
      const p = module.permissions?.find((perm: any) => perm.menuaccess.toUpperCase() === type.toUpperCase());
      if (p) p.isUSERACCESS = checked;
    });
  }

  isRowSelected(module: any): boolean {
    return module.permissions?.length > 0 && module.permissions.every((p: any) => p.isUSERACCESS);
  }

  isColumnAllSelected(type: string): boolean {
    const modulesWithPermission = this.permissionsList.filter(m =>
      m.permissions?.some((p: any) => p.menuaccess.toUpperCase() === type.toUpperCase())
    );
    if (modulesWithPermission.length === 0) return false;
    return modulesWithPermission.every(m => {
      const p = m.permissions?.find((perm: any) => perm.menuaccess.toUpperCase() === type.toUpperCase());
      return p?.isUSERACCESS;
    });
  }

  isAllSelected(): boolean {
    return this.permissionsList.length > 0 && this.permissionsList.every(module => this.isRowSelected(module));
  }

  onSubmit() {
    // Construct the payload for each module that has permissions
    const requests = this.permissionsList.map(module => {
      const payload = {
        userId: this.docketService.loginUserList.UserId,
        userPermission: {
          moduleId: module.menuID || module.id,
          permissions: JSON.stringify(module.permissions)
        }
      };
      return this.menuAccessService.savePermissions(payload);
    });

    forkJoin(requests).subscribe({
      next: (results) => {
        alert('All permissions saved successfully!');
      },
      error: (err) => {
        console.error('Error saving permissions:', err);
        alert('Some permissions failed to save.');
      }
    });
  }
}
