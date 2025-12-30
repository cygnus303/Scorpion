import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BranchWiseLoadingUnloading } from 'app/shared/models/thc-master.model';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-arrival-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule,SharedModule],
  templateUrl: './arrival-update.component.html',
  styleUrl: './arrival-update.component.scss'
})
export class ArrivalUpdateComponent {
public arrivalForm!:FormGroup;
public arrivalDetail:any;
public branchWiseLoadingUnloadingList:BranchWiseLoadingUnloading[]=[];

public Reasonlist=[
{
  text:"Late Dept. of Vehicle", 
  Value :"P84"
},{
  text:"Vehicle break down", 
  value : "P88"
}
]
public Seallist=[
{
  text:'Ok',
  value:'Ok'
},
  {
  text:'Broken',
  value:'Broken'
},  
{
  text:'Unsealed',
  value:'Unsealed'
}
]

 constructor(public docketService: DocketService, public commonService: CommonService,private stockUpdateService:StockUpdateService,public generalMasterService:GeneralMasterService,public THCService:THCMasterService) { }

  ngOnInit(){
    this.buildForm();
    this.generalMasterService.getDeliveryProcessData();
    this.getArrival();
  }


  buildForm(){
    this.arrivalForm=new FormGroup({
      ISN:new FormControl(''),
      s2id_Status:new FormControl(null),
      AD:new FormControl(this.getCurrentDateTime()),
      CLOSEKM:new FormControl(''),
      IR:new FormControl(''),
      Unloder:new FormControl(''),
      LAR:new FormControl(null),
      VendorCode:new FormControl(null),
      Rate:new FormControl(''),
      LoadingCharge:new FormControl('')
    })
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

getArrival(){
  const params={
    id:this.docketService.loginUserList.id,
    loadBy:this.docketService.loginUserList.loadBy,
    chargeType:this.docketService.loginUserList.chargeType,
    BaseLocationCode:this.docketService.loginUserList.LocationCode,
    BaseUserName:this.docketService.loginUserList.BaseUserName
  }
  this.stockUpdateService.getArrivalDetail(params).subscribe({
     next: (response) => {
       this.arrivalDetail=response;
       this.generalMasterService.getLoadingByDetail(this.arrivalDetail.loadingBy);
       this.arrivalForm.patchValue({
        Unloder:this.arrivalDetail.unloder
       });
        this.getPANnumberData(this.arrivalDetail.loadingBy)
      },
  })
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

getLoadingCharge(event: any) {
  const data = {
    loadUnloadType: 'U',
    vendorCode: event,
    typeModule: 'M',
    chargeType: this.docketService.loginUserList.chargeType,
    brdc: this.docketService.loginUserList.LocationCode,
    loadingBy: this.arrivalDetail.loadingBy,
  };
// if(['XX5'].includes(this.DRSSummaryForm.get('LoadingBy')?.value)){
  this.THCService.getLoadingCharge(data).subscribe({
    next: (response: any) => {
    this.arrivalForm.patchValue({
        Rate:response.rate
      });

    },
    error: (err) => {
      console.error('Error fetching loading charge:', err);
    }
  });
// }
  this.calculateCharge()
}

calcRate() {
  let Charges = 0;

  const loadingBy = this.arrivalDetail.loadingBy;
  const rateType = this.arrivalDetail.rateType;

  const rate = Number(this.arrivalForm.get('Rate')?.value || 0);
  const chrgwt = this.arrivalDetail.chrgwt||0;
  const noofpkg = this.arrivalDetail.pkgsno || 0;

  if (loadingBy !== 'XX9') {
    let maxlimitcalculation = 0;

    if (rateType === '4') {
      maxlimitcalculation = rate / chrgwt;

      if (maxlimitcalculation > 5) {
        // this.showRateError();
        return;
      }
    }
    else if (rateType === '3') {
      maxlimitcalculation = (rate * noofpkg) / chrgwt;

      if (maxlimitcalculation > 5) {
        // this.showRateError();
        return;
      }
    }
    else {
      if (rate > 5) {
        // this.showRateError();
        return;
      }
    }

    // this.hideRateError();
  }

  switch (rateType) {
    case '1':
      Charges = rate * chrgwt;
      break;

    case '2':
      Charges = rate;
      break;

    case '3':
      Charges = rate * noofpkg;
      break;

    case '4':
      Charges = rate;
      break;
  }
this.arrivalForm.patchValue({
  loadingCharge:Charges.toFixed(2)
})
}

rateErrorMsg:any;
validateRate(): boolean {
  const loadingBy = this.arrivalDetail.loadingBy;

  // Skip validation if 'LoadingBy' is 'XX9'
  if (loadingBy === 'XX9') {
    return true;
  }

  const rateType = this.arrivalDetail.rateType;
  const rate = parseFloat(this.arrivalForm.get('Rate')?.value || '0') || 0;
  const chrgwt = parseFloat(this.arrivalDetail.chrgwt || '0') || 0;
  const noofpkg = parseFloat(this.arrivalDetail.pkgsno || '0') || 0;

  let maxlimitcalculation = 0;

  if (rateType === '4') {
    if (chrgwt === 0) return false;
    maxlimitcalculation = rate / chrgwt;
  }
  else if (rateType === '3') {
    if (chrgwt === 0) return false;
    maxlimitcalculation = (rate * noofpkg) / chrgwt;
  }
  else {
    maxlimitcalculation = rate;
  }

  // 🔴 MAX LIMIT CHECK
  if (maxlimitcalculation > 5) {
    this.rateErrorMsg = 'Rate Amount Is High Please Check';
    this.arrivalForm.patchValue({ Rate: '0.00' });
    return false;
  }

  // ✅ VALID
  this.rateErrorMsg = '';
  return true;
}


  calculateCharge() {
    const isValid = this.validateRate();
    if (!isValid) {this.arrivalForm.patchValue({LoadingCharge: (0).toFixed(2)})
      return;
    }
    const rateType = this.arrivalDetail.rateType;
    const newRate = parseFloat(this.arrivalForm.get('Rate')?.value || 0);
    const actuwt = parseFloat(this.arrivalDetail.chrgwt || 0);
    const pkgsno = parseFloat(this.arrivalDetail.pkgsno || 0);
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
    this.arrivalForm.patchValue({
      LoadingCharge: charge.toFixed(2)
    })
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

