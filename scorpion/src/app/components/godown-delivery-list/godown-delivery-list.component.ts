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
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { ExportService } from 'app/shared/services/export.service';
import { environment } from 'environments/environment';
import { DepsDetailsComponent } from '../drs-generation-list/deps-details/deps-details.component';
import { UpdateGodownDeliveryComponent } from './update-godown-delivery/update-godown-delivery.component';
import { GodownDeliveryViewComponent } from './godown-delivery-view/godown-delivery-view.component';

@Component({
  selector: 'app-godown-delivery-list',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    BsDatepickerModule,
    FormsModule,
    PaginationComponent,
    LrViewComponent,
    HCCDetailsComponent,
    GbViewComponent,
    StickerPrintComponent,
    LrPrintComponent,
    EwaybillInvoiceModalComponent,
    DateRangePickerComponent,
    GdViewComponent,
    DepsDetailsComponent,
    UpdateGodownDeliveryComponent,
    GodownDeliveryViewComponent
  ],
  templateUrl: './godown-delivery-list.component.html',
  styleUrl: './godown-delivery-list.component.scss',
  providers: [BsModalService]
})
export class GodownDeliveryListComponent {
  @ViewChild('LrViewComponent') lrViewComponent!: LrViewComponent;
  @ViewChild('GbViewComponent') gbViewComponent!: GbViewComponent;
  @ViewChild('GdViewComponent') gdViewComponent!: GdViewComponent;
  @ViewChild('HCCDetailsComponent') HCCDetailsComponent!: HCCDetailsComponent;
    @ViewChild('DepsDetailsComponent') depsDetailsComponent!: DepsDetailsComponent;
  @ViewChild('UpdateGodownDeliveryComponent') updateGodownDeliveryComponent!: UpdateGodownDeliveryComponent;
  @ViewChild('GodownDeliveryViewComponent') godownDeliveryViewComponent!: GodownDeliveryViewComponent;
  
  public env = environment;
  public isLoading: boolean = false;
  public isCSVLoading: boolean = false;
  openTrackIndex: number | null = null;
  public listSubscription?: Subscription;
  private fetchSubject = new Subject<void>();

  public isAllSelected: boolean = false;

  public summaryData: any = {
    TotalLR: 0,
    PendingForDelivery: 0,
    Delivered: 0
  };

  public godownDeliveryList: any[] = [];

  public config = {
    fromDateStr: new Date(new Date().setDate(new Date().getDate() - 30)),
    toDateStr: new Date(),
    statusFilter: 'A',
    page: 1,
    pageSize: 15,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

  constructor(
    public docketService: DocketService,
    private exportService: ExportService,
    public dynamicDataService: DynamicDataService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.fetchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchLRList();
    });
    this.fetchData();
  }

  fetchLRList() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }

    const payload = {
      "FilterJson": {
        "ReportId": "396",
        "FromDate": this.formatDateToISO(this.config.fromDateStr),
        "ToDate": this.formatDateToISO(this.config.toDateStr),
        "BRCD": this.docketService.loginUserList?.LocationCode || null,
        "Status": this.config.statusFilter || 'A',
        "PageNo": this.config.page,
        "PageSize": this.config.pageSize,
        "IsDownload": false,
        "DockNo": this.config.searchText || ''
      }
    };

    this.isLoading = true;
    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.handleApiResponse(response);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching Godown Delivery List', err);
        this.godownDeliveryList = [];
        this.config.totalRecords = 0;
        this.config.totalPages = 1;
      }
    });
  }

  fetchData() {
    this.config.page = 1;
    this.fetchSubject.next();
  }

  private handleApiResponse(response: any) {
    if (response.Table1) {
      // 1. Bind Table1 (Summary Data)
      if (response.Table1  && response.Table1.length > 0) {
        this.summaryData = response.Table1[0];
      } else {
       this.summaryData={}
      }

      // 2. Bind Table2 (LR Grid Data)
      if (response.Table2 && response.Table1.length > 0) {
        this.godownDeliveryList = response.Table2.map((item: any) => ({
          ...item,
          isSelected: false
        }));

        if (this.godownDeliveryList.length > 0 && this.godownDeliveryList[0].TotalRecords !== undefined) {
          this.config.totalRecords = this.godownDeliveryList[0].TotalRecords;
        } else {
          this.config.totalRecords = this.godownDeliveryList.length;
        }
        this.config.totalPages = Math.ceil(this.config.totalRecords / this.config.pageSize) || 1;
      } else {
        this.godownDeliveryList = [];
        this.config.totalRecords = 0;
        this.config.totalPages = 1;
      }
    } else {
      this.godownDeliveryList = [];
      this.summaryData = { TotalLR: 0, PendingForDelivery: 0, Delivered: 0 };
      this.config.totalRecords = 0;
      this.config.totalPages = 1;
    }

    this.isAllSelected = false;
  }

  formatDateToISO(dateVal: any): string | null {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }

  onDateRangeSelected(event: any) {
    if (event) {
      this.config.fromDateStr = event.fromDate;
      this.config.toDateStr = event.toDate;
      this.fetchData();
    }
  }

  onSearchChange() {
    this.fetchData();
  }

  setPage(page: number) {
    this.config.page = page;
    this.fetchLRList();
  }

  // =========================================================================
  // 1. Action eligibility logic for an individual docket
  // =========================================================================
  getActions(item: any) {
    if (!item) return { canUpdate: false, canGBHCC: false, canGDHCC: false };

    // Check existence of document numbers
    const hasGB = !!(item.GBNo && item.GBNo !== '—' && item.GBNo !== '-' && item.GBNo !== 'Not Generated' && item.GBNo !== 'N/A');
    const hasGD = !!(item.GDNo && item.GDNo !== '—' && item.GDNo !== '-');
    const hasGBHCC = !!(item.GBHCCNo && item.GBHCCNo !== '—' && item.GBHCCNo !== '-');
    const hasGDHCC = !!(item.GDHCCNo && item.GDHCCNo !== '—' && item.GDHCCNo !== '-');
    const isDelivered = item.StatusCode === 'D';

    return {
      // Rule 1 & 2: Update Godown Delivery (No GD No and delivery is pending)
      canUpdate: !hasGD && !isDelivered && item.PkpDelType !== 'Godown-Door',

      // Rule 2, 3 & 5: GB HCC (GB No exists and GB HCC No is not yet generated)
      canGBHCC: hasGB && !hasGBHCC,

      // Rule 3, 4 & 6: GD HCC (GD No exists and GD HCC No is not yet generated)
      canGDHCC: hasGD && !hasGDHCC
    };
  }

  // =========================================================================
  // 2. Action buttons enable/disable logic based on selected dockets
  // =========================================================================
  get isUpdateGDEnabled(): boolean {
    const selected = this.getSelectedItems();
    return selected.length > 0 && selected.every(item => this.getActions(item).canUpdate);
  }

  get isGBHCCEnabled(): boolean {
    const selected = this.getSelectedItems();
    return selected.length > 0 && selected.every(item => this.getActions(item).canGBHCC);
  }

  get isGDHCCEnabled(): boolean {
    const selected = this.getSelectedItems();
    return selected.length > 0 && selected.every(item => this.getActions(item).canGDHCC);
  }

  // =========================================================================
  // 3. Row checkbox disabled logic
  // =========================================================================
  isCheckboxDisabled(item: any): boolean {
    const actions = this.getActions(item);

    // If no action is pending for this row, disable the checkbox
    if (!actions.canUpdate && !actions.canGBHCC && !actions.canGDHCC) {
      return true;
    }

    const selected = this.getSelectedItems();
    // If no docket is selected yet, or this row is already selected, keep it enabled
    if (selected.length === 0 || item.isSelected) {
      return false;
    }

    // If dockets are selected, only rows sharing at least one common compatible action can be selected
    const matchUpdate = this.isUpdateGDEnabled && actions.canUpdate;
    const matchGB = this.isGBHCCEnabled && actions.canGBHCC;
    const matchGD = this.isGDHCCEnabled && actions.canGDHCC;

    // Disable checkbox if no common action matches
    return !(matchUpdate || matchGB || matchGD);
  }

  // =========================================================================
  // 4. Checkbox Selection Helpers
  // =========================================================================
  toggleSelectAll() {
    if (this.isAllSelected) {
      this.clearSelection();
      return;
    }
    const eligible = this.godownDeliveryList.filter(item => !this.isCheckboxDisabled(item));
    eligible.forEach(item => item.isSelected = true);
    this.checkIfAllSelected();
  }

  checkIfAllSelected() {
    const selected = this.getSelectedItems();
    if (selected.length === 0) {
      this.isAllSelected = false;
      return;
    }
    const selectable = this.godownDeliveryList.filter(item => !this.isCheckboxDisabled(item) || item.isSelected);
    this.isAllSelected = selectable.length > 0 && selectable.every(item => item.isSelected);
  }

  clearSelection() {
    this.isAllSelected = false;
    this.godownDeliveryList.forEach(item => item.isSelected = false);
  }

  getSelectedItems(): any[] {
    return this.godownDeliveryList.filter(item => item.isSelected);
  }

  get selectedItem(): any {
    const selected = this.getSelectedItems();
    return selected.length > 0 ? selected[0] : null;
  }

  get item(): any {
    return this.selectedItem || {};
  }

  get selectedCount(): number {
    return this.getSelectedItems().length;
  }

  get availableActionsList(): string[] {
    const acts: string[] = [];
    if (this.isGBHCCEnabled) acts.push('GB HCC');
    if (this.isUpdateGDEnabled) acts.push('Update Godown Delivery');
    if (this.isGDHCCEnabled) acts.push('GD HCC');
    return acts;
  }

  get availableActionsText(): string {
    return this.availableActionsList.join(', ');
  }

  get isHeaderCheckboxDisabled(): boolean {
    return !this.godownDeliveryList || this.godownDeliveryList.length === 0;
  }

  // Compatibility helpers
  isGBHCCDisabled(): boolean {
    return !this.isGBHCCEnabled;
  }

  isUpdateDeliveryDisabled(): boolean {
    return !this.isUpdateGDEnabled;
  }

  isGDHCCDisabled(): boolean {
    return !this.isGDHCCEnabled;
  }


  // Update Godown Delivery Modal
  openUpdateGodownDelivery() {
    const selected = this.getSelectedItems();
    if (selected.length === 0) {
      if (this.godownDeliveryList.length > 0) {
        if (this.updateGodownDeliveryComponent) {
          this.updateGodownDeliveryComponent.showPopup([this.godownDeliveryList[0]]);
        }
      } else {
        alert('Please select at least one docket.');
        return;
      }
    } else {
      if (this.updateGodownDeliveryComponent) {
        this.updateGodownDeliveryComponent.showPopup(selected);
      }
    }
  }

  onDeliveryUpdated(updatedDockets: any) {
    console.log('Godown Delivery updated:', updatedDockets);
    this.fetchData();
  }

  openDepsDetails(data: any) {
    if (this.depsDetailsComponent) {
      this.depsDetailsComponent.showPopup(data);
    }
  } 

  openSelectedGBHCC() {
    const selected = this.getSelectedItems();
    if (selected.length === 0) {
      alert('Please select at least one docket.');
      return;
    }
    const item = selected[0];
    item.dockno = item.dockno || item.LRNumber;
    item.dockdt = item.dockdt || item.LRDate;
    item.orgncd = item.orgncd || item.OrgCode;
    item.destcd = item.destcd || item.DestCode;
    item.pkgsno = item.pkgsno !== undefined ? item.pkgsno : item.Pkgs;
    item.actuwt = item.actuwt !== undefined ? item.actuwt : item.ActualWt;
    item.gbNo = item.gbNo || item.GBNo;
    item.gdNo = item.gdNo || item.GDNo;
    this.openHCCModal(item);
  }

  openSelectedGDHCC() {
    const selected = this.getSelectedItems();
    if (selected.length === 0) {
      alert('Please select at least one docket.');
      return;
    }
    const item = selected[0];
    item.dockno = item.dockno || item.LRNumber;
    item.dockdt = item.dockdt || item.LRDate;
    item.orgncd = item.orgncd || item.OrgCode;
    item.destcd = item.destcd || item.DestCode;
    item.pkgsno = item.pkgsno !== undefined ? item.pkgsno : item.Pkgs;
    item.actuwt = item.actuwt !== undefined ? item.actuwt : item.ActualWt;
    item.gbNo = item.gbNo || item.GBNo;
    item.gdNo = item.gdNo || item.GDNo;
    this.openGDHCCModal(item);
  }


  // View Modals
  onView(dockno: string) {
    if (dockno && this.lrViewComponent) {
      this.lrViewComponent.showPopup(dockno);
    }
  }

   onViewHCC(documentNo: any, hccNo: any) {
    const url = `${this.env.liveUrl}ViewPrint/ViewHCC?DocumentNo=${documentNo}&HCNo=${hccNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  onGBNo(item: any) {
    const gb = item.GBNo || item.gbNo;
    if (this.gbViewComponent && gb) {
      this.gbViewComponent.openModal(gb);
    }
  }

  onGDNo(item: any) {
    if (this.godownDeliveryViewComponent) {
      this.godownDeliveryViewComponent.openModal(item);
    }
  }

  openHCCModal(lr: any) {
    if (this.HCCDetailsComponent) {
      this.HCCDetailsComponent.showPopup(lr, 'G', 'GB');
    }
  }

  openGDHCCModal(lr: any) {
    if (this.HCCDetailsComponent) {
      this.HCCDetailsComponent.showPopup(lr, 'G', 'GD');
    }
  }

  getPickupDeliveryTypeClass(type: string): string {
    if (!type) return 'badge-default';
    const t = type.toLowerCase().replace(/\s+/g, '-');
    if (t.includes('door') && t.includes('godown')) {
      if (t.startsWith('door')) return 'badge-door-godown';
      return 'badge-godown-door';
    }
    if (t.includes('godown')) return 'badge-godown-godown';
    if (t.includes('door')) return 'badge-door-door';
    return 'badge-default';
  }

  getStatusClass(status: string): string {
    if (!status) return 'chip-pending';
    // if (s.includes('part')) return 'chip-part';
    if (status === 'P') return 'chip-pending';
    if (status === 'D') return 'chip-delivery';
    if ( status === 'T') return 'chip-transit';
    return 'chip-pending';
  }

   onExcelDownload() {
    this.isCSVLoading = true;
    const payload = {
      "FilterJson": {
        "ReportId": "396",
        "FromDate": this.formatDateToISO(this.config.fromDateStr),
        "ToDate": this.formatDateToISO(this.config.toDateStr),
        "BRCD": this.docketService.loginUserList?.LocationCode || null,
        "Status": this.config.statusFilter || 'A',
        "PageNo": this.config.page,
        "PageSize": this.config.pageSize,
        "IsDownload": true,
        "DockNo": this.config.searchText || ''
      }
    };
    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isCSVLoading = false;
        if (response.Table1 && response.Table1.length >0) {
          this.exportService.exportToCSV(response.Table1, `Godown_Delivery_List`);
        }
      },
      error: (err: any) => {
        this.isCSVLoading = false;
        console.error('Error downloading CSV', err);
      }
    });
  }
}
