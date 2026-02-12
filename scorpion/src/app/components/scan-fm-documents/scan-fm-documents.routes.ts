import { Routes } from '@angular/router';
import { ScanFMDocumentsComponent } from './scan-fm-documents.component';
import { DocketGuard } from 'app/shared/docket.guard';
import { ForwardDocumentsComponent } from './forward-documents/forward-documents.component';
import { ForwardDocumentListComponent } from './forward-documents/forward-document-list/forward-document-list.component';

export const ScanFMRoutes: Routes = [
  {
    path: 'ScanFMDocuments',
    component: ScanFMDocumentsComponent,
    canActivate: [DocketGuard]
  },
    {
    path: 'ForwardFMDocumentsQuery',
    component: ForwardDocumentsComponent,
  },
    {
    path: 'ForwardFMDocuments',
    component: ForwardDocumentListComponent,
  },

];
