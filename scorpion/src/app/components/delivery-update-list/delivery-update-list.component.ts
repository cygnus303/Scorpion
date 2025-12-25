import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChallanService } from 'app/shared/services/challan.service';
import { DocketService } from 'app/shared/services/docket.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';

@Component({
  selector: 'app-delivery-update-list',
  standalone: true,
  imports:[CommonModule, RouterModule,NgSelectModule,ReactiveFormsModule],
  templateUrl: './delivery-update-list.component.html',
  styleUrl: './delivery-update-list.component.scss'
})
export class DeliveryUpdateListComponent {
  DRSSummaryForm!:FormGroup;

  constructor(public challanService:ChallanService,public docketService:DocketService,private THCService:THCMasterService
){}

ngOnInit(){
  this.buildForm();
  this.getDeliveryDetail();
}

buildForm(){
  this.DRSSummaryForm=new FormGroup({
    LoadingBy:new FormControl(null),
    VendorCode:new FormControl(null),
    LoadingCharge:new FormControl(null),
    Rate:new FormControl(null)
  })
}

    getLoadingCharge(event: any) {
  const data = {
    loadUnloadType: 'L',
    vendorCode: event,
    typeModule: this.docketService.loginUserList.Type === "2" ? "P" : "D",
    chargeType: this.challanService?.filterList?.chrgType,
    brdc: this.docketService.loginUserList.LocationCode,
    loadingBy: this.challanService?.filterList?.loadingBycodeFor,
  };

  this.THCService.getLoadingCharge(data).subscribe({
    next: (response: any) => {
      if(this.challanService.filterList?.loadingBycodeFor === 'XX5'){
      if (response && response.rate && response.rate > 0) {
        this.challanService.challanForm.patchValue({
          rate: response.rate
        });
        this.challanService.avalabledocket.controls.forEach((item: any, index) => {
          this.challanService.avalabledocket.controls[index].patchValue({
            NewRate: response.rate
          });
          // this.israteDisabled = true;
        });

        this.challanService.challanForm.get('rate')?.setErrors(null);
      } else {
        this.challanService.challanForm.patchValue({
          rate: null
        });
        // this.israteDisabled = false;
        this.challanService.challanForm.get('vendorChargesCode')?.setErrors({ rateUnavailable: true });
      }
    }
    },
    error: (err) => {
      console.error('Error fetching loading charge:', err);
    }
  });
}

getDeliveryDetail(){
  const payload={
    drsId:this.docketService.loginUserList.drsId,
    loadBy:this.docketService.loginUserList.loadBy,
    chargeType:this.docketService.loginUserList.chargeType,
    baseLocationCode:this.docketService.loginUserList.LocationCode
  }
  this.THCService.getDeliveryUpdateData(payload).subscribe({
    next: (response: any) => {
     
    },
  })
}

}
