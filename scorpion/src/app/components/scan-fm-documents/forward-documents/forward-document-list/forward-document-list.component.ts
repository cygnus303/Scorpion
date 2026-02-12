import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-forward-document-list',
  standalone: true,
  imports: [CommonModule,NgSelectModule,ReactiveFormsModule,BsDatepickerModule],
  templateUrl: './forward-document-list.component.html',
  styleUrl: './forward-document-list.component.scss'
})
export class ForwardDocumentListComponent {
  public currentDateTime: string = '';
  public forwardDocForm !:FormGroup;
  public  DocToList = [
    { text:"Customer", value : "1" },
    { text:"Location", value : "2" },
  ];

  constructor(public commonService:CommonService){}


ngOnInit() {
   this.setCurrentDateTime();
   this.buildForm();
   this.commonService.dateAccess('58')
  const data = history.state.filterData;
  console.log('Received:', data);
}

buildForm(){
  const data = history.state.filterData;
  this.forwardDocForm=new FormGroup({
    FM_No:new FormControl(null),
    FM_Date:new FormControl(new Date()),
    Manual_FM_No:new FormControl(null),
    FM_Doc_Type:new FormControl(data.DocType),
    Courier_Way_Bill_Date:new FormControl(new Date()),
    Doc_FWD_To:new FormControl(null),
    Courier_Code:new FormControl(null),
    Loc_Cust_Code:new FormControl(null),
    Courier_Way_Bill_No:new FormControl(null)
  })
}

setCurrentDateTime() {
  const now = new Date();

  const day = now.getDate();
  const month = now.getMonth() + 1;   // 👈 month first
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  this.currentDateTime =
    `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}




}
