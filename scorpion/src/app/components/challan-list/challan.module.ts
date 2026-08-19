import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ChallanListComponent } from './challan-list.component';
import { RouterModule } from '@angular/router';
import { ChallanRoutes } from './challan.routes';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChallanFilterComponent } from './challan-filter/challan-filter.component';
import { SharedModule } from 'app/shared/shared/shared.module';
import { DateTimePickerComponent } from 'app/layouts/header/date-time-picker/date-time-picker.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { DateRangePickerComponent } from 'app/shared/components/date-range-picker/date-range-picker.component';

@NgModule({
  declarations: [ChallanListComponent, ChallanFilterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ChallanRoutes),
    BsDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    TimepickerModule.forRoot(),
    DateRangePickerComponent
  ],
  exports: [RouterModule, DateTimePickerComponent, ChallanFilterComponent],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChallanModule { }
``