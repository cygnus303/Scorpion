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
    path: 'PRSList',
    loadComponent: () => import('../prs-generation-list/prs-generation-list.component').then(m => m.PRSGenerationListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'DRSList',
    loadComponent: () => import('../drs-generation-list/drs-generation-list.component').then(m => m.DrsGenerationListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'StockUpdate',
    loadComponent: () => import('../stock-update-layout/stock-update-layout.component').then(m => m.StockUpdateLayoutComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'THCList',
    loadComponent: () => import('../thc-list/thc-list.component').then(m => m.ThcListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'LoadingSheetList',
    loadComponent: () => import('../loading-sheet-layout/loading-sheet-layout.component').then(m => m.LoadingSheetLayoutComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'THCArrivalList',
    loadComponent: () => import('../thc-arrival-list/thc-arrival-list.component').then(m => m.ThcArrivalListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'docketList',
    loadComponent: () => import('../lr-list/lr-list.component').then(m => m.LrListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'UNRList',
    loadComponent: () => import('../unr-list/unr-list.component').then(m => m.UNRListComponent),
  },
  {
    path: 'HccFinEditList',
    loadComponent: () => import('../hcc-finacialedit-list/hcc-finacialedit-list.component').then(m => m.HccFinacialeditListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'LRTrackList',
    loadComponent: () => import('../lr-track-trace-list/lr-track-trace-list.component').then(m => m.LrTrackTraceListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'LRFinEditList',
    loadComponent: () => import('../lr-finacial-edit/lr-finacial-edit.component').then(m => m.LrFinacialEditComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'THCDepatureList',
    loadComponent: () => import('../thc-depature-list/thc-depature-list.component').then(m => m.ThcDepatureListComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'AppointmentDelivery',
    loadComponent: () => import('../appointment-delivery/appointment-delivery.component').then(m => m.AppointmentDeliveryComponent),
    canActivate: [DocketGuard]
  },
  {
    path: 'PRQList',
    loadComponent: () => import('../prq-list/prq-list.component').then(m => m.PrqListComponent),
    canActivate: [DocketGuard]
  },
   {
    path: 'ApproverMaster',
    loadComponent: () => import('../approver-master/approver-master.component').then(m => m.ApproverMasterComponent),
    loadChildren: () => import('../approver-master/approver-master.routes').then(m => m.APPROVER_MASTER_ROUTES)
    // canActivate: [DocketGuard]
  },
   {
    path: 'approval-master',
    loadComponent: () => import('../approval-master/approval-master.component').then(m => m.ApprovalMasterComponent),
    // canActivate: [DocketGuard]
  }


];
