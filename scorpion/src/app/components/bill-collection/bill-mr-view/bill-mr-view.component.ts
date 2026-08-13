import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { MrDetailComponent } from '../mr-detail/mr-detail.component';
import { VoucherViewComponent } from '../voucher-view/voucher-view.component';

@Component({
  selector: 'app-bill-mr-view',
  standalone: true,
  imports: [CommonModule, MrDetailComponent, VoucherViewComponent],
  providers: [BsModalService],
  templateUrl: './bill-mr-view.component.html',
  styleUrl: './bill-mr-view.component.scss'
})
export class BillMrViewComponent {
  public mrList: any[] = [];
  public isLoading: boolean = false;
  @ViewChild('TemplateMr', { static: true }) TemplateMr!: TemplateRef<any>;
  @ViewChild(MrDetailComponent) mrDetailComponent!: MrDetailComponent;
  @ViewChild(VoucherViewComponent) voucherViewComponent!: VoucherViewComponent;

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
    const payload = {
      "FilterJson": {
        "ReportId": "378",
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

  printMrList() {
    document.body.classList.add('modal-open');
    setTimeout(() => {
      window.print();
    }, 100);
  }

  openMrPopup(item: any) {
    this.mrDetailComponent.showPopup(item);
  }

  openVoucherPopup(item: any){
    this.voucherViewComponent.showPopup(item);
  }
}

