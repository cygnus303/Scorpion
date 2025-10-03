import { Routes } from '@angular/router';

export const routes: Routes = [
     {
    path: '',
    loadChildren: () =>
      import('./components/docket.modules').then(
        (m) => m.DocketModule
      ),
  },
       {
    path: 'Master',
    loadChildren: () =>
      import('./components/delivery-agent-list/delivery-agent.module').then(
        (m) => m.DeliveryAgentModule),
  },
];