import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationService } from 'app/shared/services/pagination.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MasterService } from 'app/shared/services/master.service';

@Component({
  selector: 'app-vendor-contract-list',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, FormsModule, RouterModule,CommonModule],
  templateUrl: './vendor-contract-list.component.html',
  styleUrl: './vendor-contract-list.component.scss'
})
export class VendorContractListComponent {
  public criteriaform!: FormGroup;
  public notFoundTextValue = 'Please enter at least 1 characters';
  public AttechedTypelist=[{ text:'Route based for THC and Distance based for PRS/DRS', value : 'RB'}];
  public Contractlist=[ { text:'Vendor', value : '1'}]
  public vendorTypeList = [
    { text:'Attached', value : 'XX1'},
    { text:'Business Associate', value : '04'}
  ];
  public vendorList: any[] = [];
  constructor(public paginationService: PaginationService, public router: Router, public masterService:MasterService) { }

  ngOnInit() {
    this.buildForm();
    this.OnChangeVendorType();
  }

  buildForm() {
    this.criteriaform = new FormGroup({
      VedorType:new FormControl(null,[Validators.required]),
      ContractType:new FormControl(null),
      ContractFor:new FormControl(null),
      VendorCode:new FormControl(null,[Validators.required])
    })
  }

  OnChangeVendorType(){
    this.criteriaform.get('VedorType')?.valueChanges.subscribe(value => {
    const contractTypeControl = this.criteriaform.get('ContractType');
    const contractForControl = this.criteriaform.get('ContractFor');

    if (value === 'XX1') {
      // Add required validator
      contractTypeControl?.setValidators([Validators.required]);
      contractForControl?.setValidators([Validators.required]);
    } else {
      // Remove validator
      contractTypeControl?.clearValidators();
      contractForControl?.clearValidators();

      // Reset values when hidden
      contractTypeControl?.setValue(null);
      contractForControl?.setValue(null);
    }

    // Update validation status
    contractTypeControl?.updateValueAndValidity();
    contractForControl?.updateValueAndValidity();
  });
  }

getVendorList(searchTerm: string = '') {
  const params = {
    flag: 'Add',
    vendorType: this.criteriaform.get('VedorType')?.value,
    searchTerm: searchTerm
  };

  this.masterService.getVendorData(params).subscribe({
    next: (response: any) => {
      this.vendorList = response
    }
  });
}

  resetVendorDropdown() {
    this.vendorList = [];
    this.notFoundTextValue = 'Enter at least 3 characters';
  }

  getContractList(){
    if(this.criteriaform.valid){

    }else{
      this.criteriaform.markAllAsTouched()
    }
  }

  goToBackList() {
    this.router.navigate(['/Master/VendorContract']);
  }
}
