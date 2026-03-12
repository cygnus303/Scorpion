import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddCustomerComponent } from "./add-customer/add-customer.component";

@Component({
  selector: 'app-customer-master-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AddCustomerComponent],
  templateUrl: './customer-master-layout.component.html',
  styleUrl: './customer-master-layout.component.scss'
})
export class CustomerMasterLayoutComponent {

}
