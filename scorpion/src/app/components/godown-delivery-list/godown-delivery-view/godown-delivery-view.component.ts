import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-godown-delivery-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './godown-delivery-view.component.html',
  styleUrl: './godown-delivery-view.component.scss',
  providers: [BsModalService]
})
export class GodownDeliveryViewComponent {
  @ViewChild('gdViewTemplate', { static: true }) gdViewTemplate!: TemplateRef<any>;
  @Output() docketClick = new EventEmitter<string>();

  modalRef?: BsModalRef;
  public GDData: any = null;

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService
  ) {}

  openModal(data: any) {
    const raw = typeof data === 'object' && data !== null ? data : { GDNo: data };
    const gdNo = raw.GDNo || raw.gdNo || 'GHD/PIM/2627/000232';

    // Format fields with clean fallbacks matching user's design
    const formattedDocketDate = this.formatDate(raw.LRDateText || raw.LRDate || raw.DocketDate || '18-Sep-2026');
    const formattedDeliveryDate = this.formatDate(raw.deliveryDate || raw.DeliveryDate || '23-Sep-2026');
    const formattedGDDate = this.formatDate(raw.GDDate || raw.DeliveryDate || '24-Sep-2026');
    const deliveryType = this.getDeliveryTypeText(raw.PkpDelType || raw.PkpDelTypeCode || raw.DeliveryType || 'Godown to Godown');
    const orgDest = this.formatOrgDest(raw.OrgDest, raw);
    const customer = this.formatCustomer(raw);
    const deliveryGodown = this.formatDeliveryGodown(raw);

    this.GDData = {
      GDNo: gdNo,
      GDDate: formattedGDDate,
      DeliveryGodown: deliveryGodown,
      OrgDest: orgDest,
      ReassignedLocation: raw.ReassignedLocation || raw.DestCode || 'PIM',
      DeliveryType: deliveryType,
      GBNo: raw.GBNo || 'GHB/MAA/2627/000009',
      Customer: customer,
      DocketNo: raw.LRNumber || raw.DocketNo || 'PIM10024566',
      DocketDate: formattedDocketDate,
      Package: raw.Pkgs !== undefined ? raw.Pkgs : (raw.Package !== undefined ? raw.Package : 48),
      Weight: raw.ActualWt !== undefined ? raw.ActualWt : (raw.Weight !== undefined ? raw.Weight : 1120),
      GDHCCType: raw.GDHCCType || 'Loading HCC',
      GDHCCNo: raw.GDHCCNo || 'HC/PIM/2627/0000461',
      GDHCCStatus: raw.GDHCCStatus || 'Pending for Approval',
      GeneratedBy: raw.GeneratedBy || '2810 : Rahul Pawar',
      DeliveredPkgs: raw.deliveredPkgs !== undefined ? raw.deliveredPkgs : (raw.Pkgs !== undefined ? raw.Pkgs : 48),
      DeliveredWt: raw.deliveredWt !== undefined ? raw.deliveredWt : (raw.ActualWt !== undefined ? raw.ActualWt : 1120),
      DeliveryDate: formattedDeliveryDate,
      DeliveredTo: raw.deliveredTo || 'SELF',
      PersonName: raw.personName || 'Vijay Patil',
      ContactNo: raw.contactNo || '9890055501',
      PodReceived: raw.podReceived || 'No',
      DepsText: raw.DepsText || 'No DEPS'
    };

    this.modalRef = this.modalService.show(this.gdViewTemplate, {
      class: 'modal-lg modal-dialog-centered custom-gd-view-modal',
      backdrop: true
    });

    if (gdNo) {
      this.fetchGDDetails(gdNo);
    }
  }

  closeModal() {
    this.modalRef?.hide();
  }

  onDocketClick(docketNo: string) {
    if (docketNo) {
      this.closeModal();
      this.docketClick.emit(docketNo);
    }
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return String(dateVal);
    }
  }

  getDeliveryTypeText(type: any): string {
    if (!type) return 'Godown to Godown';
    const s = String(type).trim();
    if (s === '1') return 'Godown to Godown';
    if (s === '2') return 'Godown-Door';
    if (s === '3') return 'Door-Godown';
    if (s === '4') return 'Door to Door';
    return type;
  }

  formatOrgDest(val: any, raw: any): string {
    if (raw && raw.OrgCode && raw.DestCode) {
      return `${raw.OrgCode} → ${raw.DestCode}`;
    }
    if (val && typeof val === 'string') {
      return val.replace(/\s*\/\s*/g, ' → ');
    }
    return val || 'CHENNAI → PIMPRI';
  }

  formatCustomer(raw: any): string {
    const custCode = raw.BillingPartyCode || raw.CustomerCode || '';
    const custName = raw.BillingPartyName || raw.CustomerName || raw.BillingParty || raw.Customer || 'C00412 : LUPIN LTD';
    if (custCode && !custName.includes(custCode)) {
      return `${custCode} : ${custName}`;
    }
    return custName;
  }

  formatDeliveryGodown(raw: any): string {
    const locCode = raw.DestCode || raw.ReassignedLocation || raw.CurrentLocation || 'PIM';
    const locMap: any = {
      'PIM': 'PIMPRI',
      'CNI': 'CHENNAI',
      'AMD': 'AHMEDABAD',
      'BOM': 'MUMBAI',
      'DEL': 'DELHI',
      'CTC': 'CUTTACK',
      'JAI': 'JAIPUR',
      'TMR': 'TMR'
    };
    const locName = locMap[locCode] || locCode;
    return `${locCode} : ${locName}`;
  }

  private fetchGDDetails(gdNo: string) {
    const payload = {
      FilterJson: {
        ReportId: '393',
        GDNo: gdNo
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response && response.Table1 && response.Table1.length > 0) {
          const api = response.Table1[0];
          this.GDData = {
            ...this.GDData,
            ...api,
            DocketDate: api.DocketDate ? this.formatDate(api.DocketDate) : this.GDData.DocketDate,
            GDDate: api.GDDate ? this.formatDate(api.GDDate) : this.GDData.GDDate,
            DeliveryType: api.DeliveryType ? this.getDeliveryTypeText(api.DeliveryType) : this.GDData.DeliveryType
          };
        }
      },
      error: (err: any) => {
        console.error('Error fetching GD details from API:', err);
      }
    });
  }
}
