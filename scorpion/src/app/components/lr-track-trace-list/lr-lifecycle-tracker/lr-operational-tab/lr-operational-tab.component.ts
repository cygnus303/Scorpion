import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lr-operational-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-operational-tab.component.html',
  styles: []
})
export class LrOperationalTabComponent {
  @Input() lrDetails: any;
}
