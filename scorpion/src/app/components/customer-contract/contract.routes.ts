import { Routes } from '@angular/router';
import { CustomerContractComponent } from './customer-contract.component';
import { CustomerContractLayoutComponent } from './customer-contract-layout/customer-contract-layout.component';

export const ContractRoutes: Routes = [
  {
      path: 'CustContractTypeWise',
      component: CustomerContractComponent,
    },
    {
      path: 'UpdateContract',
      component: CustomerContractLayoutComponent,
    },
];
