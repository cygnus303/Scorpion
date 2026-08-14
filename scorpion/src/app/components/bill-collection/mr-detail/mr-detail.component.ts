import { Component, TemplateRef, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { VoucherViewComponent } from '../voucher-view/voucher-view.component';

@Component({
  selector: 'app-mr-detail',
  standalone: true,
  imports: [CommonModule, forwardRef(() => VoucherViewComponent)],
  providers: [BsModalService],
  templateUrl: './mr-detail.component.html',
  styleUrl: './mr-detail.component.scss'
})
export class MrDetailComponent {
  public MRData: any;
  public MRBills: any[] = [];
  public totalBillAmt: number = 0;
  public totalTdsAmt: number = 0;
  public totalBankCharges: number = 0;
  public totalRoundOffMinus: number = 0;
  public totalRoundOffPlus: number = 0;
  public totalNetAmt: number = 0;
  @ViewChild('TemplateMrDetail', { static: true }) TemplateMrDetail!: TemplateRef<any>;
  @ViewChild(forwardRef(() => VoucherViewComponent)) voucherViewComponent!: VoucherViewComponent;

  constructor(
    public modalRef: BsModalRef,
    public modalService: BsModalService,
    public dynamicDataService: DynamicDataService
  ) { }

  showPopup(mr: any) {
    this.getMRDetail(mr)
    this.modalRef = this.modalService.show(this.TemplateMrDetail, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
    setTimeout(() => {
      const modals = document.querySelectorAll('.modal');
      const backdrops = document.querySelectorAll('.modal-backdrop');
      if (modals.length > 0) {
        (modals[modals.length - 1] as HTMLElement).style.setProperty('z-index', '1070', 'important');
      }
      if (backdrops.length > 0) {
        (backdrops[backdrops.length - 1] as HTMLElement).style.setProperty('z-index', '1065', 'important');
      }
    }, 150);
  }

  closePopup() {
    this.modalRef.hide();
  }

  getMRDetail(data: string) {
    const payload = {
      "FilterJson": {
        "ReportId": "379",
        "MRSNO": data
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      if (response && response.Table1 && response.Table1.length > 0) {
        this.MRData = response.Table1[0];
      }
      if (response && response.Table2) {
        this.MRBills = response.Table2;
        this.calculateTotals();
      } else {
        this.MRBills = [];
        this.calculateTotals();
      }
    });
  }

  calculateTotals() {
    this.totalBillAmt = this.MRBills.reduce((acc, b) => acc + (parseFloat(b.BillAMT) || 0), 0);
    this.totalTdsAmt = this.MRBills.reduce((acc, b) => acc + (parseFloat(b.TDSAmt) || 0), 0);
    this.totalBankCharges = this.MRBills.reduce((acc, b) => acc + (parseFloat(b.BankCharges) || 0), 0);
    this.totalRoundOffMinus = this.MRBills.reduce((acc, b) => acc + (parseFloat(b.RoungOff_M) || 0), 0);
    this.totalRoundOffPlus = this.MRBills.reduce((acc, b) => acc + (parseFloat(b.RoundOff_P) || 0), 0);
    this.totalNetAmt = this.MRBills.reduce((acc, b) => acc + (parseFloat(b.NETAmt) || 0), 0);
  }

  printReceipt() {
    document.body.classList.add('printing-modal');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-modal');
    }, 100);
  }

  openVoucherPopup(item: any){
    this.voucherViewComponent.showPopup(item);
  }
}
