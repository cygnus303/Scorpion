import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationService } from 'app/shared/services/pagination.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-contract-list',
  standalone: true,
  imports:[ReactiveFormsModule,NgSelectModule,FormsModule,RouterModule],
  templateUrl: './vendor-contract-list.component.html',
  styleUrl: './vendor-contract-list.component.scss'
})
export class VendorContractListComponent {
criteriaform!:FormGroup;

constructor(
  public paginationService:PaginationService,
  public router:Router
){}

ngOnInit(){
  this.buildForm()
}

buildForm(){
  this.criteriaform=new FormGroup({

  })
}

   goToBackList() {
    this.router.navigate(['/Master/VendorContract']);
  }

}
