import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-delivery-update-list',
  standalone: true,
  imports:[CommonModule, RouterModule],
  templateUrl: './delivery-update-list.component.html',
  styleUrl: './delivery-update-list.component.scss'
})
export class DeliveryUpdateListComponent {

}
