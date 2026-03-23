import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerMasterService } from 'app/shared/services/customer-master.service';
import { CustomerService } from 'app/shared/services/customer.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DocketService } from 'app/shared/services/docket.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { PRSGeneralMasterResponse } from 'app/shared/models/thc-master.model';

@Component({
  selector: 'app-kam-details',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './kam-details.component.html',
  styleUrl: './kam-details.component.scss'
})
export class KamDetailsComponent {
  public notFoundEmployeeValue = 'Please enter at least 1 characters';
  public employeeList: any[] = [];
  public KMAList: PRSGeneralMasterResponse[] = [];


  constructor(
    public generalMasterService: GeneralMasterService,
    private customerService: CustomerService,
    public customerMasterService: CustomerMasterService,
    private docketService: DocketService,
    private THCMasterService: THCMasterService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.Location = 'TNP';
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.customerMasterService.buildKAMForm();
    this.getKMADetail();
  }

  getEmployeeDetail(event: any) {
    const searchText = event.term;

    if (!searchText || searchText.length < 1) {
      this.employeeList = [];
      this.notFoundEmployeeValue = 'Please enter at least 1 characters';
    }
    this.notFoundEmployeeValue = 'searching...';

    this.customerService.getEmployeeDropdown(searchText, this.docketService.loginUserList.BaseUserName).subscribe({
      next: (response) => {
        if (response) {
          this.employeeList = response;
          this.notFoundEmployeeValue = 'No matches found';
        } else {
          this.employeeList = [];
          this.notFoundEmployeeValue = '';
        }
      }, error: () => {
        this.employeeList = [];
        this.notFoundEmployeeValue = '';
      }
    })
  }

  onOpenDropdown() {
    this.employeeList = [];
    this.notFoundEmployeeValue = 'Please enter at least 1 character';
  }

  onChangeEmployeeName(event: any, index: number) {
    if (!event) {
      this.customerMasterService.KAMArray.at(index).patchValue({
        EmployeeID: null,
        Designation: null,
        Mobile: null,
        Email: null
      });
      return;
    }

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

  getKMADetail() {
    this.THCMasterService.getGeneralMasterDetail('KMA').subscribe({
      next: (response) => {
        if (response.success) {
          this.KMAList = response.data;
          this.customerMasterService.setKAMRows(response.data);
        }
      }
    });
  }

}