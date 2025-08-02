import { Routes } from '@angular/router';
import { DocketListComponent } from './docket-list/docket-list.component';

export const DocketRoutes: Routes = [
  {
    path: '**',
    component: DocketListComponent
  },
];
