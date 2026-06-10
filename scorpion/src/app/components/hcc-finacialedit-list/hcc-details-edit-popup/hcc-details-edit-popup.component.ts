import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-hcc-details-edit-popup',
  standalone: true,
  imports: [CommonModule, NgSelectModule],
  templateUrl: './hcc-details-edit-popup.component.html',
  styleUrl: './hcc-details-edit-popup.component.scss'
})
export class HccDetailsEditPopupComponent {
  public modalRef!: BsModalRef;
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  hccDetails = {
    hccNo: 'HC/HYH/2627/001364',
    hccDate: '14 May 2026',
    docNo: 'MF/AMH/2627/000673',
    hccAmount: '₹ 880.65',
    totalPkgs: 860,
    totalWeight: 9785,
    totalLrAmt: 0.00
  };

  dockets = [
    { sNo: 1, lrNo: '12038740', lrDate: '14-May-26', origin: 'JAI', destination: 'HYH', pkgs: 147, actualWt: 1470, chargeWt: 1470 },
    { sNo: 2, lrNo: '63261734', lrDate: '14-May-26', origin: 'JAI', destination: 'VGA', pkgs: 2, actualWt: 20, chargeWt: 20 },
    { sNo: 3, lrNo: '63261744', lrDate: '14-May-26', origin: 'JAI', destination: 'HYD', pkgs: 8, actualWt: 50, chargeWt: 50 },
    { sNo: 4, lrNo: '63320346', lrDate: '14-May-26', origin: 'RJK', destination: 'HYN', pkgs: 6, actualWt: 114, chargeWt: 114 },
    { sNo: 5, lrNo: '63352998', lrDate: '14-May-26', origin: 'CHN', destination: 'HYD', pkgs: 225, actualWt: 2025, chargeWt: 2025 },
    { sNo: 6, lrNo: '63365819', lrDate: '14-May-26', origin: 'STJ', destination: 'HYD', pkgs: 2, actualWt: 26, chargeWt: 26 }
  ];

  vendorTypes = ['Transporter', 'Agent', 'Attached Transporter', 'Market Vehicle'];
  vendors = ['Fast Freight Carriers', 'Blue Dart Express', 'Mahindra Logistics', 'Gati Kintetsu Express'];
  rateTypes = ['Per Kg', 'Flat Rate', 'Per Trip', 'Per Package'];

  constructor(
    private modalService: BsModalService) { }

  showPopup() {
    this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
  }

  close() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  printEditModal() {
    document.body.classList.add('printing-mode');
    const afterPrint = () => {
      document.body.classList.remove('printing-mode');
      this.close();
      window.removeEventListener('afterprint', afterPrint);
    };
    window.addEventListener('afterprint', afterPrint);
    setTimeout(() => {
      window.print();
    }, 10);
  }

  submit() {
    alert('HCC changes submitted successfully!');
    this.close();
  }
}
