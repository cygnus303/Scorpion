import { Routes } from '@angular/router';
import { DeliveryAgentListComponent } from './delivery-agent-list.component';
import { DocketGuard } from 'app/shared/docket.guard';

export const DeliveryRoutes: Routes = [
{
     path: 'delivery-agent',
     component: DeliveryAgentListComponent,
       canActivate: [DocketGuard]
  },
];
