import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/services/docket.service';
import { GeneralMasterService } from '../../../shared/services/services/general-master.service';
import { billingTypeResponse } from '../../../shared/services/models/general-master.model';

@Component({
  selector: 'basic-details',
  standalone: false,
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent {
public billingTypeData:billingTypeResponse[]=[];
constructor(
  public docketService:DocketService,
  private generalMasterService:GeneralMasterService
){}

ngOnInit(){
  this.getBillingTypeData();
}

getBillingTypeData(){
  this.generalMasterService.getBillingTypeList('PAYTYP').subscribe({
      next: (response) => {
        if (response.status===200) {
          
          this.billingTypeData=response.data;
        }
      },
      error: (response: any) => {
        // this.sweetAlertService.error(response.error.message);
      },
    });
}
}
