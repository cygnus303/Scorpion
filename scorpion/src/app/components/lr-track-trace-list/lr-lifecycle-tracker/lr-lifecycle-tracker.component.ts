import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LrOperationalTabComponent } from './lr-operational-tab/lr-operational-tab.component';
import { LrFinancialTabComponent } from './lr-financial-tab/lr-financial-tab.component';
import { LrDocumentsTabComponent } from './lr-documents-tab/lr-documents-tab.component';
import { LrExceptionsTabComponent } from './lr-exceptions-tab/lr-exceptions-tab.component';
import { LrScanningTabComponent } from './lr-scanning-tab/lr-scanning-tab.component';
import { LrDocketPlTabComponent } from './lr-docket-pl-tab/lr-docket-pl-tab.component';
import { LrService } from 'app/shared/services/lr.service';

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
  @Output() viewOnMap = new EventEmitter<any>();
  @Output() printLr = new EventEmitter<any>();

  public lrDetails: any = null;
  public originalLr: any = null;
  public activeTab: string = 'Operational';
  constructor(
    private modalService: BsModalService,
    private lrService: LrService
  ) {}

  showPopup(lr: any) {
    if (!lr) return;
    this.originalLr = lr;
    const lrNo = lr.LrNumber || lr.lrNumber || lr.lR_Number; 
    this.lrDetails = null;
    this.activeTab = 'Operational';
    // Fetch data from API
    this.lrService.getLRTrackerSummary(lrNo).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.lrDetails = res.data;
        }
      },
      error: (err) => console.error("Error fetching LR details", err)
    });

    this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered custom-tracker-modal', backdrop: true });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onViewOnMap() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.viewOnMap.emit(this.originalLr || this.lrDetails);
  }

  onPrintLr() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.printLr.emit(this.originalLr || this.lrDetails);
  }
}
