import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScanFMRoutes } from './scan-fm-documents.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(ScanFMRoutes),
  ]
})
export class ScanFMModule { }
