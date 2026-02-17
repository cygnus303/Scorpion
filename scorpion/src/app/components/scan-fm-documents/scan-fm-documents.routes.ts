import { Routes } from '@angular/router';
import { ScanFMDocumentsComponent } from './scan-fm-documents.component';
import { DocketGuard } from 'app/shared/docket.guard';
import { ForwardDocumentsComponent } from './forward-documents/forward-documents.component';
import { ForwardDocumentListComponent } from './forward-documents/forward-document-list/forward-document-list.component';
import { AcknowledgeFMDocumentsComponent } from './acknowledge-fmdocuments/acknowledge-fmdocuments.component';
import { AcknowledgeFmdocumentsListComponent } from './acknowledge-fmdocuments/acknowledge-fmdocuments-list/acknowledge-fmdocuments-list.component';
import { EditAcknowledgePFMComponent } from './acknowledge-fmdocuments/edit-acknowledge-pfm/edit-acknowledge-pfm.component';
import { ForwardFMDocumentsDoneComponent } from './forward-fmdocuments-done/forward-fmdocuments-done.component';
import { ViewPrintFMReportQueryComponent } from './view-print-fmreport-query/view-print-fmreport-query.component';
import { FMReportListComponent } from './view-print-fmreport-query/fmreport-list/fmreport-list.component';
import { DocumentsTrackComponent } from './documents-track/documents-track.component';

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
  {
    path: 'AcknowledgeFMDocumentsQuery',
    component: AcknowledgeFMDocumentsComponent,
  },
  {
    path: 'ForwardFMAckDocuments',
    component: AcknowledgeFmdocumentsListComponent,
  },
   {
    path: 'ForwardFMDocumentsEdit',
    component: EditAcknowledgePFMComponent,
  },
  {
    path: 'ForwardFMDocumentsDone',
    component: ForwardFMDocumentsDoneComponent,
  },
   {
    path: 'FMReportQuery',
    component: ViewPrintFMReportQueryComponent,
  },
     {
    path: 'FMReport',
    component: FMReportListComponent,
  },
      {
    path: 'DocumentsTrack',
    component: DocumentsTrackComponent,
  },

];
