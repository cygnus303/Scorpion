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
import { GeneralMasterService } from 'app/shared/services/general-master.service';

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
public routeParams:any;
  ngOnInit() {
    this.vendorContractService.buildForm();
    this.route.queryParams.subscribe(params => {
      this.routeParams = params;
      this.vendorContractService.vendorProfileForm.patchValue({
        VendorName: params['Vendorname'],
        VendorTypeName: params['Text'],
        VendorType: params['VedorType'],
        VendorCode: params['VendorCode'],
        MetrixType:params['matrix'],
        ContractType:params['ContractType']
      })
    });
      this.getVendorContractList();
    }

  constructor(public docketService: DocketService,public scanFmDocumentsService:ScanFmDocumentsService,public generalMasterService:GeneralMasterService,
    public vendorContractService:VendorContractService,private masterService:MasterService,private route: ActivatedRoute) { }

 
  getVendorContractList(){
    const payload = {
      type:this.routeParams.VedorType ,
      text:this.routeParams.Text,
      flag:this.docketService.loginUserList.Type === 'A'?'Add':'Edit',
      vendorCode:this.routeParams.VendorCode,
      contractType:this.routeParams.ContractType,
      matrix:this.routeParams.matrix,
      contractId:this.routeParams.ContractId
    }
    this.masterService.getVendorContract(payload).subscribe({
      next:(response:any)=>{
       if(response.wvcsV1){
        this.vendorContractService.vendorProfileForm.patchValue(response.wvcsV1)
       }
       
        if (response.listWVCRM) {
          const routeArray = this.vendorContractService.routeBasedContracts;
          routeArray.clear();
          response.listWVCRM.forEach((item: any) => {
            this.vendorContractService.addRouteBasedContract();
            const index = routeArray.length - 1;
            routeArray.at(index).patchValue(item);
          });
        }

        if (response.listWVCDM) {
          const routeArray = this.vendorContractService.distanceBasedContracts;
          routeArray.clear();
          response.listWVCDM.forEach((item: any) => {
            this.vendorContractService.addDistanceBasedContract();
            const index = routeArray.length - 1;
            routeArray.at(index).patchValue(item);
          });
        }
      }
    })
    // this.masterService.getVendorContractTypeWise(this.docketService.loginUserList.Type).subscribe({
    //   next:(response:any)=>{
    //    if(response.wvcsV1){
    //     this.vendorContractService.vendorProfileForm.patchValue({
    //       tdS_Rate:response.wvcsV1.tdS_Rate
    //     })
    //    }
    //   }
    // })
  }

}
