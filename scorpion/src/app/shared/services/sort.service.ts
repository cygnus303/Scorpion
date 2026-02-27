import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SortService {

  sort<T>(data: T[], column: keyof T, direction: 'asc' | 'desc'): T[] {
    if (!data || !column) return data;

    return [...data].sort((a: any, b: any) => {

      let valueA = a[column];
      let valueB = b[column];

      // Handle null / undefined
      valueA = valueA ?? '';
      valueB = valueB ?? '';

      // Convert to lowercase if string
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;

      return 0;
    });
  }
}
