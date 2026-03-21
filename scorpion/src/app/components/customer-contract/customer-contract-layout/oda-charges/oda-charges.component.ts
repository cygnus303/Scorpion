import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-oda-charges',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './oda-charges.component.html',
  styleUrl: './oda-charges.component.scss'
})
export class ODAChargesComponent {
  slabType: string = 'Per Kg.';
  rateType: string = 'Per Kg.';
  minOdaCharge: number = 0.00;

  slabTypes: string[] = ['Per Kg.', 'Flat Rate'];
  rateTypes: string[] = ['Per Kg.', 'Flat Rate'];

  weightSlabs = [
    { from: 0.00, to: 500.00 },
    { from: 501.00, to: 1000.00 },
    { from: 1001.00, to: 1500.00 },
    { from: 1501.00, to: 2000.00 },
    { from: 2001.00, to: 2500.00 },
    { from: 2501.00, to: 999999.00 }
  ];

  distanceSlabs = [
    { from: 0.00, to: 25.00 },
    { from: 26.00, to: 50.00 },
    { from: 51.00, to: 100.00 },
    { from: 101.00, to: 200.00 },
    { from: 201.00, to: 500.00 },
    { from: 501.00, to: 2000.00 }
  ];

  chargeCategories = [
    { name: 'Category A', extraTransitDays: 1, slabs: this.initSlabs() },
    { name: 'Category B', extraTransitDays: 2, slabs: this.initSlabs() },
    { name: 'Category C', extraTransitDays: 3, slabs: this.initSlabs() },
    { name: 'Category D', extraTransitDays: 4, slabs: this.initSlabs() },
    { name: 'Category E', extraTransitDays: 4, slabs: this.initSlabs() },
    { name: 'Category F', extraTransitDays: 4, slabs: this.initSlabs() }
  ];

  private initSlabs() {
    return [
      { min: 0.00, rate: 0.00 },
      { min: 1000.00, rate: 4.00 },
      { min: 2000.00, rate: 4.75 },
      { min: 3000.00, rate: 5.00 },
      { min: 3000.00, rate: 5.00 },
      { min: 3000.00, rate: 5.00 }
    ];
  }

  onSubmit() {
    console.log('ODA Charges Submitted', {
      slabType: this.slabType,
      rateType: this.rateType,
      minOdaCharge: this.minOdaCharge,
      weightSlabs: this.weightSlabs,
      distanceSlabs: this.distanceSlabs,
      chargeCategories: this.chargeCategories
    });
  }
}
