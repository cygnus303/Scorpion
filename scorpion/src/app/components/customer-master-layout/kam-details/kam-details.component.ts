import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerMasterService } from 'app/shared/services/customer-master.service';
import { CustomerService } from 'app/shared/services/customer.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { response } from 'express';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-kam-details',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule,ReactiveFormsModule],
  templateUrl: './kam-details.component.html',
  styleUrl: './kam-details.component.scss'
})
export class KamDetailsComponent {
  public notFoundEmployeeValue = 'Please enter at least 1 characters';
  public employeeList:any[]=[];

  constructor(
    public generalMasterService:GeneralMasterService,
    private customerService:CustomerService,
    public customerMasterService:CustomerMasterService,
    private docketService:DocketService
  ){}

  ngOnInit(){
    this.customerMasterService.buildKAMForm();
    this.generalMasterService.getKMADetail();
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.Location = 'TNP';
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

  getEmployeeDetail(event:any){
    const searchText = event.term;

    if (!searchText || searchText.length < 1) {
        this.employeeList = [];
        this.notFoundEmployeeValue = 'Please enter at least 1 characters';
    }
        this.notFoundEmployeeValue = 'searching...';

    this.customerService.getEmployeeDropdown(searchText,this.docketService.loginUserList.BaseUserName).subscribe({
      next:(response)=>{
        if(response){
          this.employeeList=response;
          this.notFoundEmployeeValue = 'Please enter at least 1 character';
        }


      }
    })
  }

  onChangeEmployeeName(event: any, index: number) {
  this.customerService.getEmployeeDetail(event).subscribe({
    next: (response) => {
      if (response && response.isRecordFound) {
        this.customerMasterService.KAMArray.at(index).patchValue({
          EmployeeID: response.userId,
          Mobile: response.mobileNo,
          Email: response.emailId
        });
      }
    }
  });
}

}
