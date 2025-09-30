import { Routes } from '@angular/router';
import { DocketListComponent } from './docket-list/docket-list.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { DocketDoneComponent } from './docket-done/docket-done.component';
import DocketEditComponent from './docket-list/docket-edit/docket-edit.component';
import { DocketGuard } from 'app/shared/docket.guard';

export const DocketRoutes: Routes = [
  {
    path: 'docket',
    component: DocketListComponent,
     canActivate: [DocketGuard]
  },{
    path: 'error',
    component: ErrorPageComponent
  },{
     path: 'DocketDone/:id',
     component: DocketDoneComponent
  },
  {
     path: 'docketFinancialEdit',
     component: DocketListComponent,
      canActivate: [DocketGuard]
  },
  {
     path: 'docketEditCretria',
     component: DocketEditComponent,
     canActivate: [DocketGuard]
  },
];
