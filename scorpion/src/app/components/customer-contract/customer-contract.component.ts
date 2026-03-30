import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { Modal } from 'bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-customer-contract',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule,BsDatepickerModule],
  templateUrl: './customer-contract.component.html',
  styleUrl: './customer-contract.component.scss'
})
export class CustomerContractComponent {
  criteriaform !:FormGroup;
  contractForm !:FormGroup;
  public isAddContract :boolean= false;
  public isGetList:boolean = false;
  public showAddContractModal: boolean = false;
   public PayBsList:any[]=[];


  constructor(
    public docketService: DocketService,
    public THCMasterService:THCMasterService){}

  ngOnInit(){
    this.buildForm();
    this.buildContractForm();
    this.getPaybs();
  }

  buildForm(){
    this.criteriaform = new FormGroup({
      contract_Type: new FormControl(null,[Validators.required]),
      contractname: new FormControl(null,[Validators.required]),
      custaccperson:new FormControl(null),
      startdate:new FormControl(new Date()),
      enddate:new FormControl(new Date())
    });
  }

  buildContractForm(){
    this.contractForm = new FormGroup({
      custaccperson: new FormControl(null,[Validators.required]),
      startdate: new FormControl(new Date(),[Validators.required]),
      enddate: new FormControl(new Date(),[Validators.required])
    });
  }

  // openAddContractModal(){
  //   this.showAddContractModal = true;
  // }

  closeAddContractModal(){
    this.showAddContractModal = false;
    this.contractForm.reset();
  }

  submitContract(){
    if(this.contractForm.valid){
      console.log('Contract submitted:', this.contractForm.value);
      // Add your submission logic here
      this.closeAddContractModal();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contractForm.controls).forEach(key => {
        this.contractForm.get(key)?.markAsTouched();
      });
    }
  }

    getPaybs() {
    this.THCMasterService.getGeneralMasterDetail('PAYTYP').subscribe({ next: (response) => {
        if (response.success) {
          this.PayBsList = [
          {
            codeId: 'P00',
            codeDesc: 'All'
          },
          ...response.data
        ];
        }
      }
    });
  }

  addNewContract(){
    this.isAddContract = true;
    console.log('Add new contract clicked');
  }

  onSubmit(){
    console.log('Submit contract clicked');
    this.isAddContract = false;
  }

  resetForm(){
    this.criteriaform.reset();
    // Reset form to initial values
    this.buildForm();
  }

  getCustomerContractList(){
    this.isGetList = true;
    console.log('Get customer contract list clicked');
  }

  openAddContractModal() {
    const modalElement: any = document.getElementById('exampleModalLong');

    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
}

closeModal() {
  const modal = document.getElementById('addContractModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
}
}
