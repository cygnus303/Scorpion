import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DynamicDataService } from '../../services/dynamic-data.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { environment } from 'environments/environment';
import { EwayBillPreviewComponent } from 'app/components/eway-bill-preview/eway-bill-preview.component';

@Component({
  selector: 'app-ewaybill-invoice-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ewaybill-invoice-modal.component.html',
  styleUrl: './ewaybill-invoice-modal.component.scss',
  providers: [BsModalService]
})
export class EwaybillInvoiceModalComponent {
  @ViewChild('ewayBillModal') ewayBillModal!: TemplateRef<any>;

  public modalRef?: BsModalRef;
  public ewaybillData: any[] = [];
  public isEwaybillLoading: boolean = false;
  public selectedLrItem: any = null;
  public env = environment;

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService,
    private sweetAlertService: SweetAlertService
  ) {}

  openModal(lr: any) {
    this.selectedLrItem = lr;
    this.ewaybillData = [];
    this.isEwaybillLoading = true;
    
    this.modalRef = this.modalService.show(this.ewayBillModal, { class: 'modal-xl modal-dialog-centered custom-modal' });
    
    const dockno = typeof lr === 'string' ? lr : (lr.dockno || lr.LrNumber);
    const payload = {
      "FilterJson": {
        "ReportId": "11",
        "DockNo": dockno
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isEwaybillLoading = false;
        if (response?.Table1 && response.Table1.length > 0) {
          this.ewaybillData = response.Table1;
        }
      },
      error: () => {
        this.isEwaybillLoading = false;
        this.sweetAlertService.error('Error fetching E-Way bill data');
      }
    });
  }

  downloadEWayBillPDF(ewaybillNo: string) {
    if (!ewaybillNo) return;
    const payload = {
      "FilterJson": {
        "ReportId": "12",
        "EwaybillNo": ewaybillNo
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.modalService.show(EwayBillPreviewComponent, {
            initialState: { response },
            class: 'modal-lg modal-dialog-centered'
          });
        } else {
          this.sweetAlertService.error('E-Way Bill Details Not Found');
        }
      },
      error: () => {
        this.sweetAlertService.error('Failed to fetch E-Way Bill Details');
      }
    });
  }
}
