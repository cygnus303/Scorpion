import { Routes } from '@angular/router';
import { DocketGuard } from 'app/shared/docket.guard';
import { ChallanListComponent } from './challan-list.component';
import { ChallanFilterComponent } from './challan-filter/challan-filter.component';

export const ChallanRoutes: Routes = [
{
     path: 'Challan',
     component: ChallanFilterComponent,
       canActivate: [DocketGuard]
  },
    {
       path: 'ChallanList',
       component: ChallanListComponent,
       canActivate: [DocketGuard]
    },
];
