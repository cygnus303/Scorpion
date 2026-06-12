import { Component, TemplateRef, ViewChild } from '@angular/core';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { environment } from 'environments/environment';

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
  public env = environment;

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
        "Docno": data.pdcno ||data.drsNo||data.mfNo,
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

    openHCCModal(hccNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/LoadingUnloadingViewPrint?LsNO=${hccNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

}
