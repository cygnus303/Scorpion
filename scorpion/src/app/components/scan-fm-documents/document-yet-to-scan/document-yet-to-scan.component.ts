import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { PFMService } from 'app/shared/services/pfm.service';
import { ScanFmDocumentsService } from 'app/shared/services/scan-fm-documents.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-document-yet-to-scan',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './document-yet-to-scan.component.html',
  styleUrl: './document-yet-to-scan.component.scss'
})
export class DocumentYetToScanComponent {
  public documentYetToScanForm !: FormGroup;
  public documentYetToScan: any;
  public loading = false;
  public showDocumentList = false;
  public DocTypelist = [
    { text: "Bill", value: "2" },
    { text: "COD/DOD", value: "4" },
    { text: "POD", value: "1" },
  ];
  constructor(public commonService: CommonService, public pfmService: PFMService, public docketService: DocketService, public scanFmDocumentsService: ScanFmDocumentsService) { }

  ngOnInit() {
    this.buildForm();
    this.scanFmDocumentsService.getLocationData();
  }

  buildForm() {
    const endDate = new Date(); // aaje ni date
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);
    this.documentYetToScanForm = new FormGroup({
      RO: new FormControl(null, [Validators.required]),
      Loccode: new FormControl(null, [Validators.required]),
      docType: new FormControl(null, [Validators.required]),
      dateRange: new FormControl([startDate, endDate]),
      fM_Status: new FormControl()
    })
  }

  getYetToScan() {
    this.loading = true;
    const payload = {
      docType: this.documentYetToScanForm.get('docType')?.value,
      ro: this.documentYetToScanForm.get('RO')?.value,
      loc: this.documentYetToScanForm.get('Loccode')?.value,
      fromDT: this.documentYetToScanForm.get('dateRange')?.value[0].toISOString().split('T')[0],
      toDT: this.documentYetToScanForm.get('dateRange')?.value[1].toISOString().split('T')[0]
    }
    this.pfmService.GetYetToScan(payload).subscribe({
      next: (response) => {
        this.documentYetToScan = response.data;
        this.loading = false;
      }, error: () => {
        this.loading = false;
      }
    })
  }

  goToForwardList() {
    if (this.documentYetToScanForm.valid) {
      this.showDocumentList = true;
      this.documentYetToScan = [];
      this.getYetToScan();
    } else {
      this.documentYetToScanForm.markAllAsTouched();
    }
  }
}
