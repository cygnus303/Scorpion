import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerMasterService } from 'app/shared/services/customer-master.service';
import { CustomerService } from 'app/shared/services/customer.service';

@Component({
  selector: 'app-biling-information',
  standalone: true,
  imports: [CommonModule, NgSelectModule,ReactiveFormsModule],
  templateUrl: './biling-information.component.html',
  styleUrl: './biling-information.component.scss'
})
export class BilingInformationComponent {
  public consignorData:any[]=[];
  public consigneeData:any[]=[];
  public businessData:any[]=[];

  constructor(
    public customerMasterService:CustomerMasterService,
    public customerSerice:CustomerService
  ){}

  ngOnInit(){
   this.customerMasterService.buildCustomerForm();
    this.customerMasterService.buildBillingForm(); 
    this.getConsignorDetail();
    this.getConsigneeDetail();
    this.getBusinessDetail()
  }

  getConsignorDetail(){
  this.customerSerice.GetConsignnorList().subscribe({
    next:(response)=>{
      this.consignorData= response;
    }
  })
}

getConsigneeDetail(){
  this.customerSerice.getConsigneeList().subscribe({
    next:(response)=>{
      this.consigneeData= response;
    }
  })
}

getBusinessDetail(){
  this.customerSerice.getBusinessTypeCategory().subscribe({
    next:(response)=>{
      this.businessData= response;
    }
  })
}
}
