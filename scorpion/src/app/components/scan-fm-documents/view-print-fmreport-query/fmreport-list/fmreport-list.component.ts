import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-fmreport-list',
  standalone: true,
  imports: [CommonModule,NgSelectModule],
  templateUrl: './fmreport-list.component.html',
  styleUrl: './fmreport-list.component.scss'
})
export class FMReportListComponent {

}
