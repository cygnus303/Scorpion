import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from 'app/shared/services/export.service';
import { PFMService } from 'app/shared/services/pfm.service';
import { SortService } from 'app/shared/services/sort.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-fmreport-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './fmreport-list.component.html',
  styleUrl: './fmreport-list.component.scss'
})
export class FMReportListComponent {
  public filterData: any;
  public fmList: any[] = [];
  public filteredFmList: any[] = [];
  public paginatedList: any[] = [];
  public searchText: string = '';
  public env = environment;
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
  public isLoading = false;

  constructor(
    public pfmService: PFMService, 
    private sortService: SortService,
    private exportService: ExportService
  ) { }

  ngOnInit() {
    this.filterData = history.state.filterData;
    this.getFMList();
  }

  getFMList() {
    this.isLoading = true;
    const payload = {
      fromDate: this.filterData?.dateRange?.[0] ? new Date(this.filterData.dateRange[0]).toISOString() : null,
      toDate: this.filterData?.dateRange?.[1] ? new Date(this.filterData.dateRange[1]).toISOString() : null,
      ro: this.filterData.RO,
      loccode: this.filterData.Loccode,
      FmNo: this.filterData.FmNo || '',
      fM_Status: this.filterData.fM_Status
    };

    this.pfmService.getFMReport(payload).subscribe({
      next: (response: any[]) => {
        this.fmList = response;
        this.filteredFmList = [...this.fmList];
        this.currentPage = 1;
        this.updatePagination();
      }, complete: () => {
         this.isLoading = false;
      },
      error: () => {
         this.isLoading = false;
      }
    });
  }

  applyFilter() {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.filteredFmList = [...this.fmList];
    }

    else {
      this.filteredFmList = this.fmList.filter(item =>
        item.fm_no?.toLowerCase().includes(search) ||
        item.manual_fm_no?.toLowerCase().includes(search) ||
        item.fmdt?.toLowerCase().includes(search) ||
        item.doc_fwd_to?.toLowerCase().includes(search) ||
        item.fur_FWD_loc?.toLowerCase().includes(search) ||
        item.fM_Status?.toLowerCase().includes(search)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const list = this.filteredFmList;
    if (this.selectedRecordCount === 'all') {
      this.paginatedList = list;
      this.totalPages = 1;
      this.pages = [1];
      this.startIndex = list.length > 0 ? 0 : 0;
      this.endIndex = list.length;
      return;
    }

    this.totalPages = Math.ceil(list.length / this.selectedRecordCount) || 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.startIndex = (this.currentPage - 1) * this.selectedRecordCount;
    this.endIndex = Math.min(
      this.startIndex + this.selectedRecordCount,
      list.length
    );
    this.paginatedList = list.slice(this.startIndex, this.endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  onRecordCountChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  onView(selectedData: any) {
    const url = `${this.env.liveUrl}ViewPrint/PFM_View_Print_Report?PFMNo=${selectedData.fm_no}&DocType=${selectedData.fm_doc_type}`;
    window.open(url, '_blank');
  }

  sort(column: string) {

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredFmList = this.sortService.sort(
      this.filteredFmList,
      column as any,
      this.sortDirection
    );

    this.updatePagination();
  }

downloadExcel() {

  if (!this.fmList || this.fmList.length === 0) {
    alert('No data available to export');
    return;
  }

  // Export complete API response
  this.exportService.exportToExcel(this.fmList, 'FM_Report_List');
}

}
