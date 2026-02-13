import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonService } from 'app/shared/services/common.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Router } from '@angular/router';
import { PFMService } from 'app/shared/services/pfm.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-forward-document-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, ReactiveFormsModule, BsDatepickerModule],
  templateUrl: './forward-document-list.component.html',
  styleUrl: './forward-document-list.component.scss'
})
export class ForwardDocumentListComponent {
  public forwardDocForm !: FormGroup;
  public customerData: any[] = [];
  public filterData:any;
  public responseData:any;
  public isLoading = false;
  public notFoundTextValue = 'Please enter at least 1 characters';

  public DocToList = [
    { text: "Customer", value: "1" },
    { text: "Location", value: "2" },
  ];

  constructor(
    public commonService: CommonService,
    private router: Router,
    private PFMService: PFMService,
    private docketService:DocketService
  ) { }


  ngOnInit() {
    this.buildForm();
    this.commonService.dateAccess('58');
    this.filterData = history.state.filterData;
    console.log('Received:', this.filterData);
    this.getForwardFMDocumentList()
  }

  buildForm() {
    const data = history.state.filterData;
    this.forwardDocForm = new FormGroup({
      FM_No: new FormControl(null),
      FM_Date: new FormControl(new Date()),
      Manual_FM_No: new FormControl(null),
      FM_Doc_Type: new FormControl(data.DocType),
      Courier_Way_Bill_Date: new FormControl(new Date()),
      Doc_FWD_To: new FormControl(null),
      Courier_Code: new FormControl(null),
      Loc_Cust_Code: new FormControl(null),
      Courier_Way_Bill_No: new FormControl(null)
    })
  }

  onChangeForward(event: any) {
    if (event.value) {
      this.forwardDocForm.patchValue({ Loc_Cust_Code: null});
    }
    if (event?.value === '2') {
      this.forwardDocForm.patchValue({
        Loc_Cust_Code: 'HQTR'
      });
    }
  }

  onClearForwardFeild() {
    this.forwardDocForm.patchValue({
      Loc_Cust_Code: null
    });
  }

  getCustomerData(event?: any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 1) {
      this.customerData = [];
      this.notFoundTextValue = 'Enter at least 1 characters';
      return;
    }
    this.notFoundTextValue = 'Searching...';
    this.PFMService.getCustomerDetail(searchText).subscribe({next: (response) => {
        this.customerData = response;
        this.notFoundTextValue = 'No matches found';
      },
      error: (error) => {
        this.customerData = [];
        this.notFoundTextValue = ''
      }
    });
  }

getForwardFMDocumentList() {
   this.isLoading = true; // Set loading to true when API call starts
   const fromDate = this.filterData?.dateRange?.[0] ? new Date(this.filterData.dateRange[0]).toISOString() : null;
   const toDate = this.filterData?.dateRange?.[1] ? new Date(this.filterData.dateRange[1]).toISOString() : null;
   const payload = {
      docType: this.filterData.DocType,
      paybas: this.filterData.Paybas,
      dockets: this.filterData.Dockets || '',
      loccode: this.docketService.loginUserList.LocationCode,
      dT_TYPE: this.filterData.DT_TYPE,
      fromDate: fromDate,
      toDate: toDate,
      fmDate: this.forwardDocForm.value.FM_Date
   };

   this.PFMService.getForwardFMDocuments(payload).subscribe({
      next: (response) => {
         this.responseData = response.data;
      },
      complete: () => {
         this.isLoading = false; // Set loading to false when the API call is completed
      },
      error: () => {
         this.isLoading = false; // Set loading to false if an error occurs
      }
   });
}

  goToBackList() {
    this.router.navigate(['/Document/ForwardFMDocumentsQuery']);
  }
}
