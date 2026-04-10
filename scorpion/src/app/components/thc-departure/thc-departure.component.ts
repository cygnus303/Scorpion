import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-thc-departure',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './thc-departure.component.html',
  styleUrl: './thc-departure.component.scss'
})
export class ThcDepartureComponent {
  public departureForm!: FormGroup;
  public departureDetail: any;
  public env = environment;
  public isSubmit: boolean = false;
  public isRedirect: boolean = false;

  constructor(private thcmasterService: THCMasterService, public docketService: DocketService) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'BWH';
      // this.docketService.loginUserList.id = 'VH/PIM/2526/000408';
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.buildForm();
    this.getDepartureDetail()
  }

  buildForm() {
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
    this.departureForm = new FormGroup({
      THCNO: new FormControl(this.docketService.loginUserList.id),
      THCDT: new FormControl(''),
      Route: new FormControl(''),
      Vehno: new FormControl(''),
      ATA: new FormControl(''),
      ETD: new FormControl(''),
      VFS: new FormControl('', Validators.required),
      sealno_in: new FormControl('', [Validators.required, this.sealNoValidator.bind(this)]),
      ATD: new FormControl(formattedDate),
      deptime_flight: new FormControl(formattedTime),
      EmpCode: new FormControl(this.docketService.loginUserList.UserId),
      OutRemarks: new FormControl('Okay', Validators.required),

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

  getDepartureDetail() {
    const payload = {
      thcNo: this.departureForm.value.THCNO,
      baseLocationCode: this.docketService.loginUserList.LocationCode
    }
    this.thcmasterService.getDepartureDetail(payload).subscribe({
      next: (response: any) => {
        this.departureDetail = response.thcDepModel;
        this.departureForm.patchValue({
          THCNO: this.departureDetail.thcno,
          THCDT: this.departureDetail.ATD,
          Route: this.departureDetail.route,
          Vehno: this.departureDetail.vehno,
          ATA: this.departureDetail.ata,
          ETD: this.departureDetail.etd,
        })

        this.thcDepList.clear();
        response.thcDepList.forEach((item: any) => {
          this.thcDepList.push(this.createMFGroup(item));
        });
      }
    })
  }

onsubmit() {
  if(this.departureForm.valid){
    const selectedList = this.thcDepList.value
      .filter((item: any) => item.isChecked === true)
      .map((item: any) => ({
        tcno: item.tcno,
        isChecked: item.isChecked
      }));
    const payload = {
      "thcDepModel": {
        thcno: this.departureForm.value.THCNO,
        atd: new Date(this.departureForm.value.ATD).toISOString(),
        deptime_flight: this.departureForm.value.deptime_flight,
        sealno_in: this.departureForm.value.sealno_in,
        outRemarks: this.departureForm.value.OutRemarks
      },
      "thcDeparterList": selectedList,
      "baseUserName": this.docketService.loginUserList.BaseUserName,
      "baseLocationCode": this.docketService.loginUserList.LocationCode,
      "companyCode": this.docketService.loginUserList.Companycode
    }
      this.isSubmit = true;
    this.thcmasterService.submitTHCDeparture(payload).subscribe({
       next: (response: any) => {
          if (response) {
            this.isRedirect = true;
             window.parent.location.href = `${this.env.liveUrl}Operation/THCDepartureDone?TCNO=${response.tcno}&THCNO=${response.thcno}&src=angular`;
          }
          this.isSubmit = false;
        },
        error: (error) => {
          this.docketService.submitErrorMsg = error?.error?.message;
          this.isSubmit = false;
          this.isRedirect = false;
        }
    })
  }else{
    this.departureForm.markAllAsTouched();
  }
  }

  sealNoValidator(control: FormControl) {
    const value = control.value ? control.value.trim().toUpperCase() : '';
    if (!value) return null;
    if (value === 'OPEN BODY') return null;
    return null;
  }

}
