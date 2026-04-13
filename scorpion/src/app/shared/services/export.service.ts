import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() { }

  /**
   * Export data to Excel
   * @param data Array of objects to be exported
   * @param fileName Name of the exported Excel file
   */
  exportToExcel(data: any[], fileName: string = 'Document Track List') {
    const worksheet = XLSX.utils?.json_to_sheet(data);
    const workbook = XLSX.utils?.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveAsExcelFile(excelBuffer, fileName);
  }

  /**
   * Save Excel file
   */
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, `${fileName}.xlsx`);
  }

  /**
   * Export data to CSV
   * @param data Array of objects to be exported
   * @param fileName Name of the exported CSV file
   */
  exportToCSV(data: any[], fileName: string = 'exported-data') {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  }

  /**
   * Convert JSON data to CSV string
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    // Wrap header in quotes to handle commas
    const header = Object.keys(data[0]).map(h => `"${h}"`).join(',');

    const rows = data.map((row) => {
      return Object.values(row).map(value => {
        let valString = value === null || value === undefined ? "" : String(value);

        // Date detection (ISO-like strings from API): e.g., 2025-07-10T04:37:00
        const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:/;
        if (typeof value === 'string' && isoDatePattern.test(value)) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            valString = date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
          }
        }

        // Wrap in quotes and escape internal quotes to ensure CSV integrity
        return `"${valString.replace(/"/g, '""')}"`;
      }).join(',');
    });

    return [header, ...rows].join('\n');
  }
}
