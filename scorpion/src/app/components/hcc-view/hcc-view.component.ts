import { Component, TemplateRef, ViewChild } from '@angular/core';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hcc-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hcc-view.component.html',
  styleUrl: './hcc-view.component.scss'
})
export class HccViewComponent {
  public modalRef!: BsModalRef;
  public viewDetail: any;
  public isLoading: boolean = false;

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;

  constructor(private modalService: BsModalService, private thcMasterService: THCMasterService) { }

  showPopup(data: any, chargeType: string, flag: any) {
    console.log("HCC Details Data:", data);
    this.getHCCViewData(data, chargeType, flag);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  getHCCViewData(data: any, chargeType: string, flag: any) {
    const payload = {
      "FilterJson": {
        "ReportId": "364",
        "Docno": data.pdcno,
        "DocType": flag,
        "ChargeType": chargeType
      }
    }
    this.isLoading = true;
    this.thcMasterService.getHCCDynamicData(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log("HCC View Data:", res);
        this.viewDetail = res.Table1;
      }
    }, () => {
      this.isLoading = false;
    });
  }
}
