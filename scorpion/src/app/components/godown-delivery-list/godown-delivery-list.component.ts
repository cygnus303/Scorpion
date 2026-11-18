import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { LrViewComponent } from '../lr-list/lr-view/lr-view.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { HCCDetailsComponent } from '../prs-generation-list/hcc-details/hcc-details.component';
import { GbViewComponent } from '../lr-list/gb-view/gb-view.component';
import { StickerPrintComponent } from '../lr-list/sticker-print/sticker-print.component';
import { LrPrintComponent } from '../lr-list/lr-print/lr-print.component';
import { DateRangePickerComponent } from 'app/shared/components/date-range-picker/date-range-picker.component';
import { GdViewComponent } from '../lr-list/gd-view/gd-view.component';
import { EwaybillInvoiceModalComponent } from 'app/shared/components/ewaybill-invoice-modal/ewaybill-invoice-modal.component';

@Component({
  selector: 'app-godown-delivery-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, LrViewComponent, HCCDetailsComponent, GbViewComponent, StickerPrintComponent, LrPrintComponent, EwaybillInvoiceModalComponent, DateRangePickerComponent, GdViewComponent],
  templateUrl: './godown-delivery-list.component.html',
  styleUrl: './godown-delivery-list.component.scss',
  providers: [BsModalService]
})
export class GodownDeliveryListComponent {
  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;
  openTrackIndex: number | null = null;

  public godownDeliveryList: any[] = [
    {
      lrNumber: 'PIM10024501',
      lrDate: '04-Sep-2026',
      orgDest: 'BOM / PIM',
      reassignedLocation: 'PIM',
      isReassigned: false,
      billingPartyCode: 'C00412',
      billingPartyName: 'Lupin Ltd',
      pickupDeliveryType: 'Door-Godown',
      pickupDeliveryTypeClass: 'badge-door-godown',
      gbNo: null,
      isGbNA: true,
      gdNo: null,
      gbHccNo: null,
      isGbHccNA: true,
      gdHccNo: null,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    },
    {
      lrNumber: 'PIM10024517',
      lrDate: '06-Sep-2026',
      orgDest: 'DEL / PIM',
      reassignedLocation: 'PIM',
      isReassigned: false,
      billingPartyCode: 'C00118',
      billingPartyName: 'Cipla Ltd',
      pickupDeliveryType: 'Godown to Godown',
      pickupDeliveryTypeClass: 'badge-godown-godown',
      gbNo: 'GHB/DEL/2627/000041',
      isGbNA: false,
      gdNo: null,
      gbHccNo: null,
      isGbHccNA: false,
      gdHccNo: null,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    },
    {
      lrNumber: 'PIM10024533',
      lrDate: '09-Sep-2026',
      orgDest: 'AMD / MDU',
      reassignedLocation: 'PIM',
      isReassigned: true,
      billingPartyCode: 'C00733',
      billingPartyName: 'Torrent Pharma',
      pickupDeliveryType: 'Door-Godown',
      pickupDeliveryTypeClass: 'badge-door-godown',
      gbNo: null,
      isGbNA: true,
      gdNo: null,
      gbHccNo: null,
      isGbHccNA: true,
      gdHccNo: null,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    },
    {
      lrNumber: 'PIM10024548',
      lrDate: '12-Sep-2026',
      orgDest: 'BLR / PIM',
      reassignedLocation: 'PIM',
      isReassigned: false,
      billingPartyCode: 'C00256',
      billingPartyName: 'Bharat Serums',
      pickupDeliveryType: 'Godown to Godown',
      pickupDeliveryTypeClass: 'badge-godown-godown',
      gbNo: 'GHB/BLR/2627/000017',
      isGbNA: false,
      gdNo: 'GHD/PIM/2627/000229',
      gbHccNo: null,
      isGbHccNA: false,
      gdHccNo: null,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Delivered',
      statusClass: 'chip-delivery'
    },
    {
      lrNumber: 'PIM10024559',
      lrDate: '15-Sep-2026',
      orgDest: 'HYD / PIM',
      reassignedLocation: 'PIM',
      isReassigned: false,
      billingPartyCode: 'C00519',
      billingPartyName: 'Aurobindo Pharma',
      pickupDeliveryType: 'Door-Godown',
      pickupDeliveryTypeClass: 'badge-door-godown',
      gbNo: null,
      isGbNA: true,
      gdNo: 'GHD/PIM/2627/000231',
      gbHccNo: null,
      isGbHccNA: true,
      gdHccNo: null,
      hccPendingApproval: false,
      depsText: 'DEPS View',
      depsCount: 1,
      status: 'Delivered (Part)',
      statusClass: 'chip-booking'
    },
    {
      lrNumber: 'PIM10024566',
      lrDate: '18-Sep-2026',
      orgDest: 'MAA / PIM',
      reassignedLocation: 'PIM',
      isReassigned: false,
      billingPartyCode: 'C00412',
      billingPartyName: 'Lupin Ltd',
      pickupDeliveryType: 'Godown to Godown',
      pickupDeliveryTypeClass: 'badge-godown-godown',
      gbNo: 'GHB/MAA/2627/000009',
      isGbNA: false,
      gdNo: 'GHD/PIM/2627/000232',
      gbHccNo: null,
      isGbHccNA: false,
      gdHccNo: 'HC/PIM/2627/0000461',
      hccPendingApproval: true,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Delivered',
      statusClass: 'chip-delivery'
    },
    {
      lrNumber: 'PIM10024578',
      lrDate: '21-Sep-2026',
      orgDest: 'PIM / BOM',
      reassignedLocation: 'BOM',
      isReassigned: false,
      billingPartyCode: 'C00904',
      billingPartyName: 'Alkem Laboratories',
      pickupDeliveryType: 'Godown-Door',
      pickupDeliveryTypeClass: 'badge-godown-door',
      gbNo: 'GHB/PIM/2627/000001',
      isGbNA: false,
      gdNo: null,
      isGdNA: true,
      gbHccNo: null,
      isGbHccNA: false,
      gdHccNo: null,
      isGdHccNA: true,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    },
    {
      lrNumber: 'PIM10024590',
      lrDate: '24-Sep-2026',
      orgDest: 'PIM / DEL',
      reassignedLocation: 'DEL',
      isReassigned: false,
      billingPartyCode: 'C00118',
      billingPartyName: 'Cipla Ltd',
      pickupDeliveryType: 'Godown to Godown',
      pickupDeliveryTypeClass: 'badge-godown-godown',
      gbNo: 'GHB/PIM/2627/000002',
      isGbNA: false,
      gdNo: null,
      isGdNA: false,
      gbHccNo: 'HC/PIM/2627/0000458',
      isGbHccNA: false,
      gdHccNo: null,
      isGdHccNA: false,
      hccPendingApproval: true,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    },
    {
      lrNumber: 'PIM10024603',
      lrDate: '27-Sep-2026',
      orgDest: 'IDR / PIM',
      reassignedLocation: 'PIM',
      isReassigned: false,
      billingPartyCode: 'C00671',
      billingPartyName: 'Zydus Lifesciences',
      pickupDeliveryType: 'Door-Godown',
      pickupDeliveryTypeClass: 'badge-door-godown',
      gbNo: null,
      isGbNA: true,
      gdNo: 'GHD/PIM/2627/000230',
      isGdNA: false,
      gbHccNo: null,
      isGbHccNA: true,
      gdHccNo: null,
      isGdHccNA: false,
      hccPendingApproval: false,
      depsText: 'DEPS View',
      depsCount: 2,
      status: 'Delivered',
      statusClass: 'chip-delivery'
    },
    {
      lrNumber: 'PIM10024615',
      lrDate: '30-Sep-2026',
      orgDest: 'PIM / CNI',
      reassignedLocation: 'CNI',
      isReassigned: false,
      billingPartyCode: 'C00733',
      billingPartyName: 'Torrent Pharma',
      pickupDeliveryType: 'Godown-Door',
      pickupDeliveryTypeClass: 'badge-godown-door',
      gbNo: 'Not Generated',
      isGbNotGenerated: true,
      isGbNA: false,
      gdNo: null,
      isGdNA: true,
      gbHccNo: null,
      isGbHccNA: false,
      gdHccNo: null,
      isGdHccNA: true,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    },
    {
      lrNumber: 'PIM10024620',
      lrDate: '03-Oct-2026',
      orgDest: 'PIM / PIM',
      reassignedLocation: 'PIM',
      isReassigned: false,
      billingPartyCode: 'C00256',
      billingPartyName: 'Bharat Serums',
      pickupDeliveryType: 'Godown to Godown',
      pickupDeliveryTypeClass: 'badge-godown-godown',
      gbNo: 'GHB/PIM/2627/000003',
      isGbNotGenerated: false,
      isGbNA: false,
      gdNo: null,
      isGdNA: false,
      gbHccNo: null,
      isGbHccNA: false,
      gdHccNo: null,
      isGdHccNA: false,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    },
    {
      lrNumber: 'PIM10024641',
      lrDate: '06-Oct-2026',
      orgDest: 'PIM / MDU',
      reassignedLocation: 'CNI',
      isReassigned: true,
      billingPartyCode: 'C00904',
      billingPartyName: 'Alkem Laboratories',
      pickupDeliveryType: 'Godown to Godown',
      pickupDeliveryTypeClass: 'badge-godown-godown',
      gbNo: 'GHB/PIM/2627/000004',
      isGbNotGenerated: false,
      isGbNA: false,
      gdNo: null,
      isGdNA: false,
      gbHccNo: null,
      isGbHccNA: false,
      gdHccNo: null,
      isGdHccNA: false,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    },
    {
      lrNumber: 'PIM10024655',
      lrDate: '08-Oct-2026',
      orgDest: 'HYD / PIM',
      reassignedLocation: 'PIM',
      isReassigned: false,
      billingPartyCode: 'C00671',
      billingPartyName: 'Zydus Lifesciences',
      pickupDeliveryType: 'Godown-Door',
      pickupDeliveryTypeClass: 'badge-godown-door',
      gbNo: 'GHB/HYD/2627/000022',
      isGbNotGenerated: false,
      isGbNA: false,
      gdNo: null,
      isGdNA: true,
      gbHccNo: null,
      isGbHccNA: false,
      gdHccNo: null,
      isGdHccNA: true,
      hccPendingApproval: false,
      depsText: 'No DEPS',
      depsCount: 0,
      status: 'Pending for Delivery',
      statusClass: 'chip-pending'
    }
  ];

    public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    statusFilter: 'All',
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

  constructor(
    public docketService: DocketService,
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

}
