import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-contract-information',
  standalone: true,
  imports: [CommonModule,NgSelectModule],
  templateUrl: './contract-information.component.html',
  styleUrl: './contract-information.component.scss'
})
export class ContractInformationComponent {

}
