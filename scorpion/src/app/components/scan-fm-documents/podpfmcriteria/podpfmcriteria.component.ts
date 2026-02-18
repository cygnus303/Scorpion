import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
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
  constructor(public commonService: CommonService, public scanFmDocumentsService: ScanFmDocumentsService) { }
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
}
