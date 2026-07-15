import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-lr-scanning-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-scanning-tab.component.html',
  styles: []
})
export class LrScanningTabComponent implements OnInit, OnChanges {
  @Input() lrDetails: any;
  public scanningData: any = null;
  public isLoading: boolean = false;
  private lastFetchedDockNo: string | null = null;

  constructor(private lrService: LrService) {}

  ngOnInit() {
    this.fetchScanningData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lrDetails']) {
      this.fetchScanningData();
    }
  }

  fetchScanningData() {
    if (!this.lrDetails) return;
    const dockNo = this.lrDetails?.dockNo || this.lrDetails?.docket_No || this.lrDetails?.docketNo || this.lrDetails?.lR_Number || this.lrDetails?.lrNumber || this.lrDetails?.LrNumber;
    if (!dockNo || dockNo === this.lastFetchedDockNo) return;

    this.lastFetchedDockNo = dockNo;
    this.isLoading = true;
    this.lrService.getScanningTracking(dockNo).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.scanningData = res.data || res;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get sortedDetails(): any[] {
    const list = this.scanningData?.details || this.lrDetails?.details || [];
    return [...list].sort((a: any, b: any) => Number(a?.srNo || 0) - Number(b?.srNo || 0));
  }

  get summaries(): any[] {
    const sum = this.scanningData?.summary || this.lrDetails?.summary || {};
    return [
      { count: sum.prS_Inscan || sum.prs_Inscan || 0, label: 'PRS INSCAN', colorType: 'blue' },
      { count: sum.lS_Outscan || sum.ls_Outscan || 0, label: 'LS OUTSCAN', colorType: 'purple' },
      { count: sum.thC_Inscan || sum.thc_Inscan || 0, label: 'THC INSCAN', colorType: 'orange' },
      { count: sum.drS_Outscan || sum.drs_Outscan || 0, label: 'DRS OUTSCAN', colorType: 'green' },
      { count: sum.delivery || sum.Delivery || 0, label: 'DELIVERY', colorType: 'gold' }
    ];
  }

  getTheme(item: any): string {
    const stage = (item?.stage || '').toLowerCase();
    const docType = (item?.documentType || '').toLowerCase();
    if (stage.includes('deliver') || docType === 'pdc' || docType === 'pod') return 'gold';
    if (stage.includes('prs') || docType === 'prs') return 'blue';
    if (stage.includes('ls') || docType === 'ls') return 'purple';
    if (stage.includes('thc') || docType === 'thc') return 'orange';
    if (stage.includes('drs') || docType === 'drs') return 'green';
    return 'blue';
  }

  getSummaryStyle(theme: string): any {
    switch(theme) {
      case 'blue': return { 'background-color': '#f0f9ff', 'border': '1px solid #93c5fd', 'border-radius': '6px', 'min-height': '74px', 'padding': '8px 6px', 'box-shadow': 'none' };
      case 'purple': return { 'background-color': '#faf5ff', 'border': '1px solid #d8b4fe', 'border-radius': '6px', 'min-height': '74px', 'padding': '8px 6px', 'box-shadow': 'none' };
      case 'orange': return { 'background-color': '#fff7ed', 'border': '1px solid #fdba74', 'border-radius': '6px', 'min-height': '74px', 'padding': '8px 6px', 'box-shadow': 'none' };
      case 'green': return { 'background-color': '#f0fdf4', 'border': '1px solid #86efac', 'border-radius': '6px', 'min-height': '74px', 'padding': '8px 6px', 'box-shadow': 'none' };
      case 'gold': return { 'background-color': '#fefce8', 'border': '1px solid #fde047', 'border-radius': '6px', 'min-height': '74px', 'padding': '8px 6px', 'box-shadow': 'none' };
      default: return { 'border-radius': '6px', 'min-height': '74px', 'padding': '8px 6px', 'box-shadow': 'none' };
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
    return '#64748b';
  }

  getCardStyle(theme: string): any {
    switch(theme) {
      case 'blue': return { 'background-color': '#f0f9ff', 'border': '1.5px solid #60a5fa', 'border-radius': '12px' };
      case 'purple': return { 'background-color': '#faf5ff', 'border': '1.5px solid #c084fc', 'border-radius': '12px' };
      case 'orange': return { 'background-color': '#fff7ed', 'border': '1.5px solid #fb923c', 'border-radius': '12px' };
      case 'green': return { 'background-color': '#f0fdf4', 'border': '1.5px solid #4ade80', 'border-radius': '12px' };
      case 'gold': return { 'background-color': '#fefce8', 'border': '1.5px solid #eab308', 'border-radius': '12px' };
      default: return {};
    }
  }

  getBadgeStyle(theme: string, type: string): any {
    if (type === 'IN') {
      if (theme === 'orange') return { 'background-color': '#fef3c7', 'color': '#b45309', 'font-size': '10px', 'font-weight': '800' };
      return { 'background-color': '#dcfce7', 'color': '#166534', 'font-size': '10px', 'font-weight': '800' };
    }
    if (type === 'POD' || theme === 'gold') return { 'background-color': '#fef08a', 'color': '#854d0e', 'font-size': '10px', 'font-weight': '800' };
    if (type === 'OUT') {
      if (theme === 'green') return { 'background-color': '#dcfce7', 'color': '#15803d', 'font-size': '10px', 'font-weight': '800' };
      return { 'background-color': '#f3e8ff', 'color': '#7e22ce', 'font-size': '10px', 'font-weight': '800' };
    }
    switch(theme) {
      case 'purple': return { 'background-color': '#f3e8ff', 'color': '#7e22ce', 'font-size': '10px', 'font-weight': '800' };
      case 'green': return { 'background-color': '#dcfce7', 'color': '#15803d', 'font-size': '10px', 'font-weight': '800' };
      case 'orange': return { 'background-color': '#fef3c7', 'color': '#b45309', 'font-size': '10px', 'font-weight': '800' };
      default: return { 'background-color': '#dcfce7', 'color': '#166534', 'font-size': '10px', 'font-weight': '800' };
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
      case 'blue': return { 'background-color': '#ffffff', 'color': '#0284c7', 'border': '1px solid #7dd3fc', 'border-radius': '6px', 'padding': '2px 10px', 'font-size': '12px', 'font-weight': '700', 'letter-spacing': '0.3px', 'display': 'inline-block' };
      case 'purple': return { 'background-color': '#ffffff', 'color': '#7e22ce', 'border': '1px solid #d8b4fe', 'border-radius': '6px', 'padding': '2px 10px', 'font-size': '12px', 'font-weight': '700', 'letter-spacing': '0.3px', 'display': 'inline-block' };
      case 'orange': return { 'background-color': '#ffffff', 'color': '#c2410c', 'border': '1px solid #fdba74', 'border-radius': '6px', 'padding': '2px 10px', 'font-size': '12px', 'font-weight': '700', 'letter-spacing': '0.3px', 'display': 'inline-block' };
      case 'green': return { 'background-color': '#ffffff', 'color': '#15803d', 'border': '1px solid #86efac', 'border-radius': '6px', 'padding': '2px 10px', 'font-size': '12px', 'font-weight': '700', 'letter-spacing': '0.3px', 'display': 'inline-block' };
      default: return { 'background-color': '#ffffff', 'color': '#334155', 'border': '1px solid #cbd5e1', 'border-radius': '6px', 'padding': '2px 10px', 'font-size': '12px', 'font-weight': '700', 'letter-spacing': '0.3px', 'display': 'inline-block' };
    }
  }

  getTimelineDotStyle(theme: string, isOutscan?: boolean): any {
    let borderRadius = isOutscan ? '4px' : '50%';
    let color = '';
    switch(theme) {
      case 'blue': color = '#1d4ed8'; break;
      case 'purple': color = '#7e22ce'; break;
      case 'orange': color = '#c2410c'; break;
      case 'green': color = '#15803d'; break;
      case 'gold': color = '#b45309'; borderRadius = '50%'; break;
    }
    if (theme === 'gold') {
       return { 'width': '14px', 'height': '14px', 'border-radius': '50%', 'background-color': '#ffffff', 'border': `3px solid #b45309`, 'box-shadow': `0 0 0 1px #b45309`, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center' };
    }
    return { 'width': '14px', 'height': '14px', 'border-radius': borderRadius, 'background-color': color, 'border': `3px solid #fff`, 'box-shadow': `0 0 0 2px ${color}` };
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

  isGreenResult(ev: any): boolean {
    if (!ev) return true;
    if (ev.pending !== undefined && ev.pending !== null && ev.pending !== '' && Number(ev.pending) > 0) {
      return false;
    }
    const resultStr = (String(ev.packageScanned || '') + ' ' + String(ev.scanResult || '') + ' ' + String(ev.scanStatus || '')).toLowerCase();
    if (resultStr.includes('half') || resultStr.includes('short') || resultStr.includes('missing') || resultStr.includes('excess') || resultStr.includes('damage') || resultStr.includes('discrepancy') || resultStr.includes('warning') || resultStr.includes('pending') || resultStr.includes('error')) {
      return false;
    }
    if (resultStr.startsWith('0 /') || resultStr.startsWith('0.00 /')) {
      return false;
    }
    if (resultStr.includes('full count') || resultStr.includes('full')) {
      return true;
    }
    if (ev.resultType === 'warning' || ev.resultType === 'short' || ev.resultType === 'error' || ev.resultType === 'red') {
      return false;
    }
    if (ev.packageScanned && String(ev.packageScanned).includes(' / ')) {
      const parts = String(ev.packageScanned).split(' / ');
      const scannedNum = parseFloat(parts[0]);
      if (!isNaN(scannedNum) && scannedNum === 0) return false;
    }
    return true;
  }

  getResultBoxStyle(ev: any): any {
    if (this.isGreenResult(ev)) {
      return { 'background-color': 'rgb(244, 255, 250)', 'border': '1px solid rgb(138, 235, 190)', 'border-radius': '6px' };
    } else {
      return { 'background-color': 'rgb(255, 243, 243)', 'border': '1px solid rgb(243, 136, 136)', 'border-radius': '6px' };
    }
  }

  getResultTextColor(ev: any): string {
    return this.isGreenResult(ev) ? 'rgb(13, 148, 136)' : '#dc2626';
  }

  getResultText(ev: any): string {
    if (!ev) return '--';

    // Show only packageScanned key when available, as requested
    if (ev.packageScanned !== undefined && ev.packageScanned !== null && ev.packageScanned !== '') {
      return String(ev.packageScanned);
    }

    if (ev.scanResult) return ev.scanResult;
    if (ev.scanStatus) return ev.scanStatus;

    const pendingVal = (ev.pending !== undefined && ev.pending !== null && ev.pending !== '') ? Number(ev.pending) : 0;
    const totalVal = (ev.packageTotal !== undefined && ev.packageTotal !== null && ev.packageTotal !== '' && ev.packageTotal !== '--')
      ? Number(ev.packageTotal)
      : ((ev.totalPackages !== undefined && ev.totalPackages !== null && ev.totalPackages !== '') ? Number(ev.totalPackages) : ((ev.packages !== undefined && ev.packages !== null && ev.packages !== '') ? Number(ev.packages) : 0));

    if (pendingVal > 0) {
      const scannedVal = Math.max(0, totalVal - pendingVal);
      const statusStr = pendingVal === totalVal ? `Pending: ${pendingVal} Pkgs` : `Short: ${pendingVal} Pkgs`;
      return totalVal > 0 ? `${scannedVal} / ${totalVal} Pkgs — ${statusStr}` : statusStr;
    }

    return totalVal > 0 ? `${totalVal} / ${totalVal} Pkgs — Full Count` : '--';
  }
}
