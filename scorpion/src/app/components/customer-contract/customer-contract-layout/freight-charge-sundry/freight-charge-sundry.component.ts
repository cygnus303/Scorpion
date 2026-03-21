import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-freight-charge-sundry',
  standalone: true,
  imports: [CommonModule,NgSelectModule ],
  templateUrl: './freight-charge-sundry.component.html',
  styleUrl: './freight-charge-sundry.component.scss'
})
export class FreightChargeSundryComponent {

}
