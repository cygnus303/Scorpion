import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';

@Component({
  selector: 'app-vendor-contract-charges',
  standalone: true,
  imports: [CommonModule ,FormsModule ,ReactiveFormsModule,NgSelectModule],
  templateUrl: './vendor-contract-charges.component.html',
  styleUrl: './vendor-contract-charges.component.scss'
})
export class VendorContractChargesComponent {
  public modeList = [
  { text: 'Air', value: 'A' },
  { text: 'Train', value: 'R' },
  { text: 'Road', value: 'S' }
];

constructor(public vendorContractService:VendorContractService,public docketService:DocketService,public generalMasterService:GeneralMasterService){}
  ngOnInit() {
    this.vendorContractService.addRouteContract();
    this.vendorContractService.addDistanceContract();
    this.vendorContractService.addCnoteBasedContract();
    this.vendorContractService.addCnoteDeliveryCharges();
    this.vendorContractService.getVehicleType('O');
    this.docketService.getTypeofMovementData();
    this.generalMasterService.getRateTypeData()
  }

  onModeChange(index: number) {
    const row = this.vendorContractService.routeBasedContracts.at(index);
    row.get('RouteCode')?.reset();
    row.get('FTL_Type')?.reset();
  }
}
