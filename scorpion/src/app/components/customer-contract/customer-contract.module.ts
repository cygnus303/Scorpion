import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractRoutes } from './contract.routes';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(ContractRoutes),
  ],
  exports: [ RouterModule ],
})
export class CustomerContractModule { }
