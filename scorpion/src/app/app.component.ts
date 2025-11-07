import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonService } from './shared/services/common.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonModule } from '@angular/common';
import { DocketService } from './shared/services/docket.service';

@Component({
  selector: 'app-root',
  standalone: true,
   imports: [
     CommonModule,        
    RouterOutlet,
    NgxSpinnerModule,
    BsDatepickerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  title = 'scorpion';

  constructor(public commonService: CommonService,public spinner: NgxSpinnerService,public docketService: DocketService){
     const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      
      this.docketService.loginUserList.Type = '2'
      // this.docketService.loginUserList.fromdt = "01 Mar 2025",
      // this.docketService.loginUserList.todt= "05 Nov 2025",
      // this.docketService.loginUserList.dttyp= '3',
      // this.docketService.loginUserList.paybas= "P02",
      // this.docketService.loginUserList.trn= "1",
      // this.docketService.loginUserList.bustyp= "6",
      // this.docketService.loginUserList.docketList= "",
      // this.docketService.loginUserList.loadingBy= "XX9",
      // this.docketService.loginUserList.chrgType= "1";
      // this.docketService.loginUserList.odaType= "";
      // this.docketService.loginUserList.flag= 2;
      // this.docketService.loginUserList.LocationCode =  'ABA';
      // this.docketService.loginUserList.BookedByType = "B";
      // this.docketService.loginUserList.BookedBy =  'V09778';

      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

}
