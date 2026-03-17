import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-service-selection',
  standalone: true,
  imports: [CommonModule,NgSelectModule],
  templateUrl: './service-selection.component.html',
  styleUrl: './service-selection.component.scss'
})
export class ServiceSelectionComponent {
  selectedSection: string = 'service';

  selectSection(section: string) {
    this.selectedSection = section;
  }
}
