import { Routes } from '@angular/router';
import { DeliveryAgentListComponent } from './delivery-agent-list.component';
import { DocketGuard } from 'app/shared/docket.guard';
import { VendorContractListComponent } from '../vendor-contract-list/vendor-contract-list.component';
import { VendorContractLayoutComponent } from '../vendor-contract-list/vendor-contract-layout/vendor-contract-layout.component';

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
     path: 'VendorContract',
     component: VendorContractLayoutComponent,
  },
];
