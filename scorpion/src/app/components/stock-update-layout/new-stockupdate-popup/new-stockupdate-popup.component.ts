import { Component, TemplateRef, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DeliveryUpdateService } from 'app/shared/services/delivery-update.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { DrsUpdateDepsComponent } from 'app/components/drs-generation-list/drs-update-list/drs-update-deps/drs-update-deps.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { SharedModule } from 'app/shared/shared/shared.module';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { VendorChargeHelperService } from 'app/shared/services/vendor-charge.service';

@Component({
  selector: 'app-new-stockupdate-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, DrsUpdateDepsComponent, SharedModule],
  templateUrl: './new-stockupdate-popup.component.html',
  styleUrl: './new-stockupdate-popup.component.scss',
  providers: [BsModalService]
})
export class NewStockupdatePopupComponent implements OnInit {
  public modalRef?: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @ViewChild('DrsUpdateDepsComponent') depsEntryComponent!: DrsUpdateDepsComponent;
  @Output() dataEmitter: EventEmitter<any> = new EventEmitter<any>();

  public isLoading: boolean = false;
  public maxDate: Date = new Date();
  public dlyPrcList: any[] = [];
  public listVSFUM: any[] = [];
  public selectedDeliveryProcessAll: string | null = null;
  public unloaderUsers: any[] = [];
  public notUnloaderName: string = 'Enter at least 3 characters';
  public unloaderName: any = null;
  public unloadingSupervisor: any = null;
  public submitted: boolean = false;
  public rowVendorList: any[][] = [];
  public headerVendorList: any[] = [];
  public headerVendor: any = null;
  public headerVendorTyp: any = null;
  public headerRateType: any = null;

  public stockData: any = {
    thcno: '',
    thcdt: '',
    actarrv_dt: '',
    vehno: '',
    updateDate: ''
  };

  constructor(
    private modalService: BsModalService,
    private stockUpdateService: StockUpdateService,
    private thcMasterService: THCMasterService,
    public docketService: DocketService,
    private sweetAlertService: SweetAlertService,
    private deliveryUpdateService: DeliveryUpdateService,
    public generalMasterService: GeneralMasterService,
    public vendorChargeHelper: VendorChargeHelperService
  ) {}

  ngOnInit() {
    this.getDeliveryProcesses();
    // this.generalMasterService.getChargeTypeData();
    // this.getVendorType();
  }

  getDeliveryProcesses() {
    this.thcMasterService.getGeneralMasterDetail('DLYPRC').subscribe({
      next: (res: any) => {
        if (res) {
          this.dlyPrcList = res.data || res || [];
        }
      },
      error: (err) => {
        console.error('Error fetching delivery processes:', err);
      }
    });
  }

  stockUpdateUsers(event: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 3) {
      this.unloaderUsers = [];
      this.notUnloaderName = 'Enter at least 3 characters';
      return;
    }
    const baseLocation = this.docketService.Location || this.docketService.loginUserList?.LocationCode || 'BWH';
    const payload = {
      searchTerm: searchText,
      baseLocationCode: baseLocation,
    };
    this.notUnloaderName = 'Searching...';
    this.stockUpdateService.stockUpdateUsers(payload).subscribe({
      next: (response) => {
        if (response) {
          if (response.success && response.data) {
            this.unloaderUsers = response.data;
          } else if (Array.isArray(response)) {
            this.unloaderUsers = response;
          } else if (response.data) {
            this.unloaderUsers = response.data;
          } else {
            this.unloaderUsers = [];
          }
          this.notUnloaderName = 'No matches found';
        }
      },
      error: (err) => {
        console.error('Error fetching stock update users:', err);
        this.unloaderUsers = [];
        this.notUnloaderName = 'Error searching users';
      }
    });
  }

  resetUnloaderDropdown() {
    this.unloaderUsers = [];
    this.notUnloaderName = 'Enter at least 3 characters';
  }

  showPopup(data?: any) {
    if (!data || !data.thcNo) {
      console.warn('No THC number provided to showPopup');
      return;
    }

    const thcNo = data.thcNo;
    const baseLocation = this.docketService.Location || this.docketService.loginUserList?.LocationCode || 'BWH';

    // Clear old data and set loading state
    this.stockData = {
      thcno: thcNo,
      thcdt: '',
      actarrv_dt: '',
      vehno: '',
      updateDate: this.getCurrentFormattedDate()
    };
    this.listVSFUM = [];
    this.selectedDeliveryProcessAll = null;
    this.unloaderName = null;
    this.unloadingSupervisor = null;
    this.submitted = false;
    this.unloaderUsers = [];
    this.notUnloaderName = 'Enter at least 3 characters';
    this.headerVendor = null;
    this.headerVendorTyp = null;
    this.headerRateType = null;
    this.headerVendorList = [];
    this.isLoading = true;

    this.generalMasterService.getChargeTypeData();
    this.getVendorType();

    // Show popup immediately
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });

    // Call API in the background
    this.stockUpdateService.getStockUpdateDetails({ id: thcNo, baseLocationCode: baseLocation, BaseLocationCode: baseLocation }).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        // Map THC Details and Docket List
        if (res) {
          const vsfum = res.vsfum || {};
          this.stockData = {
            ...vsfum,
            thcno: vsfum.thcno || thcNo,
            thcdt: vsfum.thcdt ? this.formatDateDisplay(vsfum.thcdt) : '',
            actarrv_dt: vsfum.actarrv_dt ? this.formatDateDisplay(vsfum.actarrv_dt) : '',
            vehno: vsfum.vehno || '',
            updateDate: this.getCurrentFormattedDate()
          };

          this.listVSFUM = res.listVSFUM || [];
          // Pre-populate fields if needed
          this.listVSFUM.forEach((item, idx) => {
            if (item.pkgsno === undefined || item.pkgsno === null) {
              item.pkgsno = item.bkG_PKGSNO || 0;
            }
            item.dp = item.dp || null;
            item.isDamage = item.isDamage || false;
            item.isSelected = false;
            item.frontFiles = [];
            item.frontFile = null;
            item.frontPreview = null;
            item.backFiles = [];
            item.backFile = null;
            item.backPreview = null;

            item.luVendorTyp = item.luVendorTyp || null;
            item.luVendorCode = item.luVendorCode || null;
            item.rateType = item.ratetype || item.rateType || null;
            item.newRate = item.newRate !== undefined && item.newRate !== null ? item.newRate : 0;
            if (item.luVendorTyp) {
              this.vendorChargeHelper.fetchVendorListFor(item.luVendorTyp, (list: any[]) => {
                this.rowVendorList[idx] = list;
              }, 'U');
            }

            let formattedBookingDate = new Date();
            if (item.dockdt) {
              const parts = item.dockdt.split('/');
              if (parts.length === 3) {
                formattedBookingDate = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
              } else {
                const parsed = new Date(item.dockdt);
                if (!isNaN(parsed.getTime())) formattedBookingDate = parsed;
              }
            }
            item.bookingDate = formattedBookingDate;
            const initialDelyDate = item.delydate || item.cdelydt || new Date();
            item.delyForm = new FormGroup({
              DELYDATE: new FormControl(initialDelyDate)
            });
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching stock update details:', err);
      }
    });
  }

  isEligibleForDeliveryProcess(row: any): boolean {
    if (!row || !this.docketService?.loginUserList) return false;
    const loc = this.docketService.loginUserList.LocationCode;
    return loc === row.desT_CD || (row.isFTLDelivery === true && loc === row.thcbr && row.desT_CD === loc);
  }

  get hasAnyEligibleForDeliveryProcess(): boolean {
    return this.listVSFUM && this.listVSFUM.some(item => this.isEligibleForDeliveryProcess(item));
  }

  setAllDeliveryProcess() {
    if (this.listVSFUM && this.listVSFUM.length > 0) {
      this.listVSFUM.forEach(item => {
        if (this.isEligibleForDeliveryProcess(item)) {
          item.dp = this.selectedDeliveryProcessAll;
        }
      });
    }
  }

  get totalPkgs(): number {
    return this.listVSFUM.reduce((sum, item) => sum + (item.bkG_PKGSNO || 0), 0);
  }

  get totalArrivedPkgs(): number {
    return this.listVSFUM.reduce((sum, item) => sum + (+item.pkgsno || 0), 0);
  }

  get totalShortage(): number {
    return this.listVSFUM.reduce((sum, item) => sum + (+item.shortageQty || 0), 0);
  }

  get totalDamage(): number {
    return this.listVSFUM.reduce((sum, item) => sum + (item.isDamage ? 1 : 0), 0);
  }

  private formatDateDisplay(dateStr: string): string {
    try {
      if (!dateStr) return '';
      let date: Date | null = null;

      // Custom parsing to handle "DD-MMM-YYYY HH:mm" or similar dash-separated date formats
      const match = dateStr.match(/^(\d{1,2})[-/]([A-Za-z]{3,9})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2}))?(?::(\d{2}))?/);
      if (match) {
        const day = parseInt(match[1], 10);
        const monthStr = match[2].toLowerCase();
        const year = parseInt(match[3], 10);
        const hours = match[4] ? parseInt(match[4], 10) : 0;
        const minutes = match[5] ? parseInt(match[5], 10) : 0;
        const seconds = match[6] ? parseInt(match[6], 10) : 0;

        const monthsList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = monthsList.indexOf(monthStr.substring(0, 3));
        if (monthIndex !== -1) {
          date = new Date(year, monthIndex, day, hours, minutes, seconds);
        }
      }

      if (!date || isNaN(date.getTime())) {
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) return dateStr;

      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      let hours = date.getHours();
      const mins = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // 12-hour format

      return `${day} ${month} ${year} ${hours}:${mins} ${ampm}`;
    } catch {
      return dateStr;
    }
  }

  private getCurrentFormattedDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // 12-hour format
    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }

  parseDate(dateStr: string): any {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      return isNaN(parsedDate.getTime()) ? dateStr : parsedDate;
    }
    return dateStr;
  }

  onDamageChange(event: any, row: any, index: number) {
    const originalState = row.isDamage;
    event.target.checked = originalState; // Force UI state to stay as is until confirmed

    if (!originalState) {
      row.isDamage = true;
      row.isSelected = true; // Auto select the row when checking damage
      this.openDepsPopup(row, index);
    } else {
      if (row.depsData) {
        const confirmClear = confirm('This docket already has DEPS details. Do you want to remove them?\n\n- Click "OK" to delete DEPS details.\n- Click "Cancel" to keep them and edit details.');
        if (confirmClear) {
          row.isDamage = false;
          row.depsData = null;
          row.damageQry = 0;
          row.damageWeight = 0;
          row.damageType = '';
          row.severity = '';
          row.remarks = '';
          row.depsfile = '';
        } else {
          this.openDepsPopup(row, index);
        }
      } else {
        row.isDamage = false;
        row.depsData = null;
        row.damageQry = 0;
        row.damageWeight = 0;
        row.damageType = '';
        row.severity = '';
        row.remarks = '';
        row.depsfile = '';
      }
    }
  }

  openDepsPopup(row: any, index: number) {
    const popupData = {
      ...row,
      dockno: row.dockNo,
      docketsf: row.dockSF || row.docksf || '.',
      booking_Date: this.parseDate(row.dockdt),
      orgncd: row.orgncd,
      destcd: row.desT_CD || row.destcd,
      pkgsno: row.pkgsno,
      invval: row.invval || 0,
      depstype: 'D'
    };
    
    const thcNo = this.stockData.thcno || '';
    const thcDt = this.stockData.thcdt || '';
    this.depsEntryComponent.showPopup(popupData, thcNo, thcDt, '', 1, index);
  }

  onDepsDataReceived(event: any) {
    console.log('Received DEPS Data:', event);
    const index = event.rowIndex;
    const depsData = event.depsData;
    if (this.listVSFUM[index]) {
      this.listVSFUM[index].depsData = depsData;
      this.listVSFUM[index].isDamage = true;
      this.listVSFUM[index].damageQry = depsData.affectedQty || 0;
      this.listVSFUM[index].damageWeight = depsData.affectedWeight || 0;
      this.listVSFUM[index].damageType = depsData.damageType || '';
      this.listVSFUM[index].severity = depsData.severity || '';
      this.listVSFUM[index].remarks = depsData.remarks || '';
      this.listVSFUM[index].depsfile = depsData.depsfile || '';
    }
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.listVSFUM.forEach(row => row.isSelected = checked);
  }

  isAllSelected(): boolean {
    if (!this.listVSFUM || this.listVSFUM.length === 0) return false;
    return this.listVSFUM.every(row => row.isSelected);
  }

  isDeliveryOnArrival(row: any): boolean {
    if (!row || row.dp === null || row.dp === undefined || row.dp === '') return false;
    if (row.dp?.toString() === '2') return true;
    const match = this.dlyPrcList.find(item => item.codeId?.toString() === row.dp?.toString());
    return match?.codeDesc?.toUpperCase().includes('DELIVERY ON ARRIVAL') || match?.codeDesc?.toUpperCase().includes('ARRIVAL') || false;
  }

  onFileSelected(event: any, row: any, type: 'FRONT' | 'BACK') {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (type === 'FRONT') {
      if (row.frontPreview) {
        URL.revokeObjectURL(row.frontPreview);
      }
      row.frontFiles = [file];
      row.frontFile = file;
      row.frontPreview = previewUrl;
    } else {
      if (row.backPreview) {
        URL.revokeObjectURL(row.backPreview);
      }
      row.backFiles = [file];
      row.backFile = file;
      row.backPreview = previewUrl;
    }
    if (type === 'FRONT') {
      this.validatePOD(row, type);
    }
    event.target.value = '';
  }

  removeFile(row: any, type: 'FRONT' | 'BACK') {
    if (type === 'FRONT') {
      if (row.frontPreview) {
        URL.revokeObjectURL(row.frontPreview);
      }
      row.frontFiles = [];
      row.frontFile = null;
      row.frontPreview = null;
    } else {
      if (row.backPreview) {
        URL.revokeObjectURL(row.backPreview);
      }
      row.backFiles = [];
      row.backFile = null;
      row.backPreview = null;
    }
  }

  validatePOD(row: any, type: 'FRONT' | 'BACK' = 'FRONT') {
    if (type !== 'FRONT') return;
    const docketNo = row.dockNo || row.tcno || row.docketNo;
    if (!docketNo) {
      console.error('Dock No not found for row', row);
      return;
    }
    const frontFiles: File[] = row.frontFiles || [];
    const backFiles: File[] = row.backFiles || [];
    if (!frontFiles.length) return;

    if (type === 'FRONT') {
      row.isValidatingFront = true;
    } else {
      row.isValidatingBack = true;
    }

    const formData = new FormData();
    formData.append('DocNo', docketNo);
    frontFiles.forEach((file: File) => { formData.append('PodFile', file); });
    backFiles.forEach((file: File) => { formData.append('PodBackFile', file); });

    const baseUserName = this.docketService.loginUserList?.BaseUserName || this.docketService.loginUserList?.UserId || '';
    this.deliveryUpdateService.CheckPODValidation(formData, baseUserName).subscribe({
      next: (response: any) => {
        row.isValidatingFront = false;
        row.isValidatingBack = false;
        const isSuccess = response?.status === true || response?.status === 'true' || response?.success === true || response?.successResult === true || (response?.message && typeof response.message === 'string' && response.message.toLowerCase().includes('matched') && !response.message.toLowerCase().includes('not'));
        if (isSuccess) {
          row.podValidated = true;
        } else {
          this.sweetAlertService.error(response?.message || `POD validation failed for Dock No ${docketNo}`);
          this.removeFile(row, 'FRONT');
          this.removeFile(row, 'BACK');
          row.podValidated = false;
        }
      },
      error: (error: any) => {
        row.isValidatingFront = false;
        row.isValidatingBack = false;
        this.sweetAlertService.error(error?.error?.message || `Error validating POD for Dock No ${docketNo}`);
        this.removeFile(row, 'FRONT');
        this.removeFile(row, 'BACK');
        row.podValidated = false;
      }
    });
  }

  isImageFile(file: any): boolean {
    if (!file) return true;
    if (file.type && file.type.startsWith('image/')) return true;
    if (file.name && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)) return true;
    return false;
  }

  getIsoDateString(dateStr?: string): string {
    if (!dateStr) return new Date().toISOString();
    try {
      const match = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s+([AMPMampm]{2}))?/);
      if (match) {
        const day = parseInt(match[1], 10);
        const monthStr = match[2].toLowerCase();
        const year = parseInt(match[3], 10);
        let hours = match[4] ? parseInt(match[4], 10) : 0;
        const minutes = match[5] ? parseInt(match[5], 10) : 0;
        const ampm = match[6] ? match[6].toUpperCase() : '';
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const monthsList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = monthsList.indexOf(monthStr);
        if (monthIndex !== -1) {
          const now = new Date();
          const dt = new Date(Date.UTC(year, monthIndex, day, hours, minutes, now.getUTCSeconds(), now.getUTCMilliseconds()));
          return dt.toISOString();
        }
      }
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    } catch (e) {
      console.error('Date parse error:', e);
    }
    return new Date().toISOString();
  }

  onArrivedPkgsChange(row: any) {
    const arrPkgs = +row.pkgsno || 0;
    const totalPkgs = +row.bkG_PKGSNO || 0;
    const totalWt = +row.bkG_ACTUWT || 0;

    if (totalPkgs > 0 && arrPkgs >= 0) {
      const calculatedWt = (arrPkgs * totalWt) / totalPkgs;
      row.actuwt = Number.isInteger(calculatedWt) ? calculatedWt : Number(calculatedWt.toFixed(2));
    }
  }

  getVendorType() {
    const locationCode = this.docketService.Location || this.docketService.loginUserList?.LocationCode || 'BWH';
    this.thcMasterService.getVendorType(locationCode).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const mTypeRow = response.data.find((x: any) => x.documentType === 'D');
          if (mTypeRow) {
            const vendorStr = mTypeRow.unLoading_VendorType || mTypeRow.UnLoading_VendorType;
            if (vendorStr) {
              const vendorTypes = vendorStr.split(',');
              this.generalMasterService.getLoadingByDetail(vendorTypes);
            }
          }
        }
      }
    });
  }

  onHeaderHccVendorTypeChange(event: any) {
    this.headerVendor = null;
    const type = event?.codeId || event;
    this.headerVendorTyp = type;

    if (!type) {
      this.headerVendorList = [];
      this.listVSFUM.forEach((row, i) => {
        row.luVendorTyp = null;
        row.luVendorCode = null;
        this.rowVendorList[i] = [];
      });
      return;
    }

    this.vendorChargeHelper.fetchVendorListFor(type.toString(), (list: any[]) => {
      this.headerVendorList = list;
      this.listVSFUM.forEach((row, i) => {
        row.luVendorTyp = type;
        row.luVendorCode = null;
        this.rowVendorList[i] = list;
        if (type === 'XX5' || type === 'XX9') {
          row.rateType = null;
          row.newRate = 0;
        } else {
          row.newRate = 0;
        }
      });
    }, 'U');
  }

  onHeaderVendorChange(event: any) {
    const vendorCode = event?.value || event?.vendor_Code || event;
    this.headerVendor = vendorCode;

    if (!vendorCode) {
      this.listVSFUM.forEach(row => {
        row.luVendorCode = null;
      });
      return;
    }

    this.listVSFUM.forEach(row => {
      row.luVendorCode = vendorCode;
      if (row.luVendorTyp === 'XX5' || row.luVendorTyp === 'XX9') {
        const data = {
          loadUnloadType: 'U',
          vendorCode: vendorCode.toString(),
          typeModule: this.docketService.loginUserList?.Type === "2" ? "P" : "D",
          chargeType: row.rateType || '',
          brdc: this.docketService.loginUserList?.LocationCode,
          loadingBy: row.luVendorTyp,
        };

        this.thcMasterService.getLoadingCharge(data).subscribe({
          next: (response: any) => {
            if (response) {
              if (response.isMonthly) {
                row.rateType = response.rateType;
                row.newRate = response.rate;
              } else if (response.rate !== undefined && response.rate > 0) {
                row.rateType = response.rateType;
                row.newRate = response.rate;
              }
              this.validateRate(row);
            }
          },
          error: (err: any) => {
            console.error('Error fetching loading charge for header vendor:', err);
          }
        });
      }
    });
  }

  onHeaderRateTypeChange(event: any) {
    const rateType = event?.codeId || event;
    this.headerRateType = rateType;
    this.listVSFUM.forEach(row => {
      if (row.luVendorTyp !== 'XX5' && row.luVendorTyp !== 'XX9') {
        row.rateType = rateType;
        this.validateRate(row);
      }
    });
  }

  onRowVendorTypeChange(event: any, index: number) {
    const row = this.listVSFUM[index];
    if (!row) return;
    const codeId = event?.codeId || event;
    row.luVendorTyp = codeId;
    row.luVendorCode = null;

    if (codeId === 'XX5' || codeId === 'XX9') {
      row.rateType = null;
      row.newRate = 0;
    }
    this.validateRate(row);

    if (!codeId) {
      this.rowVendorList[index] = [];
      return;
    }

    this.vendorChargeHelper.fetchVendorListFor(codeId.toString(), (list: any[]) => {
      this.rowVendorList[index] = list;
    }, 'U');
  }

  onRowVendorCodeChange(event: any, index: number) {
    const row = this.listVSFUM[index];
    if (!row) return;
    const vendorCode = event?.value || event?.vendor_Code || event;
    row.luVendorCode = vendorCode;

    if (!vendorCode) return;

    if (row.luVendorTyp === 'XX5' || row.luVendorTyp === 'XX9') {
      const data = {
        loadUnloadType: 'U',
        vendorCode: vendorCode.toString(),
        typeModule: this.docketService.loginUserList?.Type === "2" ? "P" : "D",
        chargeType: row.rateType || '',
        brdc: this.docketService.loginUserList?.LocationCode,
        loadingBy: row.luVendorTyp,
      };

      this.thcMasterService.getLoadingCharge(data).subscribe({
        next: (response: any) => {
          if (response) {
            if (response.isMonthly) {
              row.rateType = response.rateType;
              row.newRate = response.rate;
            } else if (response.rate !== undefined && response.rate > 0) {
              row.rateType = response.rateType;
              row.newRate = response.rate;
            }
            this.validateRate(row);
          }
        },
        error: (err: any) => {
          console.error('Error fetching loading charge:', err);
        }
      });
    }
  }

  clearNewRateOnFocus(index: number) {
    const row = this.listVSFUM[index];
    if (row && parseFloat(row.newRate || 0) === 0) {
      row.newRate = '';
    }
  }

  resetNewRateOnBlur(index: number) {
    const row = this.listVSFUM[index];
    if (row) {
      if (row.newRate === '' || row.newRate === null || row.newRate === undefined) {
        row.newRate = '0.00';
      }
      this.validateRate(row);
    }
  }

  onRowRateTypeChange(row: any) {
    if (row) {
      this.validateRate(row);
    }
  }

  validateRate(row: any): boolean {
    if (!row) return true;
    const vendorType = row.luVendorTyp;
    if (vendorType === 'XX9') {
      row.rateError = '';
      return true;
    }
    const rateType = row.rateType?.toString();
    const rate = parseFloat(row.newRate || '0') || 0;
    const chrgwt = parseFloat(row.actuwt || '0') || 0;
    const noofpkg = parseFloat(row.pkgsno || '0') || 0;

    if (chrgwt === 0) {
      row.rateError = 'Charge weight is zero, cannot validate rate.';
      row.newRate = '0.00';
      return false;
    }

    let maxlimitcalculation = 0;
    if (rateType === '4') {
      maxlimitcalculation = rate / chrgwt;
    } else if (rateType === '3') {
      maxlimitcalculation = (rate * noofpkg) / chrgwt;
    } else {
      maxlimitcalculation = rate;
    }

    if (maxlimitcalculation > 5.0) {
      row.rateError = 'Rate Amount Is High, Please Check';
      row.newRate = '0.00';
      return false;
    } else {
      row.rateError = '';
      return true;
    }
  }

  submitStockUpdate() {
    this.submitted = true;
    if (!this.unloaderName || !this.unloadingSupervisor) {
      return;
    }

    const selectedRows = this.listVSFUM.filter(row => row.isSelected === true);
    if (selectedRows.length === 0) {
      this.sweetAlertService.warning('Please select at least one docket to update.');
      return;
    }

    const invalidPkgs = selectedRows.find(row => +row.pkgsno > +row.bkG_PKGSNO);
    if (invalidPkgs) {
      this.sweetAlertService.warning(`Arrived Pkgs cannot be greater than Total Pkgs (${invalidPkgs.bkG_PKGSNO}) for Docket No ${invalidPkgs.dockNo || invalidPkgs.tcno}.`);
      return;
    }

    const missingDeps = selectedRows.find(row => row.isDamage && !row.depsData);
    if (missingDeps) {
      this.sweetAlertService.warning(`Please enter DEPS details for Docket No ${missingDeps.dockNo}`);
      return;
    }

    const missingPod = selectedRows.find(row => this.isDeliveryOnArrival(row) && (!row.frontFiles || row.frontFiles.length === 0));
    if (missingPod) {
      this.sweetAlertService.warning(`Please upload POD Front file for Docket No ${missingPod.dockNo} (Delivery On Arrival).`);
      return;
    }

    const missingVendor = selectedRows.find(row => row.luVendorTyp && row.luVendorTyp !== 'XX9' && (!row.luVendorCode || !row.rateType));
    if (missingVendor) {
      this.sweetAlertService.warning(`Please select Vendor and Rate Type for Docket No ${missingVendor.dockNo || missingVendor.tcno}`);
      return;
    }

    const invalidRate = selectedRows.find(row => !this.validateRate(row) || row.rateError);
    if (invalidRate) {
      this.sweetAlertService.warning(invalidRate.rateError || `Invalid rate for Docket No ${invalidRate.dockNo || invalidRate.tcno}`);
      return;
    }

    const isoUpdateDate = this.getIsoDateString(this.stockData?.updateDate);

    const stockUpdateListPayload = selectedRows.map(row => {
      const depsData = row.depsData || {};
      const depsDet = {
        depsfile: depsData.depsfile || '',
        docket: depsData.docket || '',
        affectedQty: +depsData.affectedQty || 0,
        affectedInvVal: +depsData.affectedInvVal || 0,
        reason: depsData.reason  || '',
        depsNo: depsData.depsNo || '',
        depsTyp: depsData.depsTyp || '',
        fileName: depsData.fileName || '',
        damageType: depsData.damageType || '',
        affectedWeight: +depsData.affectedWeight || 0,
        invval: +depsData.invval || 0,
        totWeight: +depsData.totWeight || 0,
        remarks: depsData.remarks || '',
        docketsf: depsData.docketsf || '.',
        documentNo: depsData.documentNo || '',
        pkgsDelivered: +depsData.pkgsDelivered  || 0,
        severity: depsData.severity|| ''
      };

      const rowDelyDate = row.delyForm?.get('DELYDATE')?.value;
      const formattedDelyDate = rowDelyDate ? this.getIsoDateString(typeof rowDelyDate === 'string' ? rowDelyDate : rowDelyDate.toString()) : isoUpdateDate;

      return {
        actuwt: row.actuwt || 0,
        hccAmt: row.hccAmt || 0,
        newRate: parseFloat(row.newRate) || 0,
        isCODDODChar: row.isCODDODChar || '',
        coddod: row.coddod || '',
        cdelydt: this.isDeliveryOnArrival(row) && rowDelyDate ? formattedDelyDate : (row.cdelydt || ''),
        bkG_ACTUWT: row.bkG_ACTUWT || 0,
        ac: row.ac || row.condition || '',
        isPartStockUpdate: row.isSelected === true || row.isPartStockUpdate || true,
        dockdt: row.dockdt || '',
        delyperson: row.delyperson || '',
        isCounterDelivery: row.isCounterDelivery || false,
        dockSF: row.dockSF || row.docketsf || '.',
        pkgsno: +row.pkgsno || row.pkgsno || 0,
        coddodcollected: row.coddodcollected || 0,
        bkG_PKGSNO: row.bkG_PKGSNO || 0,
        unLoadingSupervisor: this.unloadingSupervisor || row.unLoadingSupervisor || '',
        dp: this.isEligibleForDeliveryProcess(row) ? (row.dp || '') : '',
        depsDet: depsDet,
        tcno: row.tcno || '',
        thcno: this.stockData?.thcno || row.thcno || '',
        autoNo: row.autoNo || 0,
        delyreason: row.delyreason || '',
        wi: row.wi || row.warehouse || '',
        isAllgood: !row.isDamage,
        dockNo: row.dockNo || '',
        isCheckRemarks: row.isCheckRemarks || '',
        updateDate: isoUpdateDate,
        unLoaderName: this.unloaderName || row.unLoaderName || '',
        coddodAmount: row.coddodAmount || 0,
        rateType: row.rateType || row.ratetype || '',
        luVendorTyp: row.luVendorTyp || '',
        chargedBy: row.luVendorTyp || '',
        delydate: this.isDeliveryOnArrival(row) && rowDelyDate ? formattedDelyDate : isoUpdateDate,
        thC_NextLoc: this.docketService.Location || this.docketService.loginUserList?.LocationCode || row.thC_NextLoc || '',
        luVendorCode: row.luVendorCode || '',
        vendorCode: row.luVendorCode || '',
        depsId: row.depsData?.depsId || row.depsId || ''
      };
    });

    const formData = new FormData();
    formData.append("ViewModel.VSFUM.THCNO", this.stockData?.thcno || '');
    formData.append("ViewModel.VSFUM.THC_NextLoc", this.docketService.Location || this.docketService.loginUserList?.LocationCode || '');
    formData.append("ViewModel.VSFUM.UpdateDate", isoUpdateDate);
    formData.append("ViewModel.VSFUM.DepsId", selectedRows[0]?.depsData?.depsId || selectedRows[0]?.depsId || '');
    formData.append("ViewModel.VSFUM.ISCheckRemarks", 'ddfg');
    formData.append("ViewModel.VSFUM.UnLoadingSupervisor", this.unloadingSupervisor || '');
    formData.append("ViewModel.VSFUM.UnLoaderName", this.unloaderName || '');
    formData.append("BaseUserName", this.docketService.loginUserList?.BaseUserName || this.docketService.loginUserList?.UserId || '');
    formData.append("BaseFinYear", this.docketService.loginUserList?.FinYear || '');

    formData.append("StockUpdateList", JSON.stringify(stockUpdateListPayload));

    selectedRows.forEach((row, index) => {
      if (row.frontFiles && row.frontFiles.length > 0) {
        row.frontFiles.forEach((file: File, i: number) => {
          formData.append("PodFrontFiles", file, `${row.dockNo || row.docketNo}_POD_FRONT_${index}_${i}_${file.name}`);
        });
      } else if (row.frontFile) {
        formData.append("PodFrontFiles", row.frontFile, `${row.dockNo || row.docketNo}_POD_FRONT_${index}_${row.frontFile.name}`);
      }

      if (row.backFiles && row.backFiles.length > 0) {
        row.backFiles.forEach((file: File, i: number) => {
          formData.append("PodBackFiles", file, `${row.dockNo || row.docketNo}_POD_BACK_${index}_${i}_${file.name}`);
        });
      } else if (row.backFile) {
        formData.append("PodBackFiles", row.backFile, `${row.dockNo || row.docketNo}_POD_BACK_${index}_${row.backFile.name}`);
      }
    });

    console.log('Final FormData Payload:', stockUpdateListPayload);
    this.isLoading = true;
    this.stockUpdateService.onStockupdate(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.sweetAlertService.success(`Stock Update Success for THC No: ${this.stockData.thcno}`);
          this.dataEmitter.emit();
          this.modalRef?.hide();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.sweetAlertService.error(err?.error?.message || 'Error submitting stock update details.');
      }
    });
  }

  base64ToFile(base64Str: string, fileName: string): File | null {
    if (!base64Str) return null;
    const byteString = atob(base64Str);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab]);
    return new File([blob], fileName);
  }
}

