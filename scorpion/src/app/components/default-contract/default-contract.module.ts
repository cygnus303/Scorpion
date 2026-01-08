import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DefaultContractComponent } from './default-contract.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from "@ng-select/ng-select";

export const Route: Routes = [
  {
    path: '',
    component: DefaultContractComponent,
  }
]

@NgModule({
  declarations: [DefaultContractComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(Route),
    ReactiveFormsModule,
    NgSelectComponent,
    NgSelectModule
]
})
export class DefaultContractModule { }
