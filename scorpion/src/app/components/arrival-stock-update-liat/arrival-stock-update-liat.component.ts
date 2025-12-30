import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormControlName, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-arrival-stock-update-liat',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule,SharedModule],
  templateUrl: './arrival-stock-update-liat.component.html',
  styleUrl: './arrival-stock-update-liat.component.scss'
})
export class ArrivalStockUpdateLiatComponent {
  public arrivalForm!:FormGroup;
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

 constructor(
  public docketService: DocketService, 
  public commonService: CommonService
) { }

  ngOnInit(){
   const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.buildForm()
  }


  buildForm(){
    this.arrivalForm=new FormGroup({
      ISN:new FormControl(''),
      s2id_Status:new FormControl(''),
      AD:new FormControl(this.getCurrentDateTime()),
      CLOSEKM:new FormControl(''),
      IR:new FormControl(''),
      Unloder:new FormControl(this.docketService.loginUserList.BaseUserName),
      LAR:new FormControl('')
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
}
