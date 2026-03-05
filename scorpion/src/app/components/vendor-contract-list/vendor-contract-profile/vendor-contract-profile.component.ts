import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ScanFmDocumentsService } from 'app/shared/services/scan-fm-documents.service';
import { CommonModule } from '@angular/common';
import { VendorContractService } from 'app/shared/services/vendor-contract.service';

@Component({
  selector: 'app-vendor-contract-profile',
  standalone: true,
  imports: [CommonModule,NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './vendor-contract-profile.component.html',
  styleUrl: './vendor-contract-profile.component.scss',
  providers: [DocketService, ScanFmDocumentsService]
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
    this.vendorContractService.buildForm()
  }

  constructor(public docketService: DocketService,public scanFmDocumentsService:ScanFmDocumentsService,
    public vendorContractService:VendorContractService) { }

 


}
