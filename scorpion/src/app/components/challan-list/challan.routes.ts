import { Routes } from '@angular/router';
import { DocketGuard } from 'app/shared/docket.guard';
import { ChallanListComponent } from './challan-list.component';

export const ChallanRoutes: Routes = [
{
     path: 'Challan',
     component: ChallanListComponent,
       canActivate: [DocketGuard]
  },
];
