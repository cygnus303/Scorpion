import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-print-fmreport-query',
  standalone: true,
  imports: [CommonModule,NgSelectModule,BsDatepickerModule],
  templateUrl: './view-print-fmreport-query.component.html',
  styleUrl: './view-print-fmreport-query.component.scss'
})
export class ViewPrintFMReportQueryComponent {
constructor(private router: Router,public commonService: CommonService) { }

 goToForwardList() {
      this.router.navigate(['/Document/FMReport']);
  }
}
