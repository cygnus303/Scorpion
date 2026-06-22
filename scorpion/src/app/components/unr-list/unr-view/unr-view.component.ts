import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-unr-view',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './unr-view.component.html',
  styleUrl: './unr-view.component.scss'
})
export class UnrViewComponent {
  public modalRef!: BsModalRef;
  public isLoading: boolean = false;
  public summary: any = {};
  public dataList: any[] = [];
  @ViewChild('TemplateRef', { static: true }) TemplateRef!: TemplateRef<any>;

  constructor(private thcMasterService: THCMasterService,
    private modalService: BsModalService
  ) { }

  showPopup(row: any) {
    if (!row) return;
    this.isLoading = true;
    
    // Open the modal immediately so the loader is visible
    this.modalRef = this.modalService.show(this.TemplateRef, { class: 'modal-xl modal-dialog-centered hcc-view-modal-custom', backdrop: true });
    
    const payload = {
      FilterJson: {
        ReportId: "366",
        VoucherNo: row
      }
    };

    this.thcMasterService.getHCCDynamicData(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          if (res.Table1 && res.Table1.length > 0) {
            this.summary = res.Table1[0];
            this.dataList = res.Table1;
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching HCC details', err);
      }
    });
  }

  printVoucher() {
    window.print();
  }
}
