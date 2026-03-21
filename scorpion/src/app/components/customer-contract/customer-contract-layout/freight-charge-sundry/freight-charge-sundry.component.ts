import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-freight-charge-sundry',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './freight-charge-sundry.component.html',
  styleUrl: './freight-charge-sundry.component.scss'
})
export class FreightChargeSundryComponent {
  chargeName: string = 'Freight Charge';
  transMode: string = 'ROAD CARGO';
  matrixType: string = 'State-State';

  fromLocation: any;
  toLocation: any;

  isTableCollapsed: boolean = false;
  noOfRows: number = 1;

  // Mock data
  matrixTypes = ['State-State', 'Location - Location', 'City-City', 'Zone-Zone'];
  transModes = ['ROAD CARGO', 'AIR CARGO', 'TRAIN CARGO'];

  states = ['BIHAR', 'DELHI', 'MAHARASHTRA', 'GUJARAT', 'RAJASTHAN'];
  locations = ['MUMBAI', 'PATNA', 'HAZARIBAGH', 'DELHI HUB', 'AHMEDABAD'];

  rateTypes = ['% of Basic Freight', 'FLAT RATE', 'PER KG'];
  billingStates = ['Customer GST State', 'Booking State', 'Delivery State'];

  tableRows: any[] = [
    { id: 1, from: null, to: null, rate: 0, rateType: '% of Basic Freight', stdTransitDays: 0, customerTransitDays: 0, transitMode: 'ROAD CARGO', billingState: 'Customer GST State' }
  ];

  get fromLabel(): string {
    if (this.matrixType.includes('State')) return 'State';
    if (this.matrixType.includes('Location')) return 'Location';
    if (this.matrixType.includes('City')) return 'City';
    if (this.matrixType.includes('Zone')) return 'Zone';
    return 'Location';
  }

  get toLabel(): string {
    return this.fromLabel;
  }

  get fromOptions(): string[] {
    if (this.matrixType.includes('State')) return this.states;
    return this.locations;
  }

  get toOptions(): string[] {
    return this.fromOptions;
  }

  onMatrixTypeChange() {
    this.fromLocation = null;
    this.toLocation = null;
    this.tableRows.forEach(row => {
      row.from = null;
      row.to = null;
    });
  }

  addNewRow() {
    const newId = this.tableRows.length > 0 ? Math.max(...this.tableRows.map(r => r.id)) + 1 : 1;
    for (let i = 0; i < (this.noOfRows || 1); i++) {
      this.tableRows.push({
        id: newId + i,
        from: null,
        to: null,
        rate: 0,
        rateType: '% of Basic Freight',
        stdTransitDays: 0,
        customerTransitDays: 0,
        transitMode: 'ROAD CARGO',
        billingState: 'Customer GST State'
      });
    }
  }

  removeRow(index: number) {
    this.tableRows.splice(index, 1);
  }

  toggleTable() {
    this.isTableCollapsed = !this.isTableCollapsed;
  }
}
