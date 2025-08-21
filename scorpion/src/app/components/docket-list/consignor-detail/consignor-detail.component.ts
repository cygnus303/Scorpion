import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { GSTNOListResponse } from '../../../shared/models/general-master.model';

@Component({
  selector: 'consignor-detail',
  standalone: false,
  templateUrl: './consignor-detail.component.html',
  styleUrl: './consignor-detail.component.scss'
})
export class ConsignorDetailComponent {
  public getGSTNOList!:GSTNOListResponse;
  public notPincodeValue ='Please Enter at least 1 characters';
  constructor(
    public docketService: DocketService,
    private basicDetailService: BasicDetailService) {}

  ngOnInit() {
    this.docketService.consignorbuild();
  }

  getGSTNODetails(event:any,type:any){
  const searchText = event.target.value;
    this.basicDetailService.getGSTNOList(searchText).subscribe({
      next: (response) => {
        if (response.success) {
          this.getGSTNOList = response.data;
          if(type === 'Conr'){
            this.docketService.consignorForm.patchValue({
              // consignorName:this.getGSTNOList.code ,
              consignorMasterName: this.getGSTNOList.tradeNam,
              consignorAddress: this.getGSTNOList.address,
              consignorCity: this.getGSTNOList.dst,
              consignorPincode: this.getGSTNOList.pncd,
              // consignorMobile: this.getGSTNOList.flno,
              // consignorEmail: this.getGSTNOList.Address,
            });
            
          }else if(type === 'Conee'){
             this.docketService.consignorForm.patchValue({
              //  consigneeName:this.getGSTNOList.code ,
               consigneeMasterName:  this.getGSTNOList.tradeNam,
               consigneeAddress: this.getGSTNOList.address,
               consigneeCity:  this.getGSTNOList.dst,
              //  consigneePincode: this.getGSTNOList.pncd,
               // consigneeMobile: new FormControl(null),
               // consigneeEmail: new FormControl(null),
             });
          }
        } 
      }
    });
  }
}
