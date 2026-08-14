import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-voucher-view',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './voucher-view.component.html',
  styleUrl: './voucher-view.component.scss'
})
export class VoucherViewComponent {
  public VoucherData: any = {};
  public VoucherDetails: any[] = [];
  public totalDebit: number = 0;
  public totalCredit: number = 0;

  @ViewChild('TemplateVoucherView', { static: true }) TemplateVoucherView!: TemplateRef<any>;

  constructor(
    public modalRef: BsModalRef,
    public modalService: BsModalService,
    public dynamicDataService: DynamicDataService
  ) { }

  showPopup(voucherNo: string) {
    this.getVoucherDetail(voucherNo);
    this.modalRef = this.modalService.show(this.TemplateVoucherView, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
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

  getVoucherDetail(voucherNo: string) {
    const payload = {
      "FilterJson": {
        "ReportId": 380,
        "VoucherNo": voucherNo,
        "YearPrefix": ""
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      if (response && response.Table1 && response.Table1.length > 0) {
        this.VoucherData = response.Table1[0];
      } else {
        this.VoucherData = {};
      }

      if (response && response.Table2) {
        this.VoucherDetails = response.Table2;
        this.calculateTotals();
      } else {
        this.VoucherDetails = [];
        this.calculateTotals();
      }
    });
  }

  calculateTotals() {
    this.totalDebit = this.VoucherDetails.reduce((acc, v) => acc + (parseFloat(v.DebitAmount || v.DebitAmt || v.debit) || 0), 0);
    this.totalCredit = this.VoucherDetails.reduce((acc, v) => acc + (parseFloat(v.CreditAmount || v.CreditAmt || v.credit) || 0), 0);
  }

  printReceipt() {
    document.body.classList.add('printing-modal');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-modal');
    }, 100);
  }
}

