import { Component } from '@angular/core';
import { ChallanService } from 'app/shared/services/challan.service';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';

@Component({
  selector: 'challan-filter',
  standalone: false,
  templateUrl: './challan-filter.component.html',
  styleUrl: './challan-filter.component.scss'
})
export class ChallanFilterComponent {
  public typeName : string='';
  public dateType=[
    {text:'CNote Booking Date',value:'1'},
    {text:'CNote Arrived Date',value:'2'}
  ]
   public odaTypeList=[
    { text:'ODA', value:'ODA'},
    { text:'Non ODA',value:'NonODA'}
  ];

constructor(
  public docketService:DocketService , 
  public commonService:CommonService,
  public THCMasterService:THCMasterService,
  public challanService:ChallanService,
  public generalMasterService:GeneralMasterService,
  private route: ActivatedRoute,
  private router: Router,
){}

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    const type = this.docketService.loginUserList.Type;
    this.typeName = type === '3' ? 'DRS' : type === '1' ? 'THC' : type === '2' ? 'PRS' : '';

    this.challanService.SearchfilterForm()
    this.generalMasterService.getPaybsData();
    this.generalMasterService.getModeData();
    this.getVendorType();
    this.generalMasterService.getChargeTypeData();
    this.challanService.filterForm.patchValue({BookedByType:'P'})

    this.challanService.filterForm.get('loadingBy')?.valueChanges.subscribe((value) => {
      const chargeTypeControl = this.challanService.filterForm.get('chrgType');
      if (value !== 'XX9') {
        chargeTypeControl?.setValidators([Validators.required]);
      } else {
        chargeTypeControl?.clearValidators();
        chargeTypeControl?.setValue(null); // optional: clear value when not required
      }
      chargeTypeControl?.updateValueAndValidity();
    });
  }

  getVendorType() {
    this.THCMasterService.getVendorType(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          const userType = Number(this.docketService.loginUserList.Type);  // 1 / 2 / 3
          const typeToIndex: any = {
            3: 0,   // D
            2: 1,   // P
            1: 2    // M
          };
          const index = typeToIndex[userType];
          if (index !== undefined && response.data[index]) {
            this.generalMasterService.getLoadingByDetail(response.data[index].loading_VendorType);
          }
        }
      }
    });
  }
 
  changeLoadingBy(event: any) {
    this.challanService.filterForm.patchValue({
      loadingByName:event.codeDesc,
      loadingBycodeFor:event.codeFor || event.codeId
    });
  }
 

onSearch() {
  if (this.challanService.filterForm.valid) {
    this.router.navigate(['Operation/ChallanList'],{
        queryParams: {
          data: this.route.snapshot.queryParams['data'],
          start: JSON.stringify(this.challanService.filterForm.value) // must stringify
        }
      }
    );
  } else {
    this.challanService.filterForm.markAllAsTouched();
  }
}

}
