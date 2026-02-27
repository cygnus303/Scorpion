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
      // this.docketService.loginUserList.LocationCode =  'KOL';
      // this.docketService.loginUserList.Type = '1';
      // this.docketService.loginUserList.loadBy = "B";
      // this.docketService.loginUserList.chargeType='1';
      // this.docketService.loginUserList.drsId='DS/PIM/2526/002766';
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  }

}
