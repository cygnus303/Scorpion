import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { LoadingSheetApiService } from 'app/shared/services/loading-sheet-api.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';

@Component({
  selector: 'app-vendor-contract-charges',
  standalone: true,
  imports: [CommonModule ,FormsModule ,ReactiveFormsModule,NgSelectModule],
  templateUrl: './vendor-contract-charges.component.html',
  styleUrl: './vendor-contract-charges.component.scss'
})
export class VendorContractChargesComponent {
    public PayBsList:any[]=[];

  public modeList = [
  { text: 'Air', value: 'A' },
  { text: 'Train', value: 'R' },
  { text: 'Road', value: 'S' }
];

constructor(
  public vendorContractService:VendorContractService,
  public docketService:DocketService,
  public generalMasterService:GeneralMasterService,
  public loadingSheetApiService:LoadingSheetApiService,
  public THCMasterService:THCMasterService,
  private route: ActivatedRoute
  
){}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.vendorContractService.vendorProfileForm.patchValue({
        VendorName: params['Vendorname'],
        VendorTypeName: params['Text'],
        VendorType: params['VedorType'],
        VendorCode: params['VendorCode'],
        MetrixType:params['matrix'],
        ContractType:params['ContractType'],
        ContractId:params['ContractId']
      })
      if (params['VedorType'] === '04') {
        this.getPaybs();
        this.generalMasterService.getModeData();
        this.generalMasterService.getServiceType();
        this.generalMasterService.getVendorRateType();
        this.generalMasterService.getODADetail();
        this.vendorContractService.getCityList();
      }
       if (params['VedorType'] === 'XX1') {
        this.vendorContractService.addRouteContract();
        this.vendorContractService.addDistanceContract();
        this.vendorContractService.addCnoteBasedContract();
        this.vendorContractService.addCnoteDeliveryCharges();
        this.vendorContractService.getVehicleType('O');
        this.docketService.getTypeofMovementData();
        this.generalMasterService.getRateTypeData();
      }
    });
  }

  onModeChange(index: number) {
    const row = this.vendorContractService.routeBasedContracts.at(index);
    row.get('routeCode')?.reset();
    row.get('ftL_Type')?.reset();
  }

  getPaybs() {
    this.THCMasterService.getGeneralMasterDetail('PAYTYP').subscribe({ next: (response) => {
        if (response.success) {
          this.PayBsList = [
          {
            codeId: 'P00',
            codeDesc: 'All'
          },
          ...response.data
        ];
        }
      }
    });
  }


    
  
}
