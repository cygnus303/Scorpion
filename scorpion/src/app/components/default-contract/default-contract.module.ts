import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DefaultContractComponent } from './default-contract.component';
import { ReactiveFormsModule } from '@angular/forms';

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
    ReactiveFormsModule
  ]
})
export class DefaultContractModule { }
