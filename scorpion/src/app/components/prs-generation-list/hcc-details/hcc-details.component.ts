import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from 'app/shared/services/common.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { PrsArrivalDetailsService } from 'app/shared/services/prs-arrival-details.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { THCMasterService } from 'app/shared/services/thc-master.service';

@Component({
  selector: 'app-hcc-details',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule,FormsModule,ReactiveFormsModule],
  templateUrl: './hcc-details.component.html',
  styleUrl: './hcc-details.component.scss'
})
export class HCCDetailsComponent {
  public modalRef!: BsModalRef;
  selectedHccType: string = '';
  public selectedHccDetails: any;
  public hccData:any;
  public hccForm!:FormGroup;
  public isLoading: boolean = false;


  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;

  constructor(private modalService: BsModalService, private CommonService: CommonService,
    private thcMasterService:THCMasterService,private fb:FormBuilder,
    public generalMasterService: GeneralMasterService, public prsArrivalDetailsService: PrsArrivalDetailsService) { }

  showPopup(data: any) {
    console.log("HCC Details Data:", data);
    this.selectedHccDetails = data;
    this.selectedHccType='';
    this.buildForm();
    this.CommonService.getVendorType('P');
    this.generalMasterService.getChargeTypeData();
    this.getHCCDetail(data.drsNo);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  buildForm(){
  this.hccForm = this.fb.group({
     hhcLocation:[''],
      hcNumber:[''],
      documentNo:[''],
      Route:[''],
      LaborType:[''],
      HCCPayType:[''],
      chargeAmount:[''],
      chargedBy:[''],
      VendorCode:[''],
      RateType:[''],
      chargeRate:[''],
      chargesType:[''],
      vendorCode:[''],
      rateType:[''],
      totalWeight: [''],
      totalLRWiseAmount: [0],
      totalPkg:[''],
    lrList: this.fb.array([])   // ✅ Correct
  });
  }

  get lrList(): FormArray {
  return this.hccForm.get('lrList') as FormArray;
}
createLRGroup(item: any): FormGroup {
  return this.fb.group({
    lr: [item.lr],
    origin: [item.origin],
    destination: [item.destination],
    pkgsno: [item.pkgsno],
    weight: [item.weight],
    lrWiseHCCAmount: [item.lrWiseHCCAmount ||0.00],
    isChecked: [item.lrWiseHCCAmount > 0]
  });
}

  getHCCDetail(drsNo:string){
    const payload={
      hhcNo:drsNo,
      chargesType:'Loading'
    }
    this.isLoading = true;
     this.lrList.clear();

    this.thcMasterService.getHCCDetail(payload).subscribe({
      next:(response:any)=>{
        if(response){
          this.hccForm.patchValue({
            hhcLocation:response.hhcLocation,
            hcNumber:response.hcNumber,
            documentNo:response.documentNo,
            chargesType:response.chargesType === 'L'?'Loading':'UnnLoading',
            chargedBy:response.chargedBy,
            vendorCode:response.vendorCode,
            rateType:response.rateType,
            chargeRate:response.chargeRate,

          })
          this.lrList.clear();
          response.clullrdList.forEach((item: any) => {
            this.lrList.push(this.createLRGroup(item));
          });
            this.calculateTotals();
        this.isLoading = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    })
  }

  calculateTotals() {
  let totalWeight = 0;
  let totalPkg = 0;
  let totalLRWiseAmount = 0;

  this.lrList.controls.forEach((group: any) => {
    const weight = parseFloat(group.get('weight')?.value) || 0;
    const pkgs =  parseFloat(group.get('pkgsno')?.value) || 0;
    const amount = parseFloat(group.get('lrWiseHCCAmount')?.value) || 0;

    totalWeight += weight;
    totalPkg += pkgs;
    totalLRWiseAmount += amount;
  });

  this.hccForm.patchValue({
    totalWeight: totalWeight.toFixed(2),
    totalPkg : totalPkg.toFixed(2),
    totalLRWiseAmount: totalLRWiseAmount.toFixed(2)
  });
}

}
