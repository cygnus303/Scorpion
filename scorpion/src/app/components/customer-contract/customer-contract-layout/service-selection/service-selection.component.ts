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
  isPTLCollapsed = false;
  isFTLCollapsed = false;

  selectSection(section: string) {
    this.selectedSection = section;
  }

  togglePTL() {
    this.isPTLCollapsed = !this.isPTLCollapsed;
  }

  toggleFTL() {
    this.isFTLCollapsed = !this.isFTLCollapsed;
  }
}
