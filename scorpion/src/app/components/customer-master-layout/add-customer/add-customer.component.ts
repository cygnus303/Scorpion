import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerMasterService } from 'app/shared/services/customer-master.service';
import { CustomerService } from 'app/shared/services/customer.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { response } from 'express';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, NgSelectModule, RouterModule,ReactiveFormsModule,BsDatepickerModule],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent {

  constructor(
    public customerMasterService:CustomerMasterService,
    public customerService:CustomerService,
    public generalMasterService:GeneralMasterService,
    private docketService:DocketService
  ){}

  ngOnInit(){
    this.customerMasterService.buildCustomerForm();
    this.customerMasterService.buildBillingForm(); 
    this.generalMasterService.getIndustryDetail();
    this.generalMasterService.getOwnerDetail();
  }

  validatePanKey(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const position = value.length;
  const char = event.key;

  if (event.ctrlKey || event.metaKey || char === 'Backspace' || char === 'Tab') {
    return;
  }

  if (position >= 0 && position <= 4) {
    if (!/[a-zA-Z]/.test(char)) {
      event.preventDefault();
    }
  }

  else if (position >= 5 && position <= 8) {
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
    }
  }

  else if (position === 9) {
    if (!/[a-zA-Z]/.test(char)) {
      event.preventDefault();
    }
  }

  if (position >= 10) {
    event.preventDefault();
  }
}

  onPanInput(event: any) {
    let value = event.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');

    let formatted = '';

    formatted += value.substring(0, 5).replace(/[^A-Z]/g, '');

    formatted += value.substring(5, 9).replace(/[^0-9]/g, '');

    formatted += value.substring(9, 10).replace(/[^A-Z]/g, '');

    event.target.value = formatted;

    this.customerMasterService.customerForm
      .get('pan_no')
      ?.setValue(formatted, { emitEvent: false });
  }

  onGSTInput(event: any) {
    let value = event.target.value.toUpperCase();
    let formatted = '';

    for (let i = 0; i < value.length; i++) {
      let char = value[i];

      if (i < 2) {
        if (/[0-9]/.test(char)) formatted += char;
      } 
      else if (i >= 2 && i < 7) {
        if (/[A-Z]/.test(char)) formatted += char;
      } 
      else if (i >= 7 && i < 11) {
        if (/[0-9]/.test(char)) formatted += char;
      } 
      else if (i === 11) {
        if (/[A-Z]/.test(char)) formatted += char;
      } 
      else if (i === 12) {
        if (/[1-9A-Z]/.test(char)) formatted += char;
      } 
      else if (i === 13) {
        if (char === 'Z') formatted += char;
      } 
      else if (i === 14) {
        if (/[0-9A-Z]/.test(char)) formatted += char;
      }
    }

    this.customerMasterService.customerForm.get('GSTNO')?.setValue(formatted, { emitEvent: false });

    const gstNo = event.target.value?.toUpperCase();

    if (gstNo && gstNo.length === 15) {
    this.customerMasterService.getGSTData(gstNo);
  }
  }






}
