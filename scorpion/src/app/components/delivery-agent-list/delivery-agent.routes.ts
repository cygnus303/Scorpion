import { Routes } from '@angular/router';
import { DeliveryAgentListComponent } from './delivery-agent-list.component';
import { DocketGuard } from 'app/shared/docket.guard';
import { VendorContractListComponent } from '../vendor-contract-list/vendor-contract-list.component';
import { CustomerMasterLayoutComponent } from '../customer-master-layout/customer-master-layout.component';
import { MenuAccessComponent } from 'app/layouts/menu-access/menu-access.component';

export const DeliveryRoutes: Routes = [
  {
    path: 'delivery-agent',
    component: DeliveryAgentListComponent,
    canActivate: [DocketGuard]
  },
  {
    path: 'VendorContractTypeWise',
    component: VendorContractListComponent,
    canActivate: [DocketGuard]
  },
  {
    path: 'CustomerMasters',
    component: CustomerMasterLayoutComponent,
  },
  {
    path: 'MenuAccess',
    component: MenuAccessComponent,
  },
];
