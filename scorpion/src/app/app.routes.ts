import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: '',
      loadChildren: () =>import('./components/docket.modules').then((m) => m.DocketModule),
    },
    {
      path: 'Operation',
      loadChildren: () =>import('./components/challan-list/challan.module').then( (m) => m.ChallanModule),
    },
    {
      path: 'Master',
      loadChildren: () =>import('./components/delivery-agent-list/delivery-agent.module').then( (m) => m.DeliveryAgentModule),
    },
    {
      path: 'DefaultContract',
      loadChildren: () =>import('./components/default-contract/default-contract.module').then( (m) => m.DefaultContractModule),
    },  
    {
      path: 'Document',
      loadChildren: () =>import('./components/scan-fm-documents/scan-fm-documents.module').then( (m) => m.ScanFMModule),
    }
];