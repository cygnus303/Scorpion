import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { ExportService } from 'app/shared/services/export.service';
import { PFMService } from 'app/shared/services/pfm.service';
import { ScanFmDocumentsService } from 'app/shared/services/scan-fm-documents.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-podpfmcriteria',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, ReactiveFormsModule,FormsModule],
  templateUrl: './podpfmcriteria.component.html',
  styleUrl: './podpfmcriteria.component.scss'
})
export class PODPFMCriteriaComponent {
  public podpFmCriteriaForm !: FormGroup;
  public loading = false;
  public PODReport:any[]=[];
  public showDocumentList:boolean =false;
  public searchText: string = '';    

  constructor(
    public commonService: CommonService, 
    public scanFmDocumentsService: ScanFmDocumentsService,
    public pfmService:PFMService,
    public exportService:ExportService,
  ) { }
  ngOnInit() {
    this.buildForm();
  }

  get filteredDocuments() {
  if (!this.searchText) {
    return this.PODReport;
  }
  const search = this.searchText.toLowerCase();
  return this.PODReport.filter((item:any) =>
    item.dockno?.toLowerCase().includes(search) ||
    item.dockdt?.toLowerCase().includes(search) ||
    item.dely_Date?.toLowerCase().includes(search) ||
    item.documentDate?.toLowerCase().includes(search) ||
    item.entryBy?.toLowerCase().includes(search) ||
    item.userNm?.toLowerCase().includes(search) ||
    item.location?.toLowerCase().includes(search)
  );
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
      this.scanFmDocumentsService.getCompanyMasterDetails();
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
