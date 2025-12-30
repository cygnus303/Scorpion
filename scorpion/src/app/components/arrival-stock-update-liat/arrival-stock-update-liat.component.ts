import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-arrival-stock-update-liat',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule],
  templateUrl: './arrival-stock-update-liat.component.html',
  styleUrl: './arrival-stock-update-liat.component.scss'
})
export class ArrivalStockUpdateLiatComponent {
deliveryProcess =[{text:'DELIVERY THROUGH DRS', value:'1'},{text:'DELIVERY ON ARRIVAL', value:'2'}];
 constructor(public docketService: DocketService, public commonService: CommonService) { }

  ngOnInit(){
   const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    
  }

}
