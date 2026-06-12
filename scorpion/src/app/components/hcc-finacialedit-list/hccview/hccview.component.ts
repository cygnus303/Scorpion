import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { THCMasterService } from 'app/shared/services/thc-master.service';

@Component({
  selector: 'app-hccview',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule],
  templateUrl: './hccview.component.html',
  styleUrl: './hccview.component.scss'
})
export class HCCviewComponent {
  public modalRef!: BsModalRef;
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  public summary: any = {};
  public dataList: any[] = [];
  public isLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private thcMasterService: THCMasterService
  ) { }

  showPopup(row: any) {
    if (!row) return;
    this.isLoading = true;
    const payload = {
      FilterJson: {
        HcNumber: row.HCNumber,
        DocumentNo: row.DocumentNo
      }
    };

    this.thcMasterService.getHCCDynamicData(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.summary = res.summary || {};
          this.dataList = res.data || [];
          this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching HCC details', err);
      }
    });
  }

  getTotalPkgs(): number {
    return this.dataList.reduce((acc, curr) => acc + (curr.PKG_Load || 0), 0);
  }

  getTotalWeight(): number {
    return this.dataList.reduce((acc, curr) => acc + (curr.CHRGWT_Load || 0), 0);
  }

   getHccAmount(): number {
    return this.dataList.reduce((acc, curr) => acc + (curr.HCAmt || 0), 0);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  printHccModal() {
    document.body.classList.add('printing-mode');
    const afterPrint = () => {
      document.body.classList.remove('printing-mode');
      this.closeHccModal();
      window.removeEventListener('afterprint', afterPrint);
    };
    window.addEventListener('afterprint', afterPrint);
    setTimeout(() => {
      window.print();
    }, 10);
  }

  closeHccModal() {
    this.close();
  }
}
