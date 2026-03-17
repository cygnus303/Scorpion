import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipDirective } from "ngx-bootstrap/tooltip";

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, NgSelectModule, RouterModule],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent {

}
