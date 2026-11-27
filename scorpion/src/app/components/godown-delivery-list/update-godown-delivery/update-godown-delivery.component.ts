import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { DeliveryUpdateService } from 'app/shared/services/delivery-update.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { GodownUpdateDepsComponent } from '../godown-update-deps/godown-update-deps.component';

@Component({
  selector: 'app-update-godown-delivery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BsDatepickerModule,
    NgSelectModule,
    GodownUpdateDepsComponent
  ],
  templateUrl: './update-godown-delivery.component.html',
  styleUrl: './update-godown-delivery.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class UpdateGodownDeliveryComponent implements OnInit {
  @Output() deliveryUpdated = new EventEmitter<any>();
  @ViewChild('GodownUpdateDepsComponent') depsModalComponent!: GodownUpdateDepsComponent;

  public showModal: boolean = false;
  public selectedDockets: any[] = [];

  public isSubmitted: boolean = false;
  public isSubmit: boolean = false;
  public validationErrors: { lrNo: string; messages: string[] }[] = [];

  public bulkUpdate: any = {
    deliveredTo: null,
    personName: '',
    contactNo: '',
    deliveryDate: new Date(),
    podReceived: '',
    isContactTouched: false
  };

  public podReceivedList: any[] = [
    { value: '', label: 'Select' },
    { value: 'Y', label: 'Yes' },
    { value: 'N', label: 'No' }
  ];

  public podQualityList: any[] = [
    { value: '', label: 'Select' },
    { value: 'Good', label: 'Good' },
    { value: 'Bad', label: 'Bad' }
  ];

  public maxDate: Date = new Date();

  public datePickerConfig: any = {
    dateInputFormat: 'DD-MMM-YYYY',
    containerClass: 'theme-dark-blue',
    showWeekNumbers: false,
    adaptivePosition: true
  };

  constructor(
    public docketService: DocketService,
    public generalMasterService: GeneralMasterService,
    public deliveryUpdateService: DeliveryUpdateService,
    public sweetAlertService: SweetAlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.generalMasterService.getDeliveredToData();
    this.generalMasterService.getPartDeliveredReason();
  }

  showPopup(dockets: any[]) {
    if (!this.generalMasterService.deliveredToData || this.generalMasterService.deliveredToData.length === 0) {
      this.generalMasterService.getDeliveredToData();
    }
    if (!this.generalMasterService.partDeliveredReasonData || this.generalMasterService.partDeliveredReasonData.length === 0) {
      this.generalMasterService.getPartDeliveredReason();
    }

    this.isSubmitted = false;
    this.validationErrors = [];

    this.selectedDockets = JSON.parse(JSON.stringify(dockets || []));

    const today = new Date();
    this.selectedDockets.forEach(row => {
      const maxPkgs = Number(row.DelPkgs !== undefined ? row.DelPkgs : (row.Pkgs !== undefined ? row.Pkgs : (row.pkgsno || 0)));
      const maxWt = Number(row.DelWts !== undefined ? row.DelWts : (row.ActualWt !== undefined ? row.ActualWt : (row.weight || 0)));

      row.maxPkgs = maxPkgs;
      row.maxWt = maxWt;
      row.totalPkgs = maxPkgs;
      row.totalWt = maxWt;

      // Default deliveredPkgs to DelPkgs (or total docket packages) if not set or <= 0
      row.deliveredPkgs = (row.deliveredPkgs !== undefined && Number(row.deliveredPkgs) > 0) ? Number(row.deliveredPkgs) : maxPkgs;
      row.deliveredWt = (row.deliveredWt !== undefined && Number(row.deliveredWt) > 0) ? Number(row.deliveredWt) : maxWt;
      row.partDeliveredReason = (row.deliveredPkgs < maxPkgs && row.partDeliveredReason && row.partDeliveredReason !== 'N/A') ? row.partDeliveredReason : null;
      row.deliveredTo = row.deliveredTo || null;
      row.personName = row.personName || '';
      row.contactNo = (row.contactNo || '').toString().replace(/[^0-9]/g, '').slice(0, 10);
      row.isContactTouched = false;
      row.deliveryDate = row.deliveryDate ? new Date(row.deliveryDate) : today;

      if (row.DRSDate) {
        row.minDeliveryDate = new Date(row.DRSDate);
      } else if (row.LRDate) {
        row.minDeliveryDate = new Date(row.LRDate);
      }
      row.podReceived = row.podReceived || '';
      row.podQuality = row.podQuality || '';
      row.podFile1 = row.podFile1 || null;
      row.podFile2 = row.podFile2 || null;
    });

    this.bulkUpdate = {
      deliveredTo: null,
      personName: '',
      contactNo: '',
      deliveryDate: today,
      podReceived: '',
      isContactTouched: false
    };

    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
  }

  onlyNumbers(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onContactInput(event: any, target: any) {
    const rawVal = event.target.value || '';
    const cleanVal = rawVal.replace(/[^0-9]/g, '').slice(0, 10);
    target.contactNo = cleanVal;
    event.target.value = cleanVal;
    if (cleanVal.length === 10) {
      target.isContactTouched = true;
    }
  }

  isContactInvalid(target: any, isBulk: boolean = false): boolean {
    if (!target) return false;
    const val = (target.contactNo || '').toString().trim();
    if (isBulk) {
      return val.length > 0 && val.length < 10;
    }
    if (target.isContactTouched || this.isSubmitted) {
      return val.length !== 10;
    }
    return false;
  }

  onDeliveredPkgsChange(row: any) {
    const maxPkgs = Number(row.maxPkgs !== undefined ? row.maxPkgs : (row.DelPkgs !== undefined ? row.DelPkgs : (row.totalPkgs || row.Pkgs || 0)));
    const maxWt = Number(row.maxWt !== undefined ? row.maxWt : (row.DelWts !== undefined ? row.DelWts : (row.totalWt || row.ActualWt || 0)));
    const pkgs = Number(row.deliveredPkgs);

    if (isNaN(pkgs) || pkgs <= 0) {
      row.deliveredWt = 0;
      row.partDeliveredReason = null;
    } else if (pkgs >= maxPkgs) {
      row.deliveredWt = maxWt;
      row.partDeliveredReason = null;
    } else {
      row.deliveredWt = maxPkgs > 0 ? parseFloat(((maxWt * pkgs) / maxPkgs).toFixed(2)) : 0;
      if (row.partDeliveredReason === 'N/A') {
        row.partDeliveredReason = null;
      }
    }

    if (this.isSubmitted) {
      this.validateDockets();
    }
  }

  onDeliveredWtChange(row: any) {
    if (this.isSubmitted) {
      this.validateDockets();
    }
  }

  getPkgsError(row: any): string {
    const maxPkgs = Number(row.maxPkgs !== undefined ? row.maxPkgs : (row.DelPkgs !== undefined ? row.DelPkgs : (row.totalPkgs || row.Pkgs || 0)));
    const val = row.deliveredPkgs;
    if (val === '' || val === null || val === undefined || Number(val) <= 0 || isNaN(Number(val))) {
      return 'Cannot be 0';
    }
    if (maxPkgs > 0 && Number(val) > maxPkgs) {
      return `Max ${maxPkgs}`;
    }
    return '';
  }

  isDeliveredPkgsInvalid(row: any): boolean {
    return this.getPkgsError(row) !== '';
  }

  getWtError(row: any): string {
    const maxWt = Number(row.maxWt !== undefined ? row.maxWt : (row.DelWts !== undefined ? row.DelWts : (row.totalWt || row.ActualWt || 0)));
    const val = row.deliveredWt;
    if (val === '' || val === null || val === undefined || Number(val) <= 0 || isNaN(Number(val))) {
      return 'Cannot be 0';
    }
    if (maxWt > 0 && Number(val) > maxWt) {
      return `Max ${maxWt}`;
    }
    return '';
  }

  isDeliveredWtInvalid(row: any): boolean {
    return this.getWtError(row) !== '';
  }

  isReasonInvalid(row: any): boolean {
    const maxPkgs = Number(row.maxPkgs !== undefined ? row.maxPkgs : (row.DelPkgs !== undefined ? row.DelPkgs : (row.totalPkgs || row.Pkgs || 0)));
    const pkgs = Number(row.deliveredPkgs);
    return !isNaN(pkgs) && pkgs > 0 && pkgs < maxPkgs && (!row.partDeliveredReason || row.partDeliveredReason === 'N/A');
  }

  isDeliveredToInvalid(row: any): boolean {
    return !row.deliveredTo || row.deliveredTo === '';
  }

  isPersonNameInvalid(row: any): boolean {
    return !row.personName || row.personName.trim() === '';
  }

  isPodReceivedInvalid(row: any): boolean {
    return !row.podReceived || row.podReceived === '';
  }

  isPodUploadInvalid(row: any): boolean {
    return (row.podReceived === 'Y' || row.podReceived === 'Yes') && !row.podFile1;
  }

  isPodQualityInvalid(row: any): boolean {
    return (row.podReceived === 'Y' || row.podReceived === 'Yes') && (!row.podQuality || row.podQuality === '');
  }

  validateDockets(): boolean {
    this.validationErrors = [];

    this.selectedDockets.forEach(row => {
      const lrNo = row.LRNumber || row.dockno || 'Docket';
      const messages: string[] = [];
      const maxPkgs = Number(row.maxPkgs !== undefined ? row.maxPkgs : (row.DelPkgs !== undefined ? row.DelPkgs : (row.totalPkgs || row.Pkgs || 0)));
      const maxWt = Number(row.maxWt !== undefined ? row.maxWt : (row.DelWts !== undefined ? row.DelWts : (row.totalWt || row.ActualWt || 0)));
      const deliveredPkgs = Number(row.deliveredPkgs);
      const deliveredWt = Number(row.deliveredWt);

      // 1. Delivered Pkgs
      const pkgsErr = this.getPkgsError(row);
      if (pkgsErr) {
        messages.push(`"Delivered Pkgs" ${pkgsErr.toLowerCase()}`);
      }

      // 1b. Delivered Wt
      const wtErr = this.getWtError(row);
      if (wtErr) {
        messages.push(`"Delivered Wt" ${wtErr.toLowerCase()}`);
      }

      // 2. Part Delivered Reason
      if (!isNaN(deliveredPkgs) && deliveredPkgs > 0 && deliveredPkgs < maxPkgs) {
        if (!row.partDeliveredReason || row.partDeliveredReason === 'N/A') {
          messages.push(`"Part Delivered Reason" is mandatory when delivered pkgs is less than total pkgs`);
        }
      }

      // 3. Delivered To
      if (!row.deliveredTo || row.deliveredTo === '') {
        messages.push(`"Delivered To" selection is mandatory`);
      }

      // 4. Person Name
      if (!row.personName || row.personName.trim() === '') {
        messages.push(`"Person Name" is mandatory`);
      }

      // 5. Contact No
      const contact = (row.contactNo || '').toString().trim();
      if (!contact || contact.length !== 10) {
        messages.push(`"Contact No" must be a valid 10-digit mobile number`);
      }

      // 6. POD Received
      if (!row.podReceived || row.podReceived === '') {
        messages.push(`"POD Received" selection is mandatory`);
      } else if (row.podReceived === 'Y' || row.podReceived === 'Yes') {
        if (!row.podFile1) {
          messages.push(`"POD Upload 1" is mandatory`);
        }
        if (!row.podQuality || row.podQuality === '') {
          messages.push(`"POD Quality" selection is mandatory`);
        } else if (row.podQuality === 'Bad') {
          if (!row.depsData || (Array.isArray(row.depsData) && row.depsData.length === 0)) {
            messages.push(`"DEPS Entry" details are required when POD Quality is Bad`);
          }
        }
      }

      if (messages.length > 0) {
        this.validationErrors.push({ lrNo, messages });
      }
    });

    return this.validationErrors.length === 0;
  }

  setPodReceived(target: any, val: string) {
    target.podReceived = val;
    this.onPodReceivedChange(target);
  }

  setPodQuality(row: any, val: string) {
    row.podQuality = val;
    if (val === 'Bad') {
      this.openDepsPopup(row);
    } else {
      row.depsData = null;
    }
    if (this.isSubmitted) {
      this.validateDockets();
    }
  }

  openDepsPopup(row: any) {
    if (this.depsModalComponent) {
      this.depsModalComponent.openModal(row);
    }
  }

  onDepsSaved(event: any) {
    if (event && event.docket) {
      event.docket.podQuality = 'Bad';
      event.docket.depsData = event.depsData || event.depsRows;
    }
    if (this.isSubmitted) {
      this.validateDockets();
    }
  }

  onDepsCancelled(event: { docket: any; hasExisting: boolean }) {
    if (event && event.docket && !event.hasExisting) {
      event.docket.podQuality = '';
    }
    if (this.isSubmitted) {
      this.validateDockets();
    }
  }

  getDepsSummary(row: any): string {
    if (!row.depsData) return '';
    const list = Array.isArray(row.depsData) ? row.depsData : [row.depsData];
    const types = list.map((d: any) => {
      const t = d.depsTyp || d.depstype || d.depsType || '';
      return (t === 'D' || t === 'Damage') ? 'Damage' : 'Shortage';
    });
    const unique = Array.from(new Set(types));
    return unique.join(' + ') || 'Bad';
  }

  onPodReceivedChange(row: any) {
    if (row.podReceived !== 'Y' && row.podReceived !== 'Yes') {
      row.podQuality = '';
      row.podFile1 = null;
      row.podFile2 = null;
    }
    if (this.isSubmitted) {
      this.validateDockets();
    }
  }

  onFileChange(event: any, row: any, fileIndex: number) {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    if (fileIndex === 1) {
      row.podFile1 = file;
    } else if (fileIndex === 2) {
      row.podFile2 = file;
    }
    if (this.isSubmitted) {
      this.validateDockets();
    }
  }

  applyBulkToAll() {
    this.selectedDockets.forEach(row => {
      if (this.bulkUpdate.deliveredTo !== null && this.bulkUpdate.deliveredTo !== undefined && this.bulkUpdate.deliveredTo !== '') {
        row.deliveredTo = this.bulkUpdate.deliveredTo;
      }
      if (this.bulkUpdate.personName !== null && this.bulkUpdate.personName !== undefined && this.bulkUpdate.personName !== '') {
        row.personName = this.bulkUpdate.personName;
      }
      if (this.bulkUpdate.contactNo) {
        row.contactNo = this.bulkUpdate.contactNo;
        row.isContactTouched = true;
      }
      if (this.bulkUpdate.deliveryDate) {
        row.deliveryDate = new Date(this.bulkUpdate.deliveryDate);
      }
      if (this.bulkUpdate.podReceived !== null && this.bulkUpdate.podReceived !== undefined && this.bulkUpdate.podReceived !== '') {
        row.podReceived = this.bulkUpdate.podReceived;
        if (row.podReceived !== 'Y' && row.podReceived !== 'Yes') {
          row.podQuality = '';
          row.podFile1 = null;
          row.podFile2 = null;
        }
      }
    });

    // Reassign array to trigger Angular Change Detection across all rows
    this.selectedDockets = [...this.selectedDockets];
    this.cdr.detectChanges();

    if (this.isSubmitted) {
      this.validateDockets();
    }
  }

  formatDeliveryDate(dateVal: any): string {
    if (!dateVal) return new Date().toISOString();
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    const now = new Date();
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();

    if (hours === 0 && minutes === 0 && seconds === 0) {
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
    }

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    return `${year}-${month}-${day}T${hStr}:${mStr}:${sStr}.000Z`;
  }

  removeDocket(index: number) {
    if (this.selectedDockets.length > 1) {
      this.selectedDockets.splice(index, 1);
      this.selectedDockets = [...this.selectedDockets];
      if (this.isSubmitted) {
        this.validateDockets();
      }
    }
  }

  submitGodownDelivery() {
    this.isSubmitted = true;
    if (!this.validateDockets()) {
      return;
    }

    const DocketsUpdateList = this.selectedDockets.map((row: any) => {
      const penDelPkgs = row.Pen_DelPkgs !== undefined ? Number(row.Pen_DelPkgs) :
                        (row.pen_DelPkgs !== undefined ? Number(row.pen_DelPkgs) :
                        (Number(row.maxPkgs || row.Pkgs || 0) - Number(row.deliveredPkgs || 0)));
      const penDelWts = row.Pen_DelWts !== undefined ? Number(row.Pen_DelWts) :
                       (row.pen_DelWts !== undefined ? Number(row.pen_DelWts) :
                       (Number(row.maxWt || row.ActualWt || 0) - Number(row.deliveredWt || 0)));

      return {
        remark: row.remarks || '',
        contactNo: row.contactNo || '',
        delyperson: row.personName || '',
        origin: row.OrgCode || row.Origin || '',
        podReceived: row.podReceived || '',
        dlyPerson: row.personName || '',
        partY_CODE: row.BillingPartyCode || row.PARTY_CODE || '',
        docksf: row.docksf || '.',
        delWts: Number(row.deliveredWt) || 0,
        isEnabledBadPodoption: row.podQuality === 'Bad',
        pen_DelPkgs: penDelPkgs,
        Pen_DelPkgs: penDelPkgs,
        destination: row.DestCode || row.Destination || '',
        dlyContactNo: row.contactNo || '',
        autoNo: Number(row.AutoNo || row.autoNo) || null,
        pen_DelWts: penDelWts,
        delPkgs: Number(row.deliveredPkgs) || 0,
        dockno: row.LRNumber || row.dockno || '',
        isEnabled: true,
        receivedBy: row.personName || '',
        delydate: this.formatDeliveryDate(row.deliveryDate),
        pkgs_Pending: penDelPkgs,
        deliveredTo: row.deliveredTo || ''
      };
    });

    const DepsList: any[] = [];
    this.selectedDockets.forEach((row: any) => {
      if (row.depsData) {
        const items = Array.isArray(row.depsData) ? row.depsData : [row.depsData];
        items.forEach((v: any) => {
          DepsList.push({
            depsfile: v.depsfile || v.fileBase64 || '',
            docket: v.docket || row.LRNumber || row.dockno || '',
            affectedQty: Number(v.affectedQty || v.affectedPkgs) || 0,
            affectedInvVal: Number(v.affectedInvVal) || 0,
            reason: v.reason || '',
            depsNo: v.depsNo || '',
            depsTyp: v.depsTyp || v.depstype || '',
            fileName: v.fileName || '',
            damageType: v.damageType || '',
            affectedWeight: Number(v.affectedWeight) || 0,
            invval: Number(v.invval) || 0,
            totWeight: Number(v.totWeight || row.deliveredWt) || 0,
            remarks: v.remarks || '',
            docketsf: v.docketsf || row.docksf || '.',
            pkgsdelivered: Number(v.pkgsdelivered || v.pkgsDelivered || row.deliveredPkgs) || 0,
            severity: v.severity || ''
          });
        });
      }
    });

    const formData = new FormData();
    formData.append('DocketsUpdateList', JSON.stringify(DocketsUpdateList));
    formData.append('DepsList', JSON.stringify(DepsList));
    formData.append('LocationCode', this.docketService.loginUserList?.LocationCode || this.docketService.Location || '');
    formData.append('BaseUserName', this.docketService.loginUserList?.BaseUserName || this.docketService.baseUsername || '');
    formData.append('FinYear', this.docketService.loginUserList?.FinYear || this.docketService.FinYear || '');

    this.selectedDockets.forEach((row: any) => {
      const docNo = row.LRNumber || row.dockno || 'POD';
      if (row.podFile1) {
        formData.append('Files', row.podFile1, `${docNo}_FRONT_${row.podFile1.name}`);
      }
      if (row.podFile2) {
        formData.append('BackFiles', row.podFile2, `${docNo}_BACK_${row.podFile2.name}`);
      }
    });

    this.isSubmit = true;
    this.deliveryUpdateService.counterDelivery(formData).subscribe({
      next: (response: any) => {
        this.isSubmit = false;
        if (response  && !response.isError) {
          this.sweetAlertService.success(`Update delivery ${response.gdNo} Generated successfully!!!`)
          this.deliveryUpdated.emit({
            response,
            formData,
            selectedDockets: this.selectedDockets
          });
          this.closeModal();
        } else {
          this.sweetAlertService.error(response?.data?.message || response?.message || 'You have some errors. Please check.');
        }
      },
      error: (error: any) => {
        this.isSubmit = false;
        console.error('Error submitting counter delivery:', error);
        this.sweetAlertService.error(error?.error?.message || error?.message || 'Failed to submit counter delivery.');
      }
    });
  }
}
