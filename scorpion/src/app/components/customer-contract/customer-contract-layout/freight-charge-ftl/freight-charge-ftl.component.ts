import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-freight-charge-ftl',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './freight-charge-ftl.component.html',
  styleUrl: './freight-charge-ftl.component.scss'
})
export class FreightChargeFTLComponent {
  matrixName: string = 'FTL Freight Matrix';
  transMode: string = 'AIR';
  matrixType: string = 'City - City';
  ftlType: string = '12 WHEELER OPEN (24 MT)';
  fromLocation: string = 'AAMDABADA';
  toLocation: string = '24 PARAGANAS';
  noOfRows: number = 0;

  transModes: string[] = ['AIR', 'ROAD', 'RAIL', 'SEA'];
  matrixTypes: string[] = ['City - City', 'State - State', 'Location - Location'];
  ftlTypes: string[] = ['12 WHEELER OPEN (24 MT)', 'TATA ACE (1.5 MT)', '7 MT OPEN', '9 MT OPEN'];

  fromOptions: string[] = ['AAMDABADA', 'MUMBAI', 'DELHI', 'KOLKATA'];
  toOptions: string[] = ['24 PARAGANAS', 'BANGALORE', 'CHENNAI', 'HYDERABAD'];
  billingStates: string[] = ['Customer GST State', 'Maharashtra', 'Gujarat', 'West Bengal'];
  rateTypes: string[] = ['% of Basic Freight', 'FLAT RATE', 'PER KG'];

  tableRows: any[] = [
    { id: 1, from: 'Select From City', to: 'Select To City', ftlType: '12 WHEELER OPEN (24 MT)', rate: 0, transitDays: 0, rateType: '% of Basic Freight', transitMode: 'AIR', billingState: 'Customer GST S...' }
  ];

  isTableCollapsed: boolean = false;

  get fromLabel(): string {
    if (this.matrixType === 'State - State') return 'State';
    if (this.matrixType === 'Location - Location') return 'Location';
    return 'City';
  }

  get toLabel(): string {
    return this.fromLabel;
  }

  onMatrixTypeChange() {
    console.log('Matrix Type changed to:', this.matrixType);
    this.fromLocation = '';
    this.toLocation = '';
  }

  toggleTable() {
    this.isTableCollapsed = !this.isTableCollapsed;
  }

  addNewRow() {
    const count = this.noOfRows > 0 ? this.noOfRows : 1;
    for (let i = 0; i < count; i++) {
      this.tableRows.push({
        id: this.tableRows.length + 1,
        from: 'Select From ' + this.fromLabel,
        to: 'Select To ' + this.toLabel,
        ftlType: this.ftlType,
        rate: 0,
        transitDays: 0,
        rateType: '% of Basic Freight',
        transitMode: this.transMode,
        billingState: 'Customer GST S...'
      });
    }
    this.noOfRows = 0;
  }

  removeRow(index: number) {
    this.tableRows.splice(index, 1);
    // Re-index
    this.tableRows.forEach((row, i) => row.id = i + 1);
  }

  onSubmit() {
    console.log('FTL Submitted', this.tableRows);
  }
}
