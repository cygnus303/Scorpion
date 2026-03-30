import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-standard-charges',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './standard-charges.component.html',
  styleUrl: './standard-charges.component.scss'
})
export class StandardChargesComponent {
  isFTLCollapsed = false;

  toggleFTL() {
    this.isFTLCollapsed = !this.isFTLCollapsed;
  }
}
