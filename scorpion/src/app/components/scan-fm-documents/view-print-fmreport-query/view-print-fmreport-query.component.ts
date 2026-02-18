import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PFMService } from 'app/shared/services/pfm.service';
import { DocketService } from 'app/shared/services/docket.service';
import { ScanFmDocumentsService } from 'app/shared/services/scan-fm-documents.service';

@Component({
  selector: 'app-view-print-fmreport-query',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './view-print-fmreport-query.component.html',
  styleUrl: './view-print-fmreport-query.component.scss'
})
export class ViewPrintFMReportQueryComponent {
  public viewFilterForm !: FormGroup;

  constructor(
    private router: Router,
    public commonService: CommonService,
    public pfmService: PFMService,
    public docketService: DocketService, public scanFmDocumentsService: ScanFmDocumentsService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.scanFmDocumentsService.getLocationData();
  }

  buildForm() {
    const endDate = new Date(); // aaje ni date
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);
    this.viewFilterForm = new FormGroup({
      RO: new FormControl(null, [Validators.required]),
      Loccode: new FormControl(null, [Validators.required]),
      FmNo: new FormControl(null),
      dateRange: new FormControl([startDate, endDate]),
      fM_Status: new FormControl('All')
    })
  }


  goToForwardList() {
    if (this.viewFilterForm.valid) {
      this.router.navigate(['/Document/FMReport'], { state: { filterData: this.viewFilterForm.value } });
    } else {
      this.viewFilterForm.markAllAsTouched();
    }
  }
}
