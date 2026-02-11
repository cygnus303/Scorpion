import { Routes } from '@angular/router';
import { ScanFMDocumentsComponent } from './scan-fm-documents.component';
import { DocketGuard } from 'app/shared/docket.guard';

export const ScanFMRoutes: Routes = [
  {
    path: 'ScanFMDocuments',
    component: ScanFMDocumentsComponent,
    canActivate: [DocketGuard]
  },

];
