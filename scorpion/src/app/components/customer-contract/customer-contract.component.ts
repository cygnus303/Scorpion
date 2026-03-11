import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-customer-contract',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule],
  templateUrl: './customer-contract.component.html',
  styleUrl: './customer-contract.component.scss'
})
export class CustomerContractComponent {
criteriaform !:FormGroup;

ngOnInit(){
  this.buildForm();
}

buildForm(){
this.criteriaform = new FormGroup({
    contract_Type: new FormControl(null,[Validators.required]),
    contractname: new FormControl(null,[Validators.required])
  });
}
  
}
