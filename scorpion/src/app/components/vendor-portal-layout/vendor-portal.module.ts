import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendorRoutes } from './vendor-portal.routes';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(VendorRoutes)
  ]
})
export class VendorPortalModule { }
