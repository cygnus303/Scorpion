import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-mode-wise-services',
  standalone: true,
  imports: [CommonModule,NgSelectModule],
  templateUrl: './mode-wise-services.component.html',
  styleUrl: './mode-wise-services.component.scss'
})
export class ModeWiseServicesComponent {

}
