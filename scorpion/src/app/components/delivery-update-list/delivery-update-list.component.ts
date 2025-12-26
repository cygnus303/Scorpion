import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { mobileNo } from 'app/shared/constants/common';
import { BranchWiseLoadingUnloading } from 'app/shared/models/thc-master.model';
import { ChallanService } from 'app/shared/services/challan.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

@Component({
  selector: 'app-delivery-update-list',
  standalone: true,
  imports:[CommonModule, RouterModule,NgSelectModule,ReactiveFormsModule,BsDatepickerModule,SharedModule],
  templateUrl: './delivery-update-list.component.html',
  styleUrl: './delivery-update-list.component.scss'
})
export class DeliveryUpdateListComponent {
  public DRSSummaryForm!:FormGroup;
  public DRSInformation!:any;
  public minDate: Date | undefined;
  public maxDate = new Date();
  public branchWiseLoadingUnloadingList:BranchWiseLoadingUnloading[]=[];


  constructor( public challanService:ChallanService, public docketService:DocketService,private THCService:THCMasterService,public generalMasterService:GeneralMasterService){}

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
    LoadingCharge:new FormControl(0,[Validators.required, Validators.min(0.01)]),
    Rate:new FormControl(null),
    closeKM:new FormControl(0),
    ratetype:new FormControl(null),
    drsList: new FormArray([])
  })
}

get drsList(): FormArray {
  return this.DRSSummaryForm.get('drsList') as FormArray;
}

getCurrentDateTime(): string {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; // 12-hour format

  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
}


  createDrsRow(data: any[]) {
  data.forEach((item) => {
     const [day, month, year] = item.booking_Date.split('/');
     const formattedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      const group = new FormGroup({
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
        actQty: new FormControl(item.actQty),
        pkgQty: new FormControl(item.pkgQty),
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
        totalLoadingCharge: new FormControl(''),
        showReason: new FormControl(false),
        highlight: new FormControl(false),
        reason: new FormControl(''),
        showDeliveryInfo: new FormControl(false),
        DELYDATE: new FormControl(this.getCurrentDateTime()),
        DELYPERSON: new FormControl(''),
        cboReason:new FormControl(),
        cboLateReason:new FormControl(),
        minDate:new FormControl(formattedDate)
      });
      group.get('ratetype')?.valueChanges.subscribe(() => this.calculateCharge(group));
      group.get('newRate')?.valueChanges.subscribe(() => this.calculateCharge(group));
      this.drsList.push(group);
    });
  }

  calculateCharge(group: FormGroup) {
    const rateType = group.get('ratetype')?.value;
    const newRate = parseFloat(group.get('newRate')?.value || 0);
    const actuwt = parseFloat(group.get('actQty')?.value || 0);
    const pkgsno = parseFloat(group.get('pkgQty')?.value || 0);
    let charge = 0;
    switch (rateType) {
      case '1': // PER KG
        charge = actuwt * newRate;
        break;
      case '3': // PER PACKAGES
        charge = pkgsno * newRate;
        break;
      case '4': // FLAT
        charge = newRate;
        break;
      default:
        charge = 0;
    }
    group.get('totalLoadingCharge')?.setValue(charge.toFixed(2), { emitEvent: false });
    this.updateTotalLoadingCharge()
  }

   getMinDate(bookingDate: string): Date {
    return new Date(bookingDate);
  }

updateTotalLoadingCharge() {
   const total = this.drsList.controls.reduce((sum, ctrl) => {
      return sum + parseFloat(ctrl.get('totalLoadingCharge')?.value || 0);
  }, 0);

  this.DRSSummaryForm.get('LoadingCharge')?.setValue(total.toFixed(2), { emitEvent: false });
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
      });
      this.createDrsRow(docketList);
      this.getPANnumberData(response.data.drsSummary.loadingBy);
    },
    error: (err) => {
      console.error('Delivery Detail API Error', err);
    }
  });
}

getLoadingCharge(event: any) {
  const data = {
    loadUnloadType: 'U',
    vendorCode: event,
    typeModule: this.docketService.loginUserList.Type === "2" ? "P" : "D",
    chargeType: this.docketService.loginUserList.chargeType,
    brdc: this.docketService.loginUserList.LocationCode,
    loadingBy: this.DRSSummaryForm.value.LoadingBy,
  };
if(['XX5'].includes(this.DRSSummaryForm.get('LoadingBy')?.value)){
  this.THCService.getLoadingCharge(data).subscribe({
    next: (response: any) => {
    this.DRSSummaryForm.patchValue({
        Rate:response.rate
      });
      this.drsList.controls.forEach((item: any, index) => {
        this.drsList.controls[index].patchValue({
          newRate: response.rate,
        });
      });
    },
    error: (err) => {
      console.error('Error fetching loading charge:', err);
    }
  });
}
}

getPANnumberData(vendorCode:any){
   const ChargedBy = vendorCode;
    if (ChargedBy === 'B' || ChargedBy == '04') {
      this.getChargesVendorsList('04');
    }
    if (ChargedBy === 'A' || ChargedBy == 'XX1') {
      this.getChargesVendorsList('XX1');
    }
    if (ChargedBy === 'M') {
      this.getChargesVendorsList('19');
    }
    if (ChargedBy === 'XX5' || ChargedBy === 'XX8') {
      this.branchWiseLoadingUnloading(vendorCode);
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

    this.generalMasterService.getReason('PART_D');
    
    reasonCtrl?.setValidators([Validators.required]);
  }
  else if (delivered > pending) {
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


  branchWiseLoadingUnloading(event: any) {
    const data = {
      vendorType: event,
      baseLocationCode: this.docketService.loginUserList.LocationCode,
      type: 'U',
    }
    this.THCService.getBranchWiseLoadingUnloadingVendorList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.branchWiseLoadingUnloadingList = response.data;
        }
      },
    });
  }

  getChargesVendorsList(event: any) {
    const data = {
      vendorType: event?.codeId ? event?.codeId : event,
      branchCode: this.docketService.loginUserList.LocationCode,
      userName: this.docketService.loginUserList.BaseUserName,
      documentType: this.docketService.loginUserList.Type
    }
    this.THCService.getVendorsList(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.branchWiseLoadingUnloadingList = response.data.map((x: any) => ({
            value: x.vendor_Code,
            text: x.vendor_Name
          }));
        }
      },
    });
  }

}
