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
  {
    path: 'LoadingSheet',
    loadComponent: () => import('../loading-sheet/loading-sheet.component').then(m => m.LoadingSheetComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'UpdateDRS',
    loadComponent: () => import('../delivery-update-list/delivery-update-list.component').then(m => m.DeliveryUpdateListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'StockUpdateDetails',
    loadComponent: () => import('../arrival-stock-update-list/arrival-stock-update-list.component').then(m => m.ArrivalStockUpdateListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'PRSArrivalDetails',
    loadComponent: () => import('../prs-arrival-details/prs-arrival-details.component').then(m => m.PRSArrivalDetailsComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'THCDepartureSubmit',
    loadComponent: () => import('../thc-departure/thc-departure.component').then(m => m.ThcDepartureComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'PRSGenerationList',
    loadComponent: () => import('../prs-generation-list/prs-generation-list.component').then(m => m.PRSGenerationListComponent),
  },
  {
    path: 'DRSList',
    loadComponent: () => import('../drs-generation-list/drs-generation-list.component').then(m => m.DrsGenerationListComponent),
  },
  {
    path: 'StockUpdateLayout',
    loadComponent: () => import('../stock-update-layout/stock-update-layout.component').then(m => m.StockUpdateLayoutComponent),
  },
   {
    path: 'THCList',
    loadComponent: () => import('../thc-list/thc-list.component').then(m => m.ThcListComponent),
  }

];
