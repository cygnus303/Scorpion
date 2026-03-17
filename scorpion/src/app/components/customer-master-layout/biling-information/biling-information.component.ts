import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-biling-information',
  standalone: true,
  imports: [CommonModule, NgSelectModule],
  templateUrl: './biling-information.component.html',
  styleUrl: './biling-information.component.scss'
})
export class BilingInformationComponent {

}
