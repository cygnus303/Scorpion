import { Routes } from '@angular/router';
import { ApproverMasterFormComponent } from './approver-master-form/approver-master-form.component';
import { ApprovalMasterComponent } from './approval-master/approval-master.component';
import { DocumentApprovalComponent } from './document-approval/document-approval.component';

export const APPROVER_MASTER_ROUTES: Routes = [
  { path: '', redirectTo: 'form', pathMatch: 'full' },
  { path: 'form', component: ApproverMasterFormComponent },
  { path: 'approval-master', component: ApprovalMasterComponent },
  { path: 'document-approval', component: DocumentApprovalComponent }
];
