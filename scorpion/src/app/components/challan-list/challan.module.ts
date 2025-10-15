import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallanListComponent } from './challan-list.component';
import { RouterModule } from '@angular/router';
import { ChallanRoutes } from './challan.routes';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [ChallanListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ChallanRoutes),
    BsDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  exports: [ RouterModule ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChallanModule { }
