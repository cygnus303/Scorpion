import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';

@Component({
  selector: 'app-thc-departure',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,NgSelectModule],
  templateUrl: './thc-departure.component.html',
  styleUrl: './thc-departure.component.scss'
})
export class ThcDepartureComponent {
  public departureForm!:FormGroup;
  public departureDetail:any;

  constructor(private thcmasterService:THCMasterService,public docketService:DocketService){}

  ngOnInit(){
     const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
       this.docketService.loginUserList.LocationCode =  'BWH';
      // this.docketService.loginUserList.loadBy = "";
      // this.docketService.loginUserList.chargeType='';
      this.docketService.loginUserList.id='VH/PIM/2526/000408';
      // this.docketService.loginUserList.Type ='2';
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.buildForm();
    this.getDepartureDetail()
  }

  buildForm(){
      const now = new Date();

  // 👉 Format: 08 Apr 2026
  const day = String(now.getDate()).padStart(2, '0');
  const month = now.toLocaleString('en-GB', { month: 'short' });
  const year = now.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  // 👉 Format: 18:03
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;
    this.departureForm=new FormGroup({
      THCNO: new FormControl(this.docketService.loginUserList.id),
      THCDT: new FormControl(''),
      Route: new FormControl(''),
      Vehno: new FormControl(''),
      ATA:new FormControl(''),
      ETD: new FormControl(''),
      VFS:new FormControl(''),
      sealno_in:new FormControl(''),
      ATD:new FormControl(formattedDate),
      deptime_flight:new FormControl(formattedTime),
      EmpCode:new FormControl(this.docketService.loginUserList.UserId),
      OutRemarks:new FormControl(''),

       thcDepList: new FormArray([])
    })
  }

  get thcDepList(): FormArray {
  return this.departureForm.get('thcDepList') as FormArray;
}

createMFGroup(item: any): FormGroup {
  return new FormGroup({
    isChecked: new FormControl(item.isChecked),
    tcno: new FormControl(item.tcno),
    tcbr: new FormControl(item.tcbr),
    mF_Date: new FormControl(item.mF_Date),
    toBH_Code: new FormControl(item.toBH_Code),
    tot_dkt: new FormControl(item.tot_dkt),
    pkgs: new FormControl(item.pkgs),
    wts: new FormControl(item.wts)
  });
}

  getDepartureDetail(){
    const payload={
      thcNo: this.departureForm.value.THCNO,
      baseLocationCode:this.docketService.loginUserList.LocationCode
    }
     this.thcmasterService.getDepartureDetail(payload).subscribe({
        next:(response:any)=>{
          this.departureDetail = response.thcDepModel;
          this.departureForm.patchValue({
            THCNO: this.departureDetail.thcno,
            THCDT:this.departureDetail.ATD,
            Route: this.departureDetail.route,
            Vehno: this.departureDetail.vehno,
            ATA: this.departureDetail.ata,
            ETD: this.departureDetail.etd,
          })

          this.thcDepList.clear();

      // 👉 Add rows
      response.thcDepList.forEach((item: any) => {
        this.thcDepList.push(this.createMFGroup(item));
      });
        }
    })
  }

  onsubmit(){
    const selectedList = this.thcDepList.value
    .filter((item: any) => item.isChecked === true)
    .map((item: any) => ({
      tcno: item.tcno,
      isChecked: item.isChecked
    }));
    const payload={
      "thcDepModel": {
          thcno: this.departureForm.value.THCNO,
          atd: new Date(this.departureForm.value.ATD).toISOString(),
          deptime_flight: this.departureForm.value.deptime_flight,
          sealno_in:this.departureForm.value.sealno_in,
          outRemarks: this.departureForm.value.OutRemarks
        },
        "thcDeparterList":selectedList,
        "baseUserName": this.docketService.loginUserList.BaseUserName,
        "baseLocationCode": this.docketService.loginUserList.LocationCode,
        "companyCode":this.docketService.loginUserList.Companycode
    }
    this.thcmasterService.submitTHCDeparture(payload).subscribe({
        next:(res)=>{
          console.log(res);
        }
    })
  }

}
