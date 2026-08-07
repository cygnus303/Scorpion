import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-bill-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './bill-collection.component.html',
  styleUrl: './bill-collection.component.scss'
})
export class BillCollectionComponent {

}
