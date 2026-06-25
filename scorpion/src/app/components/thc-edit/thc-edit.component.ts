import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { FormsModule } from '@angular/forms';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-thc-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thc-edit.component.html',
  styleUrl: './thc-edit.component.scss'
})
export class ThcEditComponent {
  public modalRef!: BsModalRef;
  public selectedTHC: string = '';
  public thcData: any;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;

  constructor(private modalService: BsModalService, public PRSDRSApiService: PRSDRSApiService, private docketService: DocketService, private sweetAlerService: SweetAlertService) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

  showPopup(data: any) {
    console.log("HCC Details Data:", data);
    this.selectedTHC = data.thcNo;
    this.getTHCEditDetail(data);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  getTHCEditDetail(data: any) {
    const params = {
      thcNo: data.thcNo,
      vendorType: null
    }

    this.PRSDRSApiService.getTHCEditDetail(params).subscribe({
      next: (response: any) => {
        if (response) {
          this.thcData = response.thcsumry;
        }
      }, error: (err) => {
        console.error(err);
      }
    })
  }

  submitTHC() {
    const payload = {
      thcNo: this.selectedTHC || "",
      type: "T",
      contractAmount: Number(this.thcData?.contractAmt) || 0,
      standardContractAmount: Number(this.thcData?.stdAmt) || 0,
      advanceAmount: Number(this.thcData?.advamt) || 0,
      advanceAmountPaidAt: this.thcData?.fincmplbr || "",
      balanceAmountPaidAt: this.thcData?.balamtbrcd || "",
      oldContractAmount: 0,
      oldAdvanceAmount: 0,
      oldAdvanceAmountPaidAt: "",
      oldBalanceAmountPaidAt: "",
      userName: this.docketService.baseUsername
    }

    this.PRSDRSApiService.THCSubmit(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.sweetAlerService.success(`${response.message}`);
        }
      }, error: (err: any) => {
        console.error(err);
        this.sweetAlerService.success(`${err.message}`);
      }
    })
  }

}
