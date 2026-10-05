import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-gb-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gb-view.component.html',
  styleUrls: ['./gb-view.component.scss']
})
export class GbViewComponent implements OnInit {
  @ViewChild('gbViewTemplate', { static: true }) template!: TemplateRef<any>;
  modalRef?: BsModalRef;

  public GBData: any;
  public isLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService,
    private sweetAlertService: SweetAlertService
  ) { }

  ngOnInit(): void { }

  openModal(lrData: any) {
    this.getGBDetail(lrData.gbNo ?lrData.gbNo :lrData);
    this.modalRef = this.modalService.show(this.template, {
      class: 'modal-lg modal-dialog-centered custom-gb-modal'
    });
  }

  getGBDetail(gbNo: any) {
    this.isLoading = true;
    const payload = {
      "FilterJson": {
        "ReportId": "392",
        "GBNo": gbNo
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.Table1) {
          this.GBData = response.Table1[0];
        } else {
        }
      },
      error: () => {
        this.isLoading = false;
        this.sweetAlertService.error("Error While Fetching GB Detail")
      }
    });
  }

  

  closeModal() {
    this.modalRef?.hide();
  }
}
