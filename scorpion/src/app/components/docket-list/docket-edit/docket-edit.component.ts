import { Component } from '@angular/core';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';

@Component({
  selector: 'app-docket-edit',
  standalone: false,
  templateUrl: './docket-edit.component.html',
  styleUrl: './docket-edit.component.scss'
})
export default class DocketEditComponent {
  public completiondata:any;


  constructor(
    private basicDetailService:BasicDetailService
  )
  {}

  ngOnInit(){
    this.getCompletionData()
  }

  getCompletionData(){
    const payload={
  docketNo: "52630",
  isFromBillGeneration: "true",
  type: "1",
  baseLocationCode: "PIM",
  baseCompanyCode: "C003",
  baseUserName: "cygnusteam"
    }
    this.basicDetailService.getCompletion(payload).subscribe({
      next: (response) => {
        if (response) {
          this.completiondata = response;
        }
      }
    });
  }



}
