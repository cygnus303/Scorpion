import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-bill-mr-view',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './bill-mr-view.component.html',
  styleUrl: './bill-mr-view.component.scss'
})
export class BillMrViewComponent {
  public mrList: any[] = [];
  public isLoading: boolean = false;
  @ViewChild('TemplateMr', { static: true }) TemplateMr!: TemplateRef<any>;

  constructor(
    public modalRef: BsModalRef,
    public modalService: BsModalService,
    public dynamicDataService: DynamicDataService
  ) {}

  showPopup(billNo: any) {
    this.getMrData(billNo);
    this.modalRef = this.modalService.show(this.TemplateMr, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
  }

  getMrData(billNo: any) {
    // TODO: Update ReportId and parameters as required by API
    const payload = {
      "FilterJson": {
        "ReportId": "", // Fill in with actual report id for fetching MR details by bill no
        "BillNo": billNo
      }
    };
    this.isLoading = true;
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      this.isLoading = false;
      if (response && response.Table1) {
        this.mrList = response.Table1;
      } else if (response && response.Table) {
        this.mrList = response.Table;
      } else {
        this.mrList = [];
      }
    }, () => {
      this.isLoading = false;
      this.mrList = [];
    });
  }

  closeMrView() {
    this.modalRef.hide();
  }
}
