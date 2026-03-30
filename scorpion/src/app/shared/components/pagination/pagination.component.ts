import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() page: number = 1;
  @Input() pageSize: number = 15;
  @Input() totalRecords: number = 0;
  @Input() totalPages: number = 1;

  @Output() pageChange = new EventEmitter<number>();

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.page;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 4) pages.push('...');

      const start = Math.max(2, current - 2);
      const end = Math.min(total - 1, current + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 3) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  setPage(p: any, event?: Event) {
    if (typeof p === 'string') return;
    if (event) event.preventDefault();
    if (p < 1 || p > this.totalPages) return;
    if (p === this.page) return;
    this.pageChange.emit(p);
  }
}
