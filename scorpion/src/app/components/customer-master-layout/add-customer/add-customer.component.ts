import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule,NgSelectModule],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent {

}
