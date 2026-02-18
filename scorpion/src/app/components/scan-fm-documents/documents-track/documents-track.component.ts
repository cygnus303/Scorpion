import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from 'app/shared/services/export.service';
import { PFMService } from 'app/shared/services/pfm.service';

@Component({
  selector: 'app-documents-track',
  standalone: true,
  imports: [CommonModule, NgSelectModule, ɵInternalFormsSharedModule, ReactiveFormsModule, FormsModule],
  templateUrl: './documents-track.component.html',
  styleUrl: './documents-track.component.scss'
})
export class DocumentsTrackComponent {
  public showDocumentList = false;
  public documentsTrackForm!: FormGroup;
  public documentTrackList: any;
  public loading = false;
  public searchText: string = '';
  public DocTypelist = [
    { text: "Bill", value: "2" },
    { text: "COD/DOD", value: "4" },
    { text: "POD", value: "1" },
    { text: "THC", value: "6" },
  ];
  constructor(private pfmService: PFMService, private exportService: ExportService) { }

  ngOnInit() {
    this.documentsTrackForm = new FormGroup({
      docType: new FormControl(null, [Validators.required]),
      DocNo: new FormControl(null, [Validators.required]),
    });
  }

  get filteredDocuments() {
    if (!this.searchText) {
      return this.documentTrackList;
    }
    return this.documentTrackList.filter((data: any) =>
      data.fm_no.toLowerCase().includes(this.searchText.toLowerCase()) ||
      data.fmdt.toLowerCase().includes(this.searchText.toLowerCase()) ||
      data.fromloc.toLowerCase().includes(this.searchText.toLowerCase()) ||
      data.toLoc.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  GetDocumentTrackList(tyep?: string) {
    this.loading = true;
    this.pfmService.getDocumentTrackList(this.documentsTrackForm.value).subscribe({
      next: (response) => {
        this.documentTrackList = response;
        if (tyep === 'export') {
          const formattedData = this.documentTrackList.map((item: any) => ({
            Bill_No: item.bill_no,
            fm_doc_type: item.fm_doc_type,
            fm_no: item.fm_no,
            fmdt: item.fmdt,
            fromloc: item.fromloc,
            toLoc: item.toLoc,
            doc_status: item.doc_status
          }));
          this.exportService.exportToExcel(formattedData);
        }
        this.loading = false;
      }, error: () => {
        this.loading = false;
      }
    });
  }

  goToForwardList() {
    if (this.documentsTrackForm.valid) {
      this.showDocumentList = true;
      this.documentTrackList = [];
      this.GetDocumentTrackList();
    } else {
      this.documentsTrackForm.markAllAsTouched();
    }
  }
}
