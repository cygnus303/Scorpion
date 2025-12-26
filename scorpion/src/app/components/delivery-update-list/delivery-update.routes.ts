import { Routes } from '@angular/router';
import { DocketGuard } from 'app/shared/docket.guard';
import { DeliveryUpdateListComponent } from './delivery-update-list.component';

export const DeliveryUpdateRoutes: Routes = [
{
     path: 'deliveryUpdate',
     component: DeliveryUpdateListComponent,
     canActivate: [DocketGuard]
  }

];
