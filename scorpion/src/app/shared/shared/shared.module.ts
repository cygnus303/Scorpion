import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusNextDirective } from '../directives/focusnext.directive';



@NgModule({
  declarations: [FocusNextDirective],
  imports: [
    CommonModule
  ],
  exports:[
    FocusNextDirective
  ]
})
export class SharedModule { }
