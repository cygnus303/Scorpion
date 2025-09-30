import { Component } from '@angular/core';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { DecryptService } from 'app/shared/services/decryptservice ';
import { DocketService } from 'app/shared/services/docket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-docket-edit',
  standalone: false,
  templateUrl: './docket-edit.component.html',
  styleUrl: './docket-edit.component.scss'
})
export default class DocketEditComponent {
  docketNo: string = '';
  constructor(private basicDetailService:BasicDetailService,private docketService:DocketService,private router:Router,private decryptService:DecryptService){}

  ngOnInit() {
      const saved = localStorage.getItem("loginUserList");
      if (saved) {
        this.docketService.loginUserList = JSON.parse(saved);
        this.docketService.Location = this.docketService.loginUserList.LocationCode;
        this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
        this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
      }
    }

  getcheckEditDocket(){
    const payload = {
    docketNo: this.docketNo,
    baseFinYear:this.docketService.loginUserList.FinYear,
    baseCompanyCode:this.docketService.loginUserList.Companycode,
    baseUserName:this.docketService.loginUserList.BaseUserName
  }
    this.basicDetailService.checkEditDocket(payload).subscribe({
      next: (response) => {
        if (response) {
     const payload = {
      ...this.docketService.loginUserList,
        DocketNo: this.docketNo,
        IsFromBillGeneration: "true",
        Type: "2"
      };

  const json = JSON.stringify(payload);   // 🔹 Step 1
  const key = "WebX";                     // 🔹 Step 2
  const encrypted = this.decryptService.encrypt(json, key); // 🔹 Step 3

  this.router.navigate(
    ['/docketFinancialEdit'],
    { queryParams: { data: encrypted } }  // 🔹 Step 4
  );
        }
      }
    });
  }

}
