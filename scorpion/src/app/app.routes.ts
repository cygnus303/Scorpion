import { Routes } from '@angular/router';

export const routes: Routes = [
     {
    path: '',
    loadChildren: () =>
      import('./components/docket.modules').then(
        (m) => m.DocketModule
      ),
  },
];