import { Component, TemplateRef, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { DocketService } from 'app/shared/services/docket.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { DrsUpdateDepsComponent } from 'app/components/drs-generation-list/drs-update-list/drs-update-deps/drs-update-deps.component';

@Component({
  selector: 'app-new-stockupdate-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, DrsUpdateDepsComponent],
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
  public dlyPrcList: any[] = [];
  public listVSFUM: any[] = [];
  public selectedDeliveryProcessAll: string | null = null;
  public unloaderUsers: any[] = [];
  public notUnloaderName: string = 'Enter at least 3 characters';
  public unloaderName: any = null;
  public unloadingSupervisor: any = null;

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
    private docketService: DocketService
  ) {}

  ngOnInit() {
    this.getDeliveryProcesses();
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
    this.unloaderUsers = [];
    this.notUnloaderName = 'Enter at least 3 characters';
    this.isLoading = true;

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
          this.listVSFUM.forEach(item => {
            if (item.arrPkgQty === undefined || item.arrPkgQty === null) {
              item.arrPkgQty = item.bkG_PKGSNO || 0;
            }
            item.dp = item.dp || null;
            item.isDamage = item.isDamage || false;
            item.isSelected = false;
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching stock update details:', err);
      }
    });
  }

  setAllDeliveryProcess() {
    if (this.listVSFUM && this.listVSFUM.length > 0) {
      this.listVSFUM.forEach(item => {
        item.dp = this.selectedDeliveryProcessAll;
      });
    }
  }

  get totalPkgs(): number {
    return this.listVSFUM.reduce((sum, item) => sum + (item.bkG_PKGSNO || 0), 0);
  }

  get totalArrivedPkgs(): number {
    return this.listVSFUM.reduce((sum, item) => sum + (+item.arrPkgQty || 0), 0);
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

  submitStockUpdate() {
    if (!this.unloaderName) {
      alert('Please select Unloader Name');
      return;
    }
    if (!this.unloadingSupervisor) {
      alert('Please select Un Loading Supervisor');
      return;
    }

    const selectedRows = this.listVSFUM.filter(row => row.isSelected === true);
    if (selectedRows.length === 0) {
      alert('Please select at least one docket to update.');
      return;
    }

    const missingDeps = selectedRows.find(row => row.isDamage && !row.depsData);
    if (missingDeps) {
      alert(`Please enter DEPS details for Docket No ${missingDeps.dockNo}`);
      return;
    }

    const payload = selectedRows.map(row => {
      const deps = row.depsData || {};
      const isShort = row.isDamage && deps.depsTyp === 'S';
      const isDmg = row.isDamage && deps.depsTyp === 'D';
      return {
        invvalue: row.invvalue || 0,
        actuwt: row.actuwt || 0,
        bkG_ACTUWT: row.bkG_ACTUWT || 0,
        isPartStockUpdate: true,
        dockdt: row.dockdt,
        cdelydt: row.cdelydt,
        tcno: row.tcno,
        dockNo: row.dockNo,
        orgncd: row.orgncd,
        desT_CD: row.desT_CD,
        bizType: row.bizType || '',
        service_Class: row.service_Class,
        pkgsno: row.pkgsno,
        bkG_PKGSNO: row.bkG_PKGSNO,
        arrPkgQty: row.arrPkgQty || 0,
        actarrv_dt: row.actarrv_dt,
        isShort: isShort,
        shortageQty: isShort ? deps.affectedQty : 0,
        shortageWeight: isShort ? deps.affectedWeight : 0,
        shortageReason: isShort ? deps.remarks : '',
        shortageRemarks: isShort ? deps.remarks : '',
        shortFileName: (isShort && deps.fileName) ? `${row.dockNo}_SHORT_${deps.fileName}` : null,
        isPilferage: false,
        pilferageQty: 0,
        pilferageWeight: 0,
        pilferageReason: '',
        pilferageRemarks: '',
        pilferageFileName: null,
        isDamage: isDmg,
        damageQry: isDmg ? deps.affectedQty : 0,
        damageWeight: isDmg ? deps.affectedWeight : 0,
        damageReason: isDmg ? deps.remarks : '',
        damageType: isDmg ? deps.damageType : '',
        severity: isDmg ? deps.severity : '',
        damageFileName: (isDmg && deps.fileName) ? `${row.dockNo}_DAMAGE_${deps.fileName}` : null,
        delPkgQty: row.delPkgQty || 0,
        delydate: this.stockData.updateDate,
        delytime: this.stockData.updateDate,
        isFTLDelivery: row.isFTLDelivery || false,
        isAllgood: row.isAllgood || false,
        updateDate: new Date(),
        isMobileUser: 'N',
        ac: row.condition || '',
        wi: row.warehouse || '',
        dp: row.dp || '',
        dockSF: row.dockSF || '.',
        chargedBy: '',
        luVendorTyp: '',
        luVendorCode: '',
        vendorCode: '',
        rateType: '',
        newRate: 0,
        hccAmt: 0
      };
    });

    const formData = new FormData();
    formData.append("ViewModel.VSFUM.CDELYDT", this.stockData.cdelydt || '');
    formData.append("ViewModel.VSFUM.PKGSNO", this.stockData.pkgsno || 0);
    formData.append("ViewModel.VSFUM.DockSF", this.stockData.dockSF || '.');
    formData.append("ViewModel.VSFUM.BKG_PKGSNO", this.stockData.bkG_PKGSNO || 0);
    formData.append("ViewModel.VSFUM.CODDOD", this.stockData.coddod || 'N');
    formData.append("ViewModel.VSFUM.CODDODAmount", this.stockData.coddodAmount || 0);
    formData.append("ViewModel.VSFUM.ACTUWT", this.stockData.actuwt || 0);
    formData.append("ViewModel.VSFUM.BKG_ACTUWT", this.stockData.bkG_ACTUWT || 0);
    formData.append("ViewModel.VSFUM.TCNO", this.stockData.tcno || '');
    formData.append("ViewModel.VSFUM.DockNo", this.stockData.dockNo || '');
    formData.append("ViewModel.VSFUM.DOCKDT", this.stockData.dockdt || '');
    formData.append("ViewModel.VSFUM.CODDODCOLLECTED", this.stockData.coddodcollected || 0);
    formData.append("ViewModel.VSFUM.ShortageQty", this.stockData.shortageQty || 0);
    formData.append("ViewModel.VSFUM.PilferageQty", this.stockData.pilferageQty || 0);
    formData.append("ViewModel.VSFUM.PilferageWeight", this.stockData.pilferageWeight || 0);
    formData.append("ViewModel.VSFUM.ShortageWeight", this.stockData.shortageWeight || 0);
    formData.append("ViewModel.VSFUM.IsCODDODChar", this.stockData.isCODDODChar || 'N');

    formData.append("ViewModel.VSFUM.AC", '1');
    formData.append("ViewModel.VSFUM.WI", '');
    formData.append("ViewModel.VSFUM.DP", this.selectedDeliveryProcessAll || '');
    formData.append("ViewModel.VSFUM.DELYREASON", '');
    formData.append("ViewModel.VSFUM.DELYPERSON", '');
    formData.append("ViewModel.VSFUM.ShortageReason", '');
    formData.append("ViewModel.VSFUM.ShortageRemarks", '');
    formData.append("ViewModel.VSFUM.PilferageReason", '');
    formData.append("ViewModel.VSFUM.PilferageRemarks", '');
    formData.append("ViewModel.VSFUM.DamageReason", '');
    formData.append("ViewModel.VSFUM.DamageRemarks", '');
    formData.append("ViewModel.VSFUM.DamageFileName", '');
    formData.append("ViewModel.VSFUM.PilferageFileName", '');
    formData.append("ViewModel.VSFUM.ShortFileName", '');
    formData.append("ViewModel.VSFUM.DamageType", '');
    formData.append("ViewModel.VSFUM.Severity", '');

    formData.append("ViewModel.VSFUM.DamageQry", this.stockData.damageQry || 0);
    formData.append("ViewModel.VSFUM.DamageWeight", this.stockData.damageWeight || 0);
    formData.append("ViewModel.VSFUM.ISCounterDelivery", 'false');
    formData.append("ViewModel.VSFUM.IsPartStockUpdate", 'true');
    formData.append("ViewModel.VSFUM.AutoNo", '0');
    formData.append("ViewModel.VSFUM.DELYDATE", this.stockData.updateDate || '');
    formData.append("ViewModel.VSFUM.THCNO", this.stockData.thcno || '');
    formData.append("ViewModel.VSFUM.THC_NextLoc", this.docketService.loginUserList?.LocationCode || 'BWH');
    formData.append("ViewModel.VSFUM.UnLoadingSupervisor", this.unloadingSupervisor || '');
    formData.append("ViewModel.VSFUM.UnLoaderName", this.unloaderName || '');
    formData.append("ViewModel.VSFUM.UpdateDate", this.stockData.updateDate || '');
    formData.append("ViewModel.VSFUM.IsAllgood", 'false');
    formData.append("ViewModel.VSFUM.ISCheckRemarks", '');
    formData.append("BaseUserName", this.docketService.loginUserList?.BaseUserName || '');
    formData.append("BaseFinYear", this.docketService.loginUserList?.FinYear || '');

    const depsDataList: any[] = [];
    selectedRows.forEach(row => {
      if (row.isDamage && row.depsData) {
        const d = {
          ...row.depsData,
          documentNo: this.stockData.thcno || ''
        };
        depsDataList.push(d);
      }
    });

    formData.append("StockUpdateList", JSON.stringify(payload));
    formData.append("depsData", JSON.stringify(depsDataList));

    selectedRows.forEach((row, idx) => {
      if (row.isDamage && row.depsData && row.depsData.depsfile) {
        const deps = row.depsData;
        try {
          const file = this.base64ToFile(deps.depsfile, deps.fileName);
          if (file) {
            if (deps.depsTyp === 'S') {
              formData.append("ShortFiles", file, `${row.dockNo}_SHORT_${deps.fileName}`);
            } else if (deps.depsTyp === 'D') {
              formData.append("DamageFiles", file, `${row.dockNo}_DAMAGE_${deps.fileName}`);
            }
          }
        } catch (e) {
          console.error('Error converting base64 to file', e);
        }
      }
    });

    this.isLoading = true;
    this.stockUpdateService.onStockupdate(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          alert(`Stock Update Success for THC No: ${this.stockData.thcno}`);
          this.dataEmitter.emit();
          this.modalRef?.hide();
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert(err?.error?.message || 'Error submitting stock update details.');
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

