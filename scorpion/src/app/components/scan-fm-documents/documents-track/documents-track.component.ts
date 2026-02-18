import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from 'app/shared/services/export.service';
import { PFMService } from 'app/shared/services/pfm.service';
import { SortService } from 'app/shared/services/sort.service';

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
public filteredDocumentList: any[] = [];
public paginatedList: any[] = [];
public recordOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
  { label: 'All', value: 'all' }
];

public selectedRecordCount: any = 10;

public currentPage = 1;
public totalPages = 0;
public pages: number[] = [];

public startIndex = 0;
public endIndex = 0;

public sortColumn: string = '';
public sortDirection: 'asc' | 'desc' = 'asc';


  constructor(private pfmService: PFMService, private exportService: ExportService,private sortService:SortService) { }

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

  GetDocumentTrackList() {
    this.loading = true;
    this.pfmService.getDocumentTrackList(this.documentsTrackForm.value)
      .subscribe({

        next: (response) => {
          this.documentTrackList = response || [];
          this.currentPage = 1;
          this.applyFilterSortPagination();
          this.loading = false;
        },

        error: () => this.loading = false
      });
  }

   applyFilterSortPagination() {
    this.filteredDocumentList = this.documentTrackList.filter((data: any) => {

      if (!this.searchText) return true;

      const text = this.searchText.toLowerCase();

      return (
        data.fm_no?.toLowerCase().includes(text) ||
        data.fmdt?.toLowerCase().includes(text) ||
        data.fromloc?.toLowerCase().includes(text) ||
        data.toLoc?.toLowerCase().includes(text)
      );

    });

    if (this.sortColumn) {

      this.filteredDocumentList.sort((a, b) => {

        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];

        if (valA == null) return 1;
        if (valB == null) return -1;

        if (this.sortDirection === 'asc')
          return valA > valB ? 1 : -1;
        else
          return valA < valB ? 1 : -1;

      });

    }

    let pageSize = this.selectedRecordCount === 'all'? this.filteredDocumentList.length: this.selectedRecordCount;

    this.totalPages = pageSize === 0 ? 0 : Math.ceil(this.filteredDocumentList.length / pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.startIndex = (this.currentPage - 1) * pageSize;
    this.endIndex = Math.min(this.startIndex + pageSize, this.filteredDocumentList.length);
    this.paginatedList = this.filteredDocumentList.slice(this.startIndex, this.endIndex);
  }

   sort(column: string) {
    if (this.sortColumn === column)
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilterSortPagination();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFilterSortPagination();
  }

  onRecordCountChange() {
    this.currentPage = 1;
    this.applyFilterSortPagination();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.applyFilterSortPagination();
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilterSortPagination();
    }
  }

  goToNext() {

    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilterSortPagination();
    }

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

  downloadExcel() {

  if (!this.documentTrackList || this.documentTrackList.length === 0) {
    alert('No data available to export');
    return;
  }

  this.exportService.exportToExcel(this.documentTrackList, 'Document_Track_List');
}
}
