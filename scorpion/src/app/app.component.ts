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

  // public loading: string = 'disable';
  constructor(public commonService: CommonService,public spinner: NgxSpinnerService,public docketService: DocketService){
     const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.loginUserList.Type = '1'
      this.docketService.loginUserList.LocationCode =  'NAG';
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    // this.commonService.isLoading.subscribe({
    //   next: (response) => {
    //     setTimeout(()=>{
    //       if (response != null) {
    //         this.loading = response ? 'enable' : 'disable';
    //       }
    //     },500)
    //   },
    //   error: (response: any) => {},
    // });
  }
  
  // ngOnInit() {
  //   this.spinner.show();
  //   setTimeout(() => {
  //     this.spinner.hide();
  //   }, 5000);
  // }

}
