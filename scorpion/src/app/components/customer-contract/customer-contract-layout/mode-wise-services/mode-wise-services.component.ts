import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mode-wise-services',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './mode-wise-services.component.html',
  styleUrl: './mode-wise-services.component.scss'
})
export class ModeWiseServicesComponent {
  transitMode: string = 'AIR';
  transModes: string[] = ['AIR', 'PTL', 'ROAD CARGO', 'SAMPLE', 'INCINERATION'];

  // Cutoff Time
  cutoffHours: number = 0;
  cutoffMinutes: number = 0;
  cutoffTransitDays: number = 0;

  // Minimum Freight - Base Wise
  minFreightRate: number = 2500.00;
  minFreightBase: string = 'Min Rs';
  baseOptions: string[] = ['Min Rs', 'Percentage', 'Flat'];

  // Freight Invoice Rate (%)
  isFreightAsInvoiceApply: boolean = false;

  // Minimum weight
  minWeightRate: number = 25.00;
  minWeightBase: string = 'Min. KG';
  weightBaseOptions: string[] = ['Min. KG', 'Fixed KG'];

  // Volumetric Conversion
  volumetricRatio: number = 0.00;
  volumetricMeasure: string = 'INCHES';
  measureOptions: string[] = ['INCHES', 'CM', 'FEET'];

  // GST Payer
  gstOption: string = 'Transit Days';
  gstDefault: string = 'Consignor';
  gstPaidBy: string = 'Consignor';
  gstActive: boolean = true;
  gstOptions: string[] = ['Transit Days', 'Service Type', 'Booking Date'];
  payerOptions: string[] = ['Consignor', 'Consignee', 'Third Party'];

  // Fuel Surcharge / PTL
  fuelPTLMin: number = 1.00;
  fuelPTLMax: number = 99999999.00;
  fuelPTLRate: number = 15.00;
  fuelPTLRateType: string = '% of Basic Freight';
  rateTypes: string[] = ['% of Basic Freight', 'Flat Rate', 'Per Kg'];

  // Fuel Surcharge / FTL
  fuelFTLMin: number = 0;
  fuelFTLMax: number = 9999;
  fuelFTLRate: number = 0;
  fuelFTLRateType: string = 'Select Rate Type';

  onSubmit() {
    console.log('Mode Wise Services Submitted', {
      transitMode: this.transitMode,
      cutoff: { hours: this.cutoffHours, minutes: this.cutoffMinutes, days: this.cutoffTransitDays }
    });
  }

  onSaveAndKeep() {
    console.log('Save & Keep On Same Page clicked');
  }
}
