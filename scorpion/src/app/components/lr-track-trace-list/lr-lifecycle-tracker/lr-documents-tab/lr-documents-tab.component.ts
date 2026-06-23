import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DocumentItem {
  name: string;
  docNo: string;
  info: string;
  status: 'Done' | 'View';
  icon: string;
}

interface DocumentSection {
  title: string;
  icon: string;
  items: DocumentItem[];
}

@Component({
  selector: 'app-lr-documents-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-documents-tab.component.html',
  styles: []
})
export class LrDocumentsTabComponent {
  @Input() lrDetails: any;

  public sections: DocumentSection[] = [
    {
      title: 'ORIGIN BRANCH DOCUMENTS',
      icon: '📦',
      items: [
        {
          name: 'Pickup Request',
          docNo: 'PRQ/MAA001/2526/000198',
          info: '13 Apr 2026, 09:45 AM — Agent: Murugan S.',
          status: 'Done',
          icon: '📱'
        },
        {
          name: 'Lorry Receipt',
          docNo: 'LR-2604-00842',
          info: '13 Apr 2026, 09:45 AM — Chennai (MAA-001)',
          status: 'View',
          icon: '📋'
        },
        {
          name: 'Pickup Run Sheet',
          docNo: 'PRS/MAA001/2526/000087',
          info: 'Agent: Murugan S. — Commission: ₹ 210 (Per Box)',
          status: 'Done',
          icon: '📝'
        },
        {
          name: 'HCC-1 Loading @ Pickup',
          docNo: 'HCC/MAA001/2526/Auto',
          info: 'Murugan S. Reimbursement — ₹ 90',
          status: 'Done',
          icon: '📜'
        },
        {
          name: 'HCC-2 Unloading @ Branch',
          docNo: 'HCC/MAA001/2526/Auto',
          info: 'Labour Vendor — ₹ 120',
          status: 'Done',
          icon: '📜'
        },
        {
          name: 'Loading Sheet',
          docNo: 'LS/MAA001/2526/000142',
          info: 'TN-07-CC-4400 — Selvam K.',
          status: 'Done',
          icon: '📋'
        },
        {
          name: 'HCC-3 Loading → Hub',
          docNo: 'HCC/MAA001/2526/Auto',
          info: 'Loader Vendor — ₹ 280',
          status: 'Done',
          icon: '📜'
        },
        {
          name: 'Manifest + THC',
          docNo: 'MF/MAA001/2526/000041 + THC/MAA001/2526/000029',
          info: 'Vehicle: TN-07-CC-4400',
          status: 'Done',
          icon: '📦'
        }
      ]
    },
    {
      title: 'HUB & TRANSIT DOCUMENTS',
      icon: '🏭',
      items: [
        {
          name: 'Hub Manifest + THC',
          docNo: 'MF/MAAHUB/2526/000072 + THC/MAAHUB/2526/000048',
          info: 'Vehicle: AIR-IXC-2604-03 (Air Cargo) — Air Cargo — IndiGo Freight',
          status: 'Done',
          icon: '📦'
        },
        {
          name: 'HCC-4 Unloading @ Origin Hub',
          docNo: 'HCC/MAAHUB/2526/Auto',
          info: 'Hub Labour — ₹ 160',
          status: 'Done',
          icon: '📜'
        }
      ]
    },
    {
      title: 'DELIVERY DOCUMENTS',
      icon: '🏠',
      items: [
        {
          name: 'Delivery Run Sheet',
          docNo: 'DRS/BLR001/2526/000034',
          info: 'Delivery Agent: Kiran B.',
          status: 'Done',
          icon: '🛵'
        },
        {
          name: 'POD — Proof of Delivery',
          docNo: 'Uploaded',
          info: 'Received by: Sanjay Menon (Store Mgr) on 13 Apr 2026, 03:20 PM',
          status: 'Done',
          icon: '📷'
        },
        {
          name: 'POD Forwarding Module',
          docNo: 'PFM/BLR001/2526/000021',
          info: 'Sent to Chennai (MAA-001) — Ops Closed',
          status: 'Done',
          icon: '📤'
        }
      ]
    },
    {
      title: 'STATUTORY',
      icon: '📄',
      items: [
        {
          name: 'E-Way Bill',
          docNo: '33219400028801',
          info: 'Valid — 14 Apr 2026',
          status: 'View',
          icon: '📜'
        }
      ]
    }
  ];
}
