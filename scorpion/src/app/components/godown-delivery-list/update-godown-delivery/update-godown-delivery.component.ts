import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-update-godown-delivery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BsDatepickerModule
  ],
  templateUrl: './update-godown-delivery.component.html',
  styleUrl: './update-godown-delivery.component.scss'
})
export class UpdateGodownDeliveryComponent {
  @Output() deliveryUpdated = new EventEmitter<any>();

  public showModal: boolean = false;
  public selectedDockets: any[] = [];

  public bulkUpdate: any = {
    deliveredTo: '',
    personName: '',
    contactNo: '',
    deliveryDate: new Date(),
    podReceived: ''
  };

  public datePickerConfig: any = {
    dateInputFormat: 'DD-MMM-YYYY',
    containerClass: 'theme-dark-blue',
    showWeekNumbers: false,
    adaptivePosition: true
  };

  constructor(public docketService: DocketService) {}

  showPopup(dockets: any[]) {
    this.selectedDockets = JSON.parse(JSON.stringify(dockets || []));

    const today = new Date();
    this.selectedDockets.forEach(row => {
      row.deliveredPkgs = row.deliveredPkgs !== undefined ? row.deliveredPkgs : (row.Pkgs || 40);
      row.deliveredWt = row.deliveredWt !== undefined ? row.deliveredWt : (row.ActualWt || 986.8);
      row.partDeliveredReason = row.partDeliveredReason || 'N/A';
      row.deliveredTo = row.deliveredTo || '';
      row.personName = row.personName || '';
      row.contactNo = row.contactNo || '';
      row.deliveryDate = row.deliveryDate ? new Date(row.deliveryDate) : today;
      row.podReceived = row.podReceived || '';
    });

    this.bulkUpdate = {
      deliveredTo: '',
      personName: '',
      contactNo: '',
      deliveryDate: today,
      podReceived: ''
    };

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  applyBulkToAll() {
    this.selectedDockets.forEach(row => {
      if (this.bulkUpdate.deliveredTo) row.deliveredTo = this.bulkUpdate.deliveredTo;
      if (this.bulkUpdate.personName) row.personName = this.bulkUpdate.personName;
      if (this.bulkUpdate.contactNo) row.contactNo = this.bulkUpdate.contactNo;
      if (this.bulkUpdate.deliveryDate) row.deliveryDate = this.bulkUpdate.deliveryDate;
      if (this.bulkUpdate.podReceived) row.podReceived = this.bulkUpdate.podReceived;
    });
  }

  submitGodownDelivery() {
    console.log('Submitting Godown Delivery:', this.selectedDockets);
    this.deliveryUpdated.emit(this.selectedDockets);
    this.closeModal();
  }
}
