import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-charge-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './charge-matrix.component.html',
  styleUrl: './charge-matrix.component.scss'
})
export class ChargeMatrixComponent {
  isFTLCollapsed = false;

  toggleFTL() {
    this.isFTLCollapsed = !this.isFTLCollapsed;
  }
}
