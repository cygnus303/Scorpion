import { Component } from '@angular/core';
import { DocketService } from 'app/shared/services/docket.service';
import { ArrivalUpdateComponent } from './arrival-update/arrival-update.component';
import { StockUpdateComponent } from './stock-update/stock-update.component';

@Component({
  selector: 'app-arrival-stock-update-list',
  standalone: true,
  imports: [ArrivalUpdateComponent,StockUpdateComponent],
  templateUrl: './arrival-stock-update-list.component.html',
  styleUrl: './arrival-stock-update-list.component.scss'
})
export class ArrivalStockUpdateListComponent {
  constructor(public docketService: DocketService){}
  ngOnInit(){
   const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode =  'ABH';
      // this.docketService.loginUserList.loadBy = "XX9";
      // this.docketService.loginUserList.chargeType='1';
      // this.docketService.loginUserList.id='VH/DDN/2526/000484';
      // this.docketService.loginUserList.Type ='2';
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }
}
