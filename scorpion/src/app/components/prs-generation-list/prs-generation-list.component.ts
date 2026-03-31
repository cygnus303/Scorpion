import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-prs-generation-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule],
  templateUrl: './prs-generation-list.component.html',
  styleUrl: './prs-generation-list.component.scss'
})
export class PRSGenerationListComponent {
  public prsData = [
    {
      prsNo: 'PRS/2526/00101',
      date: '21-Mar-26',
      totalDockets: 24,
      vendorType: 'Transporter',
      vendorName: 'Fast Freight Carriers',
      vendorBillNo: '—',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Generated',
      vendorClass: 'v-purple'
    },
    {
      prsNo: 'PRS/2526/00102',
      date: '21-Mar-26',
      totalDockets: 36,
      vendorType: 'Agent',
      vendorName: 'Blue Dart Express',
      vendorBillNo: 'VB/2526/00202',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Billed',
      vendorClass: 'v-blue'
    },
    {
      prsNo: 'PRS/2526/00103',
      date: '21-Mar-26',
      totalDockets: 18,
      vendorType: 'Own Vehicle',
      vendorName: 'Mahindra Logistics',
      vendorBillNo: '—',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Generated',
      vendorClass: 'v-pink'
    },
    {
      prsNo: 'PRS/2526/00104',
      date: '21-Mar-26',
      totalDockets: 42,
      vendorType: 'Transporter',
      vendorName: 'Gati Kintetsu Express',
      vendorBillNo: 'VB/2526/00204',
      loadingHccNo: 'HCC/2526/00441',
      unloadingHccNo: 'HCC/2526/00451',
      status: 'HCC Generated',
      vendorClass: 'v-purple'
    },
    {
      prsNo: 'PRS/2526/00105',
      date: '21-Mar-26',
      totalDockets: 9,
      vendorType: 'Agent',
      vendorName: 'DTDC Courier',
      vendorBillNo: '—',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Cancelled',
      vendorClass: 'v-blue'
    },
    {
      prsNo: 'PRS/2526/00106',
      date: '21-Mar-26',
      totalDockets: 29,
      vendorType: 'Transporter',
      vendorName: 'TCI Express Ltd.',
      vendorBillNo: 'VB/2526/00206',
      loadingHccNo: 'NO HCC',
      unloadingHccNo: 'NO HCC',
      status: 'Billed',
      vendorClass: 'v-purple'
    },
    {
      prsNo: 'PRS/2526/00107',
      date: '21-Mar-26',
      totalDockets: 55,
      vendorType: 'Agent',
      vendorName: 'Xpressbees Logistics',
      vendorBillNo: 'VB/2526/00207',
      loadingHccNo: 'HCC/2526/00442',
      unloadingHccNo: 'HCC/2526/00452',
      status: 'HCC Generated',
      vendorClass: 'v-blue'
    },
    {
      prsNo: 'PRS/2526/00108',
      date: '21-Mar-26',
      totalDockets: 15,
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

  isHccValid(hcc: string): boolean {
    return hcc !== 'NO HCC';
  }
}
