import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContractInformationComponent } from './contract-information/contract-information.component';
import { ServiceSelectionComponent } from "./service-selection/service-selection.component";

@Component({
  selector: 'app-customer-contract-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, ContractInformationComponent, ServiceSelectionComponent],
  templateUrl: './customer-contract-layout.component.html',
  styleUrl: './customer-contract-layout.component.scss'
})
export class CustomerContractLayoutComponent {
  selectedTab: string = 'contract';
  selectTab(tab: string) {
    this.selectedTab = tab;
  }

}
