import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { LrViewComponent } from '../../lr-list/lr-view/lr-view.component';

@Component({
  selector: 'app-docket-history',
  standalone: true,
  imports: [CommonModule, LrViewComponent],
  providers: [BsModalService],
  templateUrl: './docket-history.component.html',
  styleUrl: './docket-history.component.scss'
})
export class DocketHistoryComponent {
  @ViewChild('docketHistoryModal') docketHistoryModalTemplate!: TemplateRef<any>;
  @ViewChild('lrViewComponent') lrViewComponent!: LrViewComponent;
  
  public modalRef?: BsModalRef;
  public indentNo: string = '';
  public isLoading: boolean = false;
  public docketHistoryList: any[] = [];

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService,
    private sweetAlertService: SweetAlertService
  ) {}

  showPopup(indentNo: string) {
    this.indentNo = indentNo;
    this.docketHistoryList = [];
    this.isLoading = true;
    const config: ModalOptions = {
      class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', // default opens at top center
      backdrop: 'static'
    };
    
    this.modalRef = this.modalService.show(this.docketHistoryModalTemplate, config);

    const payload = {
      "FilterJson": {
        "ReportId": "385",
        "IndentNo": indentNo
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.Table1) {
          this.docketHistoryList = response.Table1;
        } else {
          this.docketHistoryList = [];
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.sweetAlertService.error(error?.error?.message || 'Failed to fetch docket history');
      }
    });
  }

  closeModal() {
    this.modalRef?.hide();
    this.indentNo = '';
    this.docketHistoryList = [];
  }

  openLrView(docketNo: string) {
    if (docketNo) {
      this.lrViewComponent.showPopup(docketNo);
    }
  }
}
