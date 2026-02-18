import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { ExportService } from 'app/shared/services/export.service';
import { PFMService } from 'app/shared/services/pfm.service';
import { ScanFmDocumentsService } from 'app/shared/services/scan-fm-documents.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-podpfmcriteria',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './podpfmcriteria.component.html',
  styleUrl: './podpfmcriteria.component.scss'
})
export class PODPFMCriteriaComponent {
  public podpFmCriteriaForm !: FormGroup;
  public loading = false;
  public PODReport:any[]=[];
  public showDocumentList:boolean =false;

  constructor(
    public commonService: CommonService, 
    public scanFmDocumentsService: ScanFmDocumentsService,
    public pfmService:PFMService,
    public exportService:ExportService
  ) { }
  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    const endDate = new Date(); // aaje ni date
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);
    this.podpFmCriteriaForm = new FormGroup({
      fromloc: new FormControl(null),
      dateRange: new FormControl([startDate, endDate]),
    })
  }

    goToForwardList() {
    if (this.podpFmCriteriaForm.valid) {
      this.showDocumentList = true;
      this.PODReport = [];
      this.getPODReport();
    } else {
      this.podpFmCriteriaForm.markAllAsTouched();
    }
  }

   getPODReport() {
    this.loading = true;
    const payload = {
      fromLoc: this.podpFmCriteriaForm.get('fromloc')?.value,
      fromDt: this.podpFmCriteriaForm.get('dateRange')?.value[0].toISOString().split('T')[0],
      toDt: this.podpFmCriteriaForm.get('dateRange')?.value[1].toISOString().split('T')[0]
    }
    this.pfmService.getPODReport(payload).subscribe({
      next: (response) => {
        this.PODReport = response.data;
        this.loading = false;
      }, error: () => {
        this.loading = false;
      }
    })
  }

  downloadExcel() {
  if (!this.PODReport || this.PODReport.length === 0) {
    alert('No data available to export');
    return;
  }
  this.exportService.exportToExcel(this.PODReport, 'POD_Document_List');
}
}
