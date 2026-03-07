import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { MasterService } from 'app/shared/services/master.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ScanFmDocumentsService } from 'app/shared/services/scan-fm-documents.service';
import { CommonModule } from '@angular/common';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vendor-contract-profile',
  standalone: true,
  imports: [CommonModule,NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './vendor-contract-profile.component.html',
  styleUrl: './vendor-contract-profile.component.scss',
})
export class VendorContractProfileComponent {
  public vendorCategoryList = [
    { text:'Contract', value : 'C'},
    { text:'Non Contract', value : 'NC'}
  ];
  public paymentIntervalList = [
  { text: 'Quarterly', value: 'Q' },
  { text: 'Monthly', value: 'M' },
  { text: 'Weekly', value: 'W' }
];
public paymentBasisList = [
  { text: 'Cash', value: '1' },
  { text: 'Cheque', value: '2' },
  { text: 'DD', value: '3' }
];
  ngOnInit() {
    this.vendorContractService.buildForm();
    this.getVendorContractList();
     this.route.queryParams.subscribe(params => {
       this.vendorContractService.vendorProfileForm.patchValue({
         VendorName: params['Vendorname'],
         VendorTypeName: params['Text'],
         VendorType: params['VedorType']
       })
     });
  }

  constructor(public docketService: DocketService,public scanFmDocumentsService:ScanFmDocumentsService,
    public vendorContractService:VendorContractService,private masterService:MasterService,private route: ActivatedRoute) { }

 
  getVendorContractList(){
    this.masterService.getVendorContractTypeWise(this.docketService.loginUserList.Type).subscribe({
      next:(response:any)=>{
       if(response.wvcsV1){
        this.vendorContractService.vendorProfileForm.patchValue({
          tdS_Rate:response.wvcsV1.tdS_Rate
        })
       }
      }
    })
  }

}
