import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';
import { DestinationsList, generalMasterResponse ,billingPartyResponse, VehicleNumbersResponse} from '../../../shared/models/general-master.model';
import { cityResponse } from '../../../shared/models/general-master.model';
import { combineLatest, filter, startWith } from 'rxjs';
import { GeneralMasterService } from '../../../shared/services/general-master.service';

@Component({
  selector: 'basic-details',
  standalone: false,
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent {
  public billingTypeData: generalMasterResponse[] = [];
 
  public billingPartyData: billingPartyResponse[] = [];
  public cityList:cityResponse[]=[];  
  public destinationsList:DestinationsList[]=[];
  public vehicleNumbersList:VehicleNumbersResponse[]=[];
  public notFoundTextValue = 'Please enter at least 3 characters';
  constructor(
    public docketService: DocketService,
    private basicDetailService: BasicDetailService,public generalMasterService:GeneralMasterService) { }

  ngOnInit() {
    this.docketService.detailForm();
    this.getBillingTypeData();

    // const billingPartyControl = this.docketService.basicDetailForm.get('billingParty');
    // const pincodeControl = this.docketService.basicDetailForm.get('pincode');
    // if (billingPartyControl && pincodeControl) {
    //   combineLatest([
    //     billingPartyControl.valueChanges.pipe(startWith(billingPartyControl.value)),
    //     pincodeControl.valueChanges.pipe(startWith(pincodeControl.value))
    //   ]).pipe(
    //     filter(([billingParty, pincode]) => !!billingParty && !!pincode)).subscribe(([billingParty, pincode]) => {
    //       this.getPackagingTypeData();
    //       this.getTransportModeData();
    //       this.getPickUpData();
    //       this.getContentsData();
    //       this.getServiceTypeData();
    //       this.getTypeofMovementData();
    //       this.getbusinessTypeData();
    //       this.getexemptServicesData();
    //     });
    // }
  }

  getBillingTypeData() {
    this.basicDetailService.getGeneralMasterList('PAYTYP', null,null).subscribe({
      next: (response) => {
        if (response.success) {
          this.billingTypeData = response.data;
        }
      }
    });
  }


  getCityList(event?: any){
      const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.cityList = [];
      return;
    }
    this.basicDetailService.getCityData(this.docketService.basicDetailForm.get('destination')?.value, searchText).subscribe({
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

  getDestinationsList(event?: any){
      const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.destinationsList = [];
      return;
    }
    this.basicDetailService.getGCDestinations(searchText).subscribe({
      next: (response) => {
        if (response) {
          this.destinationsList = response;
        } else {
          this.destinationsList = [];
        }
      },
      error: () => {
        this.destinationsList = [];
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
      location: this.docketService.HQTR
    }
    this.basicDetailService.getBillingParty(payload).subscribe({
      next: (response) => {
        if (response.success) {
         this.billingPartyData=response.data;
          this.notFoundTextValue = 'No matches found';
        } else {
          this.billingPartyData = [];
        }
      },
      error: () => {
        this.billingPartyData = [];
      }
    });
  }

  getVehicleNumbersList(event?: any){
   const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.vehicleNumbersList = [];
      return;
    }
    this.basicDetailService.getGetVehicleNumbers(searchText).subscribe({
      next: (response) => {
        if (response) {
          this.vehicleNumbersList = response;
        } else {
          this.vehicleNumbersList = [];
        }
      },
      error: () => {
        this.vehicleNumbersList = [];
      }
    });
  }

  onChangeBillingParty(event: any) {
    this.docketService.basicDetailForm.patchValue({
      billingParty: event.custcd,
      billingName: event.custnm
    })
  }

  onChangedestinationsList(event: any){
     this.docketService.basicDetailForm.patchValue({
      destination: event.locCode,
    });
    this.destinationsList = [];
  }

  onChangeCityListList(event: any, type:any){
    if(type === 'from'){
      this.docketService.basicDetailForm.patchValue({
       fromCity: event +':'+ event,
     });
    }else if(type === 'to'){
       this.docketService.basicDetailForm.patchValue({
       toCity: event +':'+ event,
     });
     this.docketService.consignorForm.patchValue({
      consigneeCity:event
     });
    }
    this.cityList = [];
  }
  
  onChangeVehicleNo(event: any){
    this.docketService.basicDetailForm.patchValue({
       vehicleno: event +':'+event,
     });
     this.vehicleNumbersList = [];
  }

  onChangeBillingType() {
    this.docketService.basicDetailForm.patchValue({
      billingParty: null,
      billingName: null
    })
  }
}
