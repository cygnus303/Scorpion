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
        ContractType:params['ContractType'],
        ContractId:params['ContractId']
      })
    });
    if(this.docketService.loginUserList.Type === 'E'){
      this.getVendorContractList();
    }
  }

  constructor(public docketService: DocketService,public scanFmDocumentsService:ScanFmDocumentsService,public generalMasterService:GeneralMasterService,
    public vendorContractService:VendorContractService,private masterService:MasterService,private route: ActivatedRoute) { }

 
  getVendorContractList(){
    const payload = {
      type:this.routeParams.VedorType ,
      text:this.routeParams.Text,
      flag:this.docketService.loginUserList.Type === 'A'?'Add':'Edit',
      vendorCode:this.routeParams.VendorCode,
      contractType:this.routeParams.ContractType ? this.routeParams.ContractType :'',
      matrix:this.routeParams.matrix,
      contractId:this.routeParams.ContractId
    }
    this.masterService.getVendorContract(payload).subscribe({
      next:(response:any)=>{
       if(response.wvcsV1){
        this.vendorContractService.vendorProfileForm.patchValue({
          tdS_Rate:response.wvcsV1.tdS_Rate,
          CONTRACTCD:response.wvcsV1.contractcd,
          VendorName:response.wvcsV1.vendorName,
          VendorTypeName:response.wvcsV1.vendorTypeName,
         ContractDt: new Date(response.wvcsV1.contractDt),
          Start_Dt: new Date(response.wvcsV1.start_Dt),
          Valid_uptodt: new Date(response.wvcsV1.valid_uptodt),
          Contract_loccode:response.wvcsV1.contract_loccode,
          VendorPerName:response.wvcsV1.vendorPerName,
          VendorPerDesg:response.wvcsV1.vendorPerDesg,
          Vendor_Address:response.wvcsV1.vendor_Address,
          VendorCity:response.wvcsV1.vendorCity,
          VendorPin:response.wvcsV1.vendorPin,
          TDSAppl_YN:response.wvcsV1.tdsAppl_YN,
          VendorCategory:response.wvcsV1.vendorCategory,
          VendorContractCat:response.wvcsV1.vendorContractCat,
          TDS_Rate:response.wvcsV1.tdS_Rate,
          Security_deposit_chq:response.wvcsV1.security_deposit_chq,
          payment_interval:response.wvcsV1.Payment_interval,
          Security_deposit_date:response.wvcsV1.security_deposit_date,
          Security_deposit_Amt:response.wvcsV1.security_deposit_Amt,
          Payment_Basis:response.wvcsV1.payment_Basis,
          Payment_loc:response.wvcsV1.payment_loc,
          Monthly_Phone_Charges:response.wvcsV1.monthly_Phone_Charges,
          Default_Charge:response.wvcsV1.default_Charge,
          CompEmpName:response.wvcsV1.compEmpName,
          VendorWitness:response.wvcsV1.vendorWitness,
          CompEmpDesg:response.wvcsV1.compEmpDesg,
          CompWitness:response.wvcsV1.compWitness,
        })
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

        if (response.listWVCDoBCM) {
         const routeArray = this.vendorContractService.cnoteBasedContracts;
         routeArray.clear();
         response.listWVCDoBCM.forEach((item: any) => {
           this.vendorContractService.addCnoteBasedContract();
           const index = routeArray.length - 1;
           routeArray.at(index).patchValue(item);
         });
       }
       
        if (response.listWVCDoDCM) {
          const routeArray = this.vendorContractService.cnoteDeliveryCharges;
          routeArray.clear();
          response.listWVCDoDCM.forEach((item: any) => {
            this.vendorContractService.addCnoteDeliveryCharges();
            const index = routeArray.length - 1;
            routeArray.at(index).patchValue(item);
          });
        }

      }
    })
  }

}
