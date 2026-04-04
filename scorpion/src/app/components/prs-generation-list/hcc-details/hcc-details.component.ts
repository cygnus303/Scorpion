import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from 'app/shared/services/common.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { PrsArrivalDetailsService } from 'app/shared/services/prs-arrival-details.service';

@Component({
  selector: 'app-hcc-details',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule],
  templateUrl: './hcc-details.component.html',
  styleUrl: './hcc-details.component.scss'
})
export class HCCDetailsComponent {
  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;

  constructor(private modalService: BsModalService, private CommonService: CommonService,
    public generalMasterService: GeneralMasterService, public prsArrivalDetailsService: PrsArrivalDetailsService) { }

  showPopup() {
    this.CommonService.getVendorType('P');
    this.generalMasterService.getChargeTypeData();
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

}
