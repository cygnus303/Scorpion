import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LrOperationalTabComponent } from './lr-operational-tab/lr-operational-tab.component';
import { LrFinancialTabComponent } from './lr-financial-tab/lr-financial-tab.component';
import { LrDocumentsTabComponent } from './lr-documents-tab/lr-documents-tab.component';
import { LrExceptionsTabComponent } from './lr-exceptions-tab/lr-exceptions-tab.component';
import { LrScanningTabComponent } from './lr-scanning-tab/lr-scanning-tab.component';
import { LrDocketPlTabComponent } from './lr-docket-pl-tab/lr-docket-pl-tab.component';

@Component({
  selector: 'app-lr-lifecycle-tracker',
  standalone: true,
  imports: [
    CommonModule,
    LrOperationalTabComponent,
    LrFinancialTabComponent,
    LrDocumentsTabComponent,
    LrExceptionsTabComponent,
    LrScanningTabComponent,
    LrDocketPlTabComponent
  ],
  providers: [BsModalService],
  templateUrl: './lr-lifecycle-tracker.component.html',
  styleUrl: './lr-lifecycle-tracker.component.scss'
})
export class LrLifecycleTrackerComponent {
  public modalRef!: BsModalRef;
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;

  public lrDetails: any = null;
  public activeTab: string = 'Operational';

  // Dummy mock data for initial UI rendering
  public dummyData = {
    lrNumber: 'LR-2604-00841',
    route: 'Mumbai → New Delhi',
    status: 'In Transit',
    bookedOn: '13 Apr 2026, 09:14 AM',
    edd: '17 Apr 2026',
    weightPkgs: '487 kg / 12 Pkgs',
    payBasis: 'PAID',
    mode: 'Road',
    currentLocation: 'Nagpur Hub (NGP-HUB)'
  };

  constructor(private modalService: BsModalService) {}

  showPopup(lr: any) {
    if (!lr) return;
    this.lrDetails = { ...this.dummyData, lrNumber: lr.LrNumber || this.dummyData.lrNumber };
    this.activeTab = 'Operational';
    
    this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered custom-tracker-modal', backdrop: true });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
