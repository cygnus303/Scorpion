import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CustomerMasterService } from 'app/shared/services/customer-master.service';

@Component({
  selector: 'app-gst-details',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './gst-details.component.html',
  styleUrl: './gst-details.component.scss'
})
export class GstDetailsComponent {

 constructor(
  public customerMasterService:CustomerMasterService
 ){}

 ngOnInit() {
  this.customerMasterService.buildGSTForm();
}


}
