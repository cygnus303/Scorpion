import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChallanService } from 'app/shared/services/challan.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';

@Component({
  selector: 'app-delivery-update-list',
  standalone: true,
  imports:[CommonModule, RouterModule,NgSelectModule,ReactiveFormsModule],
  templateUrl: './delivery-update-list.component.html',
  styleUrl: './delivery-update-list.component.scss'
})
export class DeliveryUpdateListComponent {
  public DRSSummaryForm!:FormGroup;
  public DRSInformation!:any;

  constructor(public challanService:ChallanService,public docketService:DocketService,private THCService:THCMasterService,public generalMasterService:GeneralMasterService){}

ngOnInit(){
  this.buildForm();
  this.getDeliveryDetail();
  this.generalMasterService.getChargeTypeData();
  this.generalMasterService.getLoadingBy()
}

buildForm(){
  this.DRSSummaryForm = new FormGroup({
    LoadingBy:new FormControl(null),
    vendorCode:new FormControl(null),
    LoadingCharge:new FormControl(null),
    Rate:new FormControl(null),
    closeKM:new FormControl(0),
    ratetype:new FormControl(null),
    drsList: new FormArray([]) 
  })
}

get drsList(): FormArray {
  return this.DRSSummaryForm.get('drsList') as FormArray;
}

createDrsRow(item: any): FormGroup {
  return new FormGroup({
    autoNo: new FormControl(item.autoNo),
    dockno: new FormControl(item.dockno),
    booking_Date: new FormControl(item.booking_Date),
    orgncd: new FormControl(item.orgncd),
    destcd: new FormControl(item.destcd),
    payBasis: new FormControl(item.payBasis),
    csgncd: new FormControl(item.csgncd),
    csgnnm: new FormControl(item.csgnnm),
    csgecd: new FormControl(item.csgecd),
    csgenm: new FormControl(item.csgenm),
    actQty:new FormControl(item.actQty),
    pkgQty:new FormControl(item.pkgQty),
    pkgs_Pending: new FormControl(item.pkgs_Pending),
    pkgs_Arrived: new FormControl(item.pkgs_Arrived),
    pkgs_Booked: new FormControl(item.pkgs_Booked),
    comm_Dely_Dt: new FormControl(item.comm_Dely_Dt),
    deliveredPkgs: new FormControl(item.pkgs_Arrived),
    remarks: new FormControl(''),
    isChecked: new FormControl(item.isChecked),
    isBadPod: new FormControl(item.isEnabledBadPodoption),
    ratetype: new FormControl(item.rateType),  
    newRate: new FormControl(item.rate),
    otp: new FormControl(''),
    showReason: new FormControl(false),
    highlight: new FormControl(false),
    reason: new FormControl(''),
    cboReason:new FormControl()
  });
}

// in TS
getRadioControl(i: number): FormControl {
  return (this.drsList.at(i) as FormGroup).get('isBadPod') as FormControl;
}

getDeliveryDetail() {
  const payload = {
    drsId: this.docketService.loginUserList.drsId,
    loadBy: this.docketService.loginUserList.loadBy,
    chargeType: this.docketService.loginUserList.chargeType,
    baseLocationCode: this.docketService.loginUserList.LocationCode
  };
  this.THCService.getDeliveryUpdateData(payload).subscribe({next: (response: any) => {
      this.DRSInformation = response.data.drsDeliveryList[0];
      const summaryRateType = response.data.drsSummary?.rateType;
      this.DRSSummaryForm.patchValue({
        closeKM: this.DRSInformation?.closeKM,
        LoadingBy:response.data.drsSummary.loadingBy
      });
      const docketList = response.data.updateDRSLits || [];
      this.drsList.clear();
      docketList.forEach((item: any) => {
        item.rateType = summaryRateType; 
        this.drsList.push(this.createDrsRow(item));
      });
      this.getPANnumberData(response.data.drsSummary.loadingBy);
    },
    error: (err) => {
      console.error('Delivery Detail API Error', err);
    }
  });
}

getPANnumberData(vendorCode:any){
   const ChargedBy = vendorCode;
    if (ChargedBy === 'B' || ChargedBy == '04') {
      this.challanService.getChargesVendorsList('04');
    }
    if (ChargedBy === 'A' || ChargedBy == 'XX1') {
      this.challanService.getChargesVendorsList('XX1');
    }
    if (ChargedBy === 'M') {
      this.challanService.getChargesVendorsList('19');
    }
    if (ChargedBy === 'XX5' || ChargedBy === 'XX8') {
      this.challanService.branchWiseLoadingUnloading(vendorCode);
    }
}

onDeliveredBlur(index: number): void {
  const row = this.drsList.at(index) as FormGroup;

  const delivered = Number(row.get('deliveredPkgs')?.value || 0);
  const pending = Number(row.get('pkgs_Pending')?.value || 0);
  const reasonCtrl = row.get('reason');

  // 🔴 CASE 1: Delivered = 0 → UNDELY ONLY
  if (delivered === 0) {
    row.patchValue({
      showReason: true,
      highlight: false
    });

    this.generalMasterService.getReason('UNDELY');
    reasonCtrl?.setValidators([Validators.required]);
  }

  // 🟠 CASE 2: Delivered > 0 AND Delivered < Pending → LATE_D
  else if (delivered < pending) {
    row.patchValue({
      showReason: true,
      highlight: false
    });

    this.generalMasterService.getReason('LATE_D');
    reasonCtrl?.setValidators([Validators.required]);
  }

  // 🟢 CASE 3: Delivered >= Pending → NO reason
  else {
    row.patchValue({
      showReason: false,
      highlight: true
    });

    reasonCtrl?.clearValidators();
  }

  reasonCtrl?.updateValueAndValidity();
}


}
