import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PFMService } from 'app/shared/services/pfm.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-view-print-fmreport-query',
  standalone: true,
  imports: [CommonModule,NgSelectModule,BsDatepickerModule,ReactiveFormsModule],
  templateUrl: './view-print-fmreport-query.component.html',
  styleUrl: './view-print-fmreport-query.component.scss'
})
export class ViewPrintFMReportQueryComponent {
  public viewFilterForm !:FormGroup;
  public ROData:any;
  public locationList:any;


constructor(
  private router: Router,
  public commonService: CommonService,
  public pfmService:PFMService,
  public docketService:DocketService
) { }

ngOnInit(){
  this.buildForm();
  this.getLocationData();
}

buildForm(){
   const endDate = new Date(); // aaje ni date
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);
  this.viewFilterForm = new FormGroup({
    RO:new FormControl(null,[Validators.required]),
    Loccode:new FormControl(null,[Validators.required]),
    FmNo:new FormControl(null),
    dateRange:new FormControl([startDate, endDate]),
    fM_Status:new FormControl('All')
  })
}

getLocationData(){
  this.pfmService.getROList(this.docketService.loginUserList.LocationCode).subscribe({
    next:(response)=>{
        this.ROData= response;
    }
  })
}

getLocationListFromROList(event:any){
  this.pfmService.GetLocationListFromRO(event).subscribe({
    next:(response)=>{
        this.locationList= response;
    }
  })
}


 goToForwardList() {
  if(this.viewFilterForm.valid){
    this.router.navigate(['/Document/FMReport'],{ state: { filterData: this.viewFilterForm.value } });

  }else{
    this.viewFilterForm.markAllAsTouched();
  }
  }
}
