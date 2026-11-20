import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';

@Component({
  selector: 'app-update-godown-delivery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BsDatepickerModule,
    NgSelectModule
  ],
  templateUrl: './update-godown-delivery.component.html',
  styleUrl: './update-godown-delivery.component.scss'
})
export class UpdateGodownDeliveryComponent implements OnInit {
  @Output() deliveryUpdated = new EventEmitter<any>();

  public showModal: boolean = false;
  public selectedDockets: any[] = [];

  public isSubmitted: boolean = false;
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
    showWeekNumbers: false
  };

  constructor(
    public docketService: DocketService,
    public generalMasterService: GeneralMasterService
  ) {}

  ngOnInit() {
    this.generalMasterService.getDeliveredToData();
  }

  showPopup(dockets: any[]) {
    if (!this.generalMasterService.deliveredToData || this.generalMasterService.deliveredToData.length === 0) {
      this.generalMasterService.getDeliveredToData();
    }

    this.isSubmitted = false;
    this.validationErrors = [];

    this.selectedDockets = JSON.parse(JSON.stringify(dockets || []));

    const today = new Date();
    this.selectedDockets.forEach(row => {
      row.deliveredPkgs = row.deliveredPkgs !== undefined ? row.deliveredPkgs : (row.Pkgs || 40);
      row.deliveredWt = row.deliveredWt !== undefined ? row.deliveredWt : (row.ActualWt || 986.8);
      row.partDeliveredReason = row.partDeliveredReason || 'N/A';
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

  isContactInvalid(target: any): boolean {
    if (!target) return false;
    const val = (target.contactNo || '').toString().trim();
    if (target.isContactTouched || this.isSubmitted) {
      return val.length < 10;
    }
    return false;
  }

  isDeliveredPkgsInvalid(row: any): boolean {
    const totalPkgs = Number(row.Pkgs) || 40;
    const pkgs = Number(row.deliveredPkgs);
    return isNaN(pkgs) || pkgs <= 0 || pkgs > totalPkgs;
  }

  isReasonInvalid(row: any): boolean {
    const totalPkgs = Number(row.Pkgs) || 40;
    const pkgs = Number(row.deliveredPkgs);
    return !isNaN(pkgs) && pkgs > 0 && pkgs < totalPkgs && (!row.partDeliveredReason || row.partDeliveredReason === 'N/A');
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

  isPodQualityInvalid(row: any): boolean {
    return (row.podReceived === 'Y' || row.podReceived === 'Yes') && (!row.podQuality || row.podQuality === '');
  }

  validateDockets(): boolean {
    this.validationErrors = [];

    this.selectedDockets.forEach(row => {
      const lrNo = row.LRNumber || row.dockno || 'Docket';
      const messages: string[] = [];
      const totalPkgs = Number(row.Pkgs) || 40;
      const deliveredPkgs = Number(row.deliveredPkgs);

      // 1. Delivered Pkgs
      if (isNaN(deliveredPkgs) || deliveredPkgs <= 0 || deliveredPkgs > totalPkgs) {
        messages.push(`"Delivered Pkgs" must be between 1 and ${totalPkgs}`);
      }

      // 2. Part Delivered Reason
      if (!isNaN(deliveredPkgs) && deliveredPkgs > 0 && deliveredPkgs < totalPkgs) {
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
        if (!row.podQuality || row.podQuality === '') {
          messages.push(`"POD Quality" selection is mandatory`);
        }
      }

      if (messages.length > 0) {
        this.validationErrors.push({ lrNo, messages });
      }
    });

    return this.validationErrors.length === 0;
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
  }

  applyBulkToAll() {
    this.selectedDockets.forEach(row => {
      if (this.bulkUpdate.deliveredTo) row.deliveredTo = this.bulkUpdate.deliveredTo;
      if (this.bulkUpdate.personName) row.personName = this.bulkUpdate.personName;
      if (this.bulkUpdate.contactNo) {
        row.contactNo = this.bulkUpdate.contactNo;
        row.isContactTouched = true;
      }
      if (this.bulkUpdate.deliveryDate) row.deliveryDate = this.bulkUpdate.deliveryDate;
      if (this.bulkUpdate.podReceived) {
        row.podReceived = this.bulkUpdate.podReceived;
        if (row.podReceived !== 'Y' && row.podReceived !== 'Yes') {
          row.podQuality = '';
          row.podFile1 = null;
          row.podFile2 = null;
        }
      }
    });
  }

  submitGodownDelivery() {
    this.isSubmitted = true;
    const isValid = this.validateDockets();
    if (!isValid) {
      return;
    }
    console.log('Submitting Godown Delivery:', this.selectedDockets);
    this.deliveryUpdated.emit(this.selectedDockets);
    this.closeModal();
  }
}
