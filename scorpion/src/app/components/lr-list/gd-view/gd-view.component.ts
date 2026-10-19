import { Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-gd-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gd-view.component.html',
  styleUrl: './gd-view.component.scss',
  providers: [BsModalService]
})
export class GdViewComponent {
  @ViewChild('gdViewModal') gdViewModal!: TemplateRef<any>;
  modalRef?: BsModalRef;
  
  public GDData: any;
  public isLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService,
    private sweetAlertService: SweetAlertService
  ) {}

  openModal(data: any) {
    this.getGDDetail(data.gdNo ? data.gdNo : data);
    this.modalRef = this.modalService.show(this.gdViewModal, { class: 'modal-lg modal-dialog-centered gd-view-modal', backdrop: true });
  }

  closeModal() {
    this.modalRef?.hide();
  }

    getGDDetail(gdNo: any) {
    this.isLoading = true;
    const payload = {
      "FilterJson": {
        "ReportId": "393",
        "GDNo": gdNo
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.Table1) {
          this.GDData = response.Table1[0];
        } else {
        }
      },
      error: () => {
        this.isLoading = false;
        this.sweetAlertService.error("Error While Fetching GB Detail")
      }
    });
  }
}

