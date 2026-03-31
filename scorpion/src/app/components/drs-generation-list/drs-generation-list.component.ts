import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-drs-generation-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule],
  templateUrl: './drs-generation-list.component.html',
  styleUrl: './drs-generation-list.component.scss'
})
export class DrsGenerationListComponent {
 public DRSData = [
    {
      DRSNo: 'DRS/2526/00101',
      date: '21-Mar-26',
      ODAType: 'ODA',
      totalDockets:22,
      DeliveryDocket:38,
      vendorType: 'Transporter',
      vendorName: 'Fast Freight Carriers',
      vendorBillNo: '—',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Generated',
      vendorClass: 'v-purple'
    },
    {
      DRSNo: 'DRS/2526/00102',
      date: '21-Mar-26',
      ODAType: 'ODA',
      totalDockets:22,
      DeliveryDocket:38,
      vendorType: 'Agent',
      vendorName: 'Blue Dart Express',
      vendorBillNo: 'VB/2526/00202',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Billed',
      vendorClass: 'v-blue'
    },
    {
      DRSNo: 'DRS/2526/00103',
      date: '21-Mar-26',
      ODAType: 'Non ODA',
      totalDockets:22,
      DeliveryDocket:38,
      vendorType: 'Own Vehicle',
      vendorName: 'Mahindra Logistics',
      vendorBillNo: '—',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Generated',
      vendorClass: 'v-pink'
    },
    {
      DRSNo: 'DRS/2526/00104',
      date: '21-Mar-26',
      ODAType: 'Non ODA',
      totalDockets:22,
      DeliveryDocket:38,
      vendorType: 'Transporter',
      vendorName: 'Gati Kintetsu Express',
      vendorBillNo: 'VB/2526/00204',
      loadingHccNo: 'HCC/2526/00441',
      unloadingHccNo: 'HCC/2526/00451',
      status: 'HCC Generated',
      vendorClass: 'v-purple'
    },
    {
      DRSNo: 'DRS/2526/00105',
      date: '21-Mar-26',
      ODAType: 'ODA',
      totalDockets:22,
      DeliveryDocket:38,
      vendorType: 'Agent',
      vendorName: 'DTDC Courier',
      vendorBillNo: '—',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Cancelled',
      vendorClass: 'v-blue'
    },
    {
      DRSNo: 'DRS/2526/00106',
      date: '21-Mar-26',
      ODAType: 'Non ODA',
      totalDockets:22,
      DeliveryDocket:38,
      vendorType: 'Transporter',
      vendorName: 'TCI Express Ltd.',
      vendorBillNo: 'VB/2526/00206',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Billed',
      vendorClass: 'v-purple'
    },
    {
      DRSNo: 'DRS/2526/00107',
      date: '21-Mar-26',
      ODAType: 'ODA',
      totalDockets:22,
      DeliveryDocket:38,
      vendorType: 'Agent',
      vendorName: 'Xpressbees Logistics',
      vendorBillNo: 'VB/2526/00207',
      loadingHccNo: 'HCC/2526/00442',
      unloadingHccNo: 'HCC/2526/00452',
      status: 'HCC Generated',
      vendorClass: 'v-blue'
    },
    {
      DRSNo: 'DRS/2526/00108',
      date: '21-Mar-26',
      ODAType: 'Non ODA',
      totalDockets:22,
      DeliveryDocket:38,
      vendorType: 'Own Vehicle',
      vendorName: 'SpotOn Logistics',
      vendorBillNo: '—',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Cancelled',
      vendorClass: 'v-pink'
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Generated': return 's-gen';
      case 'Billed': return 's-billed';
      case 'HCC Generated': return 's-hcc';
      case 'Cancelled': return 's-canc';
      default: return '';
    }
  }

  getODAClass(status: string): string {
    switch (status) {
      case 'ODA': return 's-gen';
      case 'Non ODA': return 's-hcc';
      default: return '';
    }
  }

  isHccValid(hcc: string): boolean {
    return hcc !== 'NO HCC';
  }
}
