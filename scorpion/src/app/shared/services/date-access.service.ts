import { Injectable } from '@angular/core';
import { BasicDetailService } from './basic-detail.service';
import { DocketService } from './docket.service';

@Injectable({
  providedIn: 'root'
})
export class DateAccessService {

  constructor(
    public basicDetailService:BasicDetailService,
    public docketService:DocketService
  ) { }

  userDateSelection(){
    // const payload={
    //    moduleCode: event.target.value,
    //    baseUserName:this.docketService.baseUsername

    // }
    // this.basicDetailService.dateSelectionRule(payload).subscribe({
    //   next: (response: any) => {
       
    //   }
    // });
  }
}
