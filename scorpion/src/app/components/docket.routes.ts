import { Routes } from '@angular/router';
import { DocketListComponent } from './docket-list/docket-list.component';
import { ErrorPageComponent } from './error-page/error-page.component';

export const DocketRoutes: Routes = [
  {
    path: 'docket',
    component: DocketListComponent
  },
   {
    path: 'error',
    component: ErrorPageComponent
  },
];
