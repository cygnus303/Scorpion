import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ScanSummary {
  count: number;
  label: string;
  colorType: 'blue' | 'purple' | 'orange' | 'green' | 'gold';
}

interface ScanEvent {
  theme: 'blue' | 'purple' | 'orange' | 'green' | 'gold';
  badge: string;
  title: string;
  docNo?: string;
  time: string;
  subtitle: string;
  isOutscan?: boolean;
  
  // Metadata for standard scans
  scanLoc?: { name: string; code: string };
  scannedBy?: { user: string; name: string };
  lrsCount?: number;
  pkgsCount?: number;

  // Metadata for POD
  deliveryLoc?: string;
  deliveredBy?: string;
  pkgsDelivered?: string;
  receivedBy?: { name: string; role: string };

  // Scan Result
  resultType?: 'success' | 'warning';
  resultText?: string;
  resultShortBadge?: string;
  resultDepsTag?: string;

  // Footer
  footerText: string;
}

@Component({
  selector: 'app-lr-scanning-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-scanning-tab.component.html',
  styles: []
})
export class LrScanningTabComponent {
  @Input() lrDetails: any;

  public summaries: ScanSummary[] = [
    { count: 1, label: 'PRS INSCAN', colorType: 'blue' },
    { count: 3, label: 'LS OUTSCAN', colorType: 'purple' },
    { count: 3, label: 'THC INSCAN', colorType: 'orange' },
    { count: 1, label: 'DRS OUTSCAN', colorType: 'green' },
    { count: 1, label: 'DELIVERY', colorType: 'gold' }
  ];

  public timeline: ScanEvent[] = [
    {
      theme: 'blue',
      badge: 'IN',
      title: 'PRS INSCAN',
      docNo: 'PRS/MAA001/2526/000087',
      time: '13 Apr 2026, 09:40 AM',
      subtitle: 'Consignment Received from Booking Agent',
      isOutscan: false,
      scanLoc: { name: 'Chennai Branch (MAA-001)', code: 'Code: MAA-001' },
      scannedBy: { user: 'USR-MAA-009', name: 'Murugan S.' },
      lrsCount: 5,
      pkgsCount: 22,
      resultType: 'success',
      resultText: '22 / 22 pkgs — Full Count',
      footerText: 'Agent Murugan S. — 5 LRs received, sealed boxes & docs verified'
    },
    {
      theme: 'purple',
      badge: 'OUT',
      title: 'LS OUTSCAN',
      docNo: 'LS/MAA001/2526/000142',
      time: '13 Apr 2026, 12:00 PM',
      subtitle: 'Consignment Despatched — Vehicle Loading',
      isOutscan: true,
      scanLoc: { name: 'Chennai Branch (MAA-001)', code: 'Code: MAA-001' },
      scannedBy: { user: 'USR-MAA-009', name: 'Murugan S.' },
      lrsCount: 5,
      pkgsCount: 22,
      resultType: 'success',
      resultText: '22 / 22 pkgs — Full Count',
      footerText: 'Despatched to Chennai Hub — Vehicle TN-07-CC-4400 (express run for air connection)'
    },
    {
      theme: 'orange',
      badge: 'IN',
      title: 'THC INSCAN',
      docNo: 'THC/MAA001/2526/000029',
      time: '13 Apr 2026, 01:30 PM',
      subtitle: 'Vehicle Arrived — Unloading & Stock-in',
      isOutscan: false,
      scanLoc: { name: 'Chennai Hub (MAA-HUB)', code: 'Code: MAA-HUB' },
      scannedBy: { user: 'USR-HUB-MAA-002', name: 'Ravi Kumar' },
      lrsCount: 5,
      pkgsCount: 22,
      resultType: 'warning',
      resultText: '21 / 22 pkgs scanned',
      resultShortBadge: 'SHORT: 1 pkg',
      resultDepsTag: 'DEPS/BLR001/2526/000031',
      footerText: '1 pkg short on this LR — crate missing. DEPS raised. Pkg traced & recovered by 13:55'
    },
    {
      theme: 'purple',
      badge: 'OUT',
      title: 'LS OUTSCAN',
      docNo: 'LS/MAAHUB/2526/000088',
      time: '13 Apr 2026, 04:00 PM',
      subtitle: 'Consignment Despatched — Vehicle Loading',
      isOutscan: true,
      scanLoc: { name: 'Chennai Hub (MAA-HUB)', code: 'Code: MAA-HUB' },
      scannedBy: { user: 'USR-HUB-MAA-002', name: 'Ravi Kumar' },
      lrsCount: 5,
      pkgsCount: 22,
      resultType: 'success',
      resultText: '22 / 22 pkgs — Full Count',
      footerText: 'All 22 pkgs (recovered crate included) loaded — Air Cargo IndiGo Freight IXC-2604-03'
    },
    {
      theme: 'orange',
      badge: 'IN',
      title: 'THC INSCAN',
      docNo: 'THC/MAAHUB/2526/000048',
      time: '13 Apr 2026, 06:30 PM',
      subtitle: 'Vehicle Arrived — Unloading & Stock-in',
      isOutscan: false,
      scanLoc: { name: 'Bangalore Hub (BLR-HUB)', code: 'Code: BLR-HUB' },
      scannedBy: { user: 'USR-HUB-BLR-004', name: 'Sridhar K.' },
      lrsCount: 5,
      pkgsCount: 22,
      resultType: 'success',
      resultText: '22 / 22 pkgs — Full Count',
      footerText: 'Air cargo arrived at BLR-HUB — all 22 pkgs intact, stock updated'
    },
    {
      theme: 'purple',
      badge: 'OUT',
      title: 'LS OUTSCAN',
      docNo: 'LS/BLRHUB/2526/000051',
      time: '13 Apr 2026, 07:30 PM',
      subtitle: 'Consignment Despatched — Vehicle Loading',
      isOutscan: true,
      scanLoc: { name: 'Bangalore Hub (BLR-HUB)', code: 'Code: BLR-HUB' },
      scannedBy: { user: 'USR-HUB-BLR-004', name: 'Sridhar K.' },
      lrsCount: 5,
      pkgsCount: 22,
      resultType: 'success',
      resultText: '22 / 22 pkgs — Full Count',
      footerText: 'Connected to Bangalore Branch — Vehicle KA-05-NN-3311, Driver Mohan V.'
    },
    {
      theme: 'orange',
      badge: 'IN',
      title: 'THC INSCAN',
      docNo: 'THC/BLRHUB/2526/000034',
      time: '13 Apr 2026, 09:00 PM',
      subtitle: 'Vehicle Arrived — Unloading & Stock-in',
      isOutscan: false,
      scanLoc: { name: 'Bangalore Branch (BLR-001)', code: 'Code: BLR-001' },
      scannedBy: { user: 'USR-BLR-008', name: 'Praveen G.' },
      lrsCount: 5,
      pkgsCount: 22,
      resultType: 'success',
      resultText: '22 / 22 pkgs — Full Count',
      footerText: 'Vehicle KA-05-NN-3311 arrived at delivery branch — 22 pkgs received, stock updated'
    },
    {
      theme: 'green',
      badge: 'OUT',
      title: 'DRS OUTSCAN',
      docNo: 'DRS/BLR001/2526/000009',
      time: '13 Apr 2026, 10:00 PM',
      subtitle: 'Consignment Handed Over to Delivery Agent',
      isOutscan: true,
      scanLoc: { name: 'Bangalore Branch (BLR-001)', code: 'Code: BLR-001' },
      scannedBy: { user: 'USR-BLR-008', name: 'Praveen G.' },
      lrsCount: 4,
      pkgsCount: 18,
      resultType: 'success',
      resultText: '18 / 18 pkgs — Full Count',
      footerText: 'Delivery agent Mohan R. — 4 LRs assigned for night delivery run'
    },
    {
      theme: 'gold',
      badge: 'POD',
      title: 'DELIVERED',
      time: '13 Apr 2026, 11:45 PM',
      subtitle: 'Proof of Delivery Captured',
      isOutscan: false,
      deliveryLoc: 'MG Road, Bengaluru — TVS Dealership (BLR-001)',
      deliveredBy: 'USR-BLR-DEL-003 : Mohan R.',
      pkgsDelivered: '6 Pkgs',
      receivedBy: { name: 'Suresh Kumar', role: '(Warehouse Incharge)' },
      footerText: 'Early delivery — EDD 14 Apr, delivered 13 Apr. All 6 pkgs in good condition, POD uploaded'
    }
  ];

  getSummaryStyle(theme: string): any {
    switch(theme) {
      case 'blue': return { 'background-color': '#f8fafc', 'border': '1px solid #bfdbfe', 'border-radius': '10px' };
      case 'purple': return { 'background-color': '#fdfbff', 'border': '1px solid #e9d5ff', 'border-radius': '10px' };
      case 'orange': return { 'background-color': '#fffaf5', 'border': '1px solid #fed7aa', 'border-radius': '10px' };
      case 'green': return { 'background-color': '#f4fdf8', 'border': '1px solid #bbf7d0', 'border-radius': '10px' };
      case 'gold': return { 'background-color': '#fffbeb', 'border': '1px solid #fde047', 'border-radius': '10px' };
      default: return {};
    }
  }

  getSummaryCountColor(theme: string): string {
    switch(theme) {
      case 'blue': return '#1d4ed8';
      case 'purple': return '#7e22ce';
      case 'orange': return '#c2410c';
      case 'green': return '#15803d';
      case 'gold': return '#854d0e';
      default: return '#000';
    }
  }

  getSummaryLabelColor(theme: string): string {
    return '#64748b'; // In the image, all labels are grey
  }

  getCardStyle(theme: string): any {
    switch(theme) {
      case 'blue': return { 'background-color': '#f0f9ff', 'border': '1px solid #bae6fd', 'border-radius': '12px' };
      case 'purple': return { 'background-color': '#faf5ff', 'border': '1px solid #e9d5ff', 'border-radius': '12px' };
      case 'orange': return { 'background-color': '#fff7ed', 'border': '1px solid #fed7aa', 'border-radius': '12px' };
      case 'green': return { 'background-color': '#f0fdf4', 'border': '1px solid #bbf7d0', 'border-radius': '12px' };
      case 'gold': return { 'background-color': '#fefce8', 'border': '1px solid #fde047', 'border-radius': '12px' };
      default: return {};
    }
  }

  getBadgeStyle(theme: string, type: string): any {
    if (type === 'IN') return { 'background-color': '#dcfce7', 'color': '#166534', 'font-size': '10px', 'font-weight': '800' };
    if (type === 'POD') return { 'background-color': '#fef08a', 'color': '#854d0e', 'font-size': '10px', 'font-weight': '800' };
    
    // OUT badges
    switch(theme) {
      case 'purple': return { 'background-color': '#f3e8ff', 'color': '#7e22ce', 'font-size': '10px', 'font-weight': '800' };
      case 'green': return { 'background-color': '#dcfce7', 'color': '#15803d', 'font-size': '10px', 'font-weight': '800' };
      default: return { 'background-color': '#f3e8ff', 'color': '#7e22ce', 'font-size': '10px', 'font-weight': '800' };
    }
  }

  getTitleColor(theme: string): string {
    switch(theme) {
      case 'blue': return '#1e3a8a';
      case 'purple': return '#6b21a8';
      case 'orange': return '#9a3412';
      case 'green': return '#166534';
      case 'gold': return '#854d0e';
      default: return '#000';
    }
  }

  getDocBadgeStyle(theme: string): any {
    switch(theme) {
      case 'blue': return { 'background-color': '#ffffff', 'color': '#3b82f6', 'border': '1px solid #93c5fd' };
      case 'purple': return { 'background-color': '#ffffff', 'color': '#9333ea', 'border': '1px solid #d8b4fe' };
      case 'orange': return { 'background-color': '#ffffff', 'color': '#ea580c', 'border': '1px solid #fdba74' };
      case 'green': return { 'background-color': '#ffffff', 'color': '#22c55e', 'border': '1px solid #86efac' };
      default: return {};
    }
  }

  getTimelineDotStyle(theme: string, isOutscan?: boolean): any {
    // Circle for IN/POD, Square for OUT
    let borderRadius = isOutscan ? '4px' : '50%';
    let color = '';
    switch(theme) {
      case 'blue': color = '#1d4ed8'; break;
      case 'purple': color = '#7e22ce'; break;
      case 'orange': color = '#c2410c'; break;
      case 'green': color = '#15803d'; break;
      case 'gold': color = '#a16207'; borderRadius = '4px'; break; // POD is filled square in image
    }
    
    if (theme === 'gold') {
       return { 'width': '14px', 'height': '14px', 'border-radius': borderRadius, 'background-color': color, 'border': `2px solid #fff`, 'box-shadow': `0 0 0 2px ${color}`, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center' };
    }

    return {
      'width': '14px',
      'height': '14px',
      'border-radius': borderRadius,
      'background-color': color,
      'border': `3px solid #fff`,
      'box-shadow': `0 0 0 2px ${color}`
    };
  }

  getTimelineLineColor(theme: string): string {
    return '#cbd5e1'; // In the image, the timeline line is a subtle blue/gray
  }

  getIcon(theme: string): string {
    switch(theme) {
      case 'blue': return '📝';
      case 'purple': return '📋';
      case 'orange': return '🚛';
      case 'green': return '🛵';
      case 'gold': return '✅';
      default: return '📄';
    }
  }

  getFooterIcon(resultType?: string): string {
    return resultType === 'warning' ? '⚠️' : '💬';
  }
}
