import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusNextDirective } from '../directives/focusnext.directive';
import { DateTimePickerComponent } from 'app/layouts/header/date-time-picker/date-time-picker.component';
import { NgbDatepickerModule, NgbModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SortDirective } from '../directives/sort.directive';



@NgModule({
  declarations: [FocusNextDirective,DateTimePickerComponent,SortDirective],
  imports: [
    CommonModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TimepickerModule.forRoot(),
    BsDatepickerModule
  ],
  exports:[
    DateTimePickerComponent,
    FocusNextDirective,
    SortDirective
  ]
})
export class SharedModule { }
