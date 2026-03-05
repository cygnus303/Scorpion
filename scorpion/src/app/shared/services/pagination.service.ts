import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
    public recordOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: 'All', value: 'all' }
  ];
  selectedRecordCount = 10;
  currentPage = 1;

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  paginate(list: any[], searchText: string) {

    let filtered = [...list];

    // 🔎 Search
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(x =>
        JSON.stringify(x).toLowerCase().includes(search)
      );
    }

    // 🔽 Sorting
    if (this.sortColumn) {
      filtered.sort((a, b) => {

        const valueA = a[this.sortColumn];
        const valueB = b[this.sortColumn];

        if (valueA == null) return -1;
        if (valueB == null) return 1;

        if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;

        return 0;
      });
    }

    const totalPages = Math.ceil(filtered.length / this.selectedRecordCount);

    const startIndex = (this.currentPage - 1) * this.selectedRecordCount;
    const endIndex = startIndex + this.selectedRecordCount;

    const paginatedList = filtered.slice(startIndex, endIndex);

    return {
      filtered,
      paginatedList,
      totalPages,
      startIndex,
      endIndex
    };
  }

  sort(column: string) {

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

  }

}
