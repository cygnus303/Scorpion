import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { PRSArrivalDetailsComponent } from 'app/components/prs-arrival-details/prs-arrival-details.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-prsarrival',
  standalone: true,
  imports: [CommonModule, PRSArrivalDetailsComponent, NgSelectModule, FormsModule],
  templateUrl: './prsarrival.component.html',
  styleUrl: './prsarrival.component.scss',
  providers: [BsModalService]
})
export class PRSArrivalComponent implements OnInit {
  public modalRef!: BsModalRef;
  public arrivalData: any = {
    pdcno: null,
    loadBy: null,
    chargeType: null
  };

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(
    private modalService: BsModalService,
    public generalMasterService: GeneralMasterService, private THCMasterService: THCMasterService, private docketService: DocketService
  ) { }

  ngOnInit() {
  }

  getVendorType() {
    this.THCMasterService.getVendorType(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          const mTypeRow = response.data.find((x: any) => x.documentType === 'M');
          if (mTypeRow) {
            const vendorTypes = mTypeRow.loading_VendorType.split(',');
            this.generalMasterService.getLoadingByDetail(vendorTypes);
          }
        }
      }
    });
  }

  showPopup(data: any) {
    this.arrivalData = {
      pdcno: data.pdcno,
      loadBy: null,
      chargeType: null
    };
    this.getVendorType();
    this.generalMasterService.getChargeTypeData();
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  triggerRefresh() {
    this.arrivalData = { ...this.arrivalData };
  }

  onLoadingByChange() {
    if (this.arrivalData.loadBy === 'XX5' || this.arrivalData.loadBy === 'XX9') {
      this.arrivalData.chargeType = null;
    }
    this.triggerRefresh();
  }

  onDataSubmit(event: any) {
    this.dataEmitter.emit(event);
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }
}
