import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-prsdrs-edit',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './prsdrs-edit.component.html',
  styleUrl: './prsdrs-edit.component.scss'
})
export class PRSDRSEditComponent {
  public modalRef!: BsModalRef;
  public prsDrsList: any = [];
  public PDCFinancialForm!: FormGroup;
  public financialEditDetail: any = [];
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(
    private modalService: BsModalService,private prsdrsApiService:PRSDRSApiService,public docketService: DocketService,private sweetAlertService: SweetAlertService) { }

  showPopup(data: any,flag: string) {
    this.prsDrsList = data;
    this.GetTHCFinancialEditDetail(flag);
    this.createForm();
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

   ngOnInit() {
      const saved = localStorage.getItem("loginUserList");
      if (saved) {
        this.docketService.loginUserList = JSON.parse(saved);
        this.docketService.Location = this.docketService.loginUserList.LocationCode;
        this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
        this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
      }
    }

  createForm(){
    this.PDCFinancialForm = new FormGroup({
      pcamt:new FormControl(),
      advamt: new FormControl(),
      fincmplbr: new FormControl(),
      balamtbrcd: new FormControl(),
      thcno: new FormControl(),
      type: new FormControl(),
      conttyp:new FormControl(),
    });
  }

  GetTHCFinancialEditDetail(flag?: string){
    const payload = {
      thcNo:  this.prsDrsList.drsNo || this.prsDrsList.pdcno,
      flag: flag ,
      vendorType: this.prsDrsList.vendorType
    }
    this.prsdrsApiService.GetTHCFinancialEditDetail(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.financialEditDetail = response;
          this.PDCFinancialForm.patchValue(response.thcsumry);
        }
      }
    });
  }

   GetInvokeContractDetailsDktwise(){
    const payload = {
      pdcNo: this.PDCFinancialForm.value.thcno,
    }
    this.prsdrsApiService.GetInvokeContractDetailsDktwise(payload).subscribe({
      next: (response: any) => {
        if (response && response.length) {
          response.forEach((contractItem: any) => {
            const docketItem = this.financialEditDetail.docketList.find((docket: any) => contractItem.dockno.includes(docket.dockno));
            if (docketItem) {
              docketItem.contractAmount = contractItem.contractAmount;
            }
          });
          
          // Calculate and update total contract amount
          const totalContractAmount = response.reduce((sum: number, item: any) => {
            return sum + (item.contractAmount || 0);
          }, 0);
          this.PDCFinancialForm.patchValue({pcamt: totalContractAmount});
        }
      }
    });
  }

  THCEditUpdate() {
    const payload = {
      thcsumry: this.PDCFinancialForm.value,
      thcPDCEdit: this.financialEditDetail.docketList.map((item: any) => ({
        dockno: item.dockno,
        docksf: item.docksf,
        contractAmount: item.contractAmount
      })),
      baseUserName: this.docketService.loginUserList.BaseUserName
    }
    this.prsdrsApiService.THCEditUpdate(payload).subscribe({next: (response: any) => {
      if (response) {
        this.sweetAlertService.success(`PDC No. ${this.prsDrsList.pdcno} has been updated successfully.`);
        this.dataEmitter.emit()
        this.modalRef.hide();
      }
      }
    });
  }
}
