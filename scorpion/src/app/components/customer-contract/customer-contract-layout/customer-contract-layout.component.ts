import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContractInformationComponent } from './contract-information/contract-information.component';
import { ServiceSelectionComponent } from "./service-selection/service-selection.component";
import { ModeWiseServicesComponent } from "./mode-wise-services/mode-wise-services.component";
import { ChargeMatrixComponent } from './charge-matrix/charge-matrix.component';
import { StandardChargesComponent } from './standard-charges/standard-charges.component';
import { FreightChargeSundryComponent } from './freight-charge-sundry/freight-charge-sundry.component';
import { ODAChargesComponent } from './oda-charges/oda-charges.component';
import { FreightChargeFTLComponent } from './freight-charge-ftl/freight-charge-ftl.component';

@Component({
  selector: 'app-customer-contract-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, ContractInformationComponent, ServiceSelectionComponent, ModeWiseServicesComponent, ChargeMatrixComponent, StandardChargesComponent, FreightChargeSundryComponent, ODAChargesComponent, FreightChargeFTLComponent],
  templateUrl: './customer-contract-layout.component.html',
  styleUrl: './customer-contract-layout.component.scss'
})
export class CustomerContractLayoutComponent {
  selectedTab: string = 'contract';
  selectTab(tab: string) {
    this.selectedTab = tab;
  }

}
