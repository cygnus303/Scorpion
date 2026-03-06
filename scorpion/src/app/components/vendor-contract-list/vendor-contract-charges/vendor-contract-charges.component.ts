import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-vendor-contract-charges',
  standalone: true,
  imports: [CommonModule ,FormsModule ,ReactiveFormsModule],
  templateUrl: './vendor-contract-charges.component.html',
  styleUrl: './vendor-contract-charges.component.scss'
})
export class VendorContractChargesComponent {

}
