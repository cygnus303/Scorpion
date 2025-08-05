import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { generalMasterResponse } from '../../../shared/models/general-master.model';
import { cityResponse } from '../../../shared/models/general-master.model';
import { combineLatest, filter, startWith } from 'rxjs';

@Component({
  selector: 'basic-details',
  standalone: false,
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent {
  public billingTypeData: generalMasterResponse[] = [];
  public transportModeData: generalMasterResponse[] = [];
  public pickUpData: generalMasterResponse[] = [];
  public contentsData: generalMasterResponse[] = [];
  public serviceData: generalMasterResponse[] = [];
  public packagingTypeData : generalMasterResponse[] = [];
  public billingPartyData:any[]=[];
  public cityList:cityResponse[]=[];  

  constructor(
    public docketService: DocketService,
    private basicDetailService: BasicDetailService) {}

  ngOnInit() {
    this.docketService.buildForm();
    this.getBillingTypeData();

    const billingPartyControl = this.docketService.basicDetailForm.get('billingParty');
    const pincodeControl = this.docketService.basicDetailForm.get('pincode');
    if (billingPartyControl && pincodeControl) {
      combineLatest([
        billingPartyControl.valueChanges.pipe(startWith(billingPartyControl.value)),
        pincodeControl.valueChanges.pipe(startWith(pincodeControl.value))
      ]).pipe(
          filter(([billingParty, pincode]) => !!billingParty && !!pincode)).subscribe(([billingParty, pincode]) => {
          this.getPackagingTypeData();
          this.getTransportModeData();
          this.getPickUpData();
          this.getContentsData();
          this.getServiceTypeData();
        });
    }
  }

  getBillingTypeData() {
    this.basicDetailService.getGeneralMasterList('PAYTYP', null).subscribe({next: (response) => {
        if (response.success) {
          this.billingTypeData = response.data;
        }
      }
    });
  }

  getTransportModeData(event?: any) {
      const searchText = event.term || null;
    if (!searchText || searchText.length < 1) {
      this.cityList = [];
      return;
    }
    this.basicDetailService.getGeneralMasterList('TRN', searchText).subscribe({ next: (response) => {
        if (response.success) {
          this.transportModeData = response.data;
        }
      },
    });
  }

  getPickUpData() {
    this.basicDetailService.getGeneralMasterList('PKPDL', '').subscribe({next: (response) => {
        if (response.success) {
          this.pickUpData = response.data;
        }
      },
    });
  }

  getContentsData(event?:any){
    const searchText = event.term || null;
    if (!searchText || searchText.length < 1) {
      this.contentsData = [];
      return;
    }
     this.basicDetailService.getGeneralMasterList('PROD', '').subscribe({next: (response) => {
        if (response.success) {
          this.contentsData = response.data;
        }
      },
    });
  }

  getServiceTypeData(){
    this.basicDetailService.getGeneralMasterList('SVCTYP', '').subscribe({next: (response) => {
        if (response.success) {
          this.serviceData = response.data;
        }
      },
    });
  }

    getPackagingTypeData(){
    this.basicDetailService.getGeneralMasterList('PKGS','').subscribe({next: (response) => {
        if (response.success) {
          this.packagingTypeData = response.data;
        }
      },
    });
  }

  getCityList(event?: any){
      const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.cityList = [];
      return;
    }
    this.basicDetailService.getCityData(this.docketService.basicDetailForm.get('destination')?.value,searchText).subscribe({
      next: (response) => {
        if (response.success) {
          this.cityList = response.data;
        } else {
          this.cityList = [];
        }
      },
      error: () => {
        this.cityList = [];
      }
    });
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.showPicker?.(); 
  }

  getBillingPartyData(event: any) {
    const searchText = event.term;

    if (!searchText || searchText.length < 3) {
      this.billingPartyData = [];
      return;
    }

    const payload = {
      searchTerm: searchText,
      paybs: this.docketService.basicDetailForm.get('billingType')?.value ? this.docketService.basicDetailForm.get('billingType')?.value : 'P01',
      location: "HQTR"
    }
    this.basicDetailService.getBillingParty(payload).subscribe({
      next: (response) => {
        if (response.success) {
         this.billingPartyData=response.data;
        } else {
          this.billingPartyData = [];
        }
      },
      error: () => {
        this.billingPartyData = [];
      }
    });
  }

  onChangeBillingParty(event: any) {
    this.docketService.basicDetailForm.patchValue({
      billingParty:event.custcd,
      billingName:event.custnm
    })
  }
}
