import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  public documentList: any[] = [];
  public fromDate:any;
  public toDate:any;
  public notFoundTextValue = 'Please enter at least 1 characters';

  public DocToList = [
    { text: "Customer", value: "1" },
    { text: "Location", value: "2" },
  ];

  constructor(
    public commonService: CommonService,
    private router: Router,
    private PFMService: PFMService,
    private docketService: DocketService
  ) { }


  ngOnInit() {
    this.buildForm();
    this.commonService.dateAccess('58');
    this.filterData = history.state.filterData;
    console.log('Received:', this.filterData);
    this.getForwardFMDocumentList();
       const fromDate = this.filterData?.dateRange?.[0]
      ? new Date(this.filterData.dateRange[0]).toISOString()
      : null;

    const toDate = this.filterData?.dateRange?.[1]
      ? new Date(this.filterData.dateRange[1]).toISOString()
      : null;
  }

  buildForm() {
    const data = history.state.filterData;
    this.forwardDocForm = new FormGroup({
      FM_No: new FormControl(null),
      FM_Date: new FormControl(new Date()),
      Manual_FM_No: new FormControl(null),
      FM_Doc_Type: new FormControl(data.DocType),
      Courier_Way_Bill_Date: new FormControl(new Date(),[Validators.required]),
      Doc_FWD_To: new FormControl(null,[Validators.required]),
      Courier_Code: new FormControl(null,[Validators.required]),
      Loc_Cust_Code: new FormControl(null,[Validators.required]),
      Courier_Way_Bill_No: new FormControl(null,[Validators.required])
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
   this.isLoading = true;
   const payload = {
      docType: this.filterData.DocType,
      paybas: this.filterData.Paybas,
      dockets: this.filterData.Dockets || '',
      loccode: this.docketService.loginUserList.LocationCode,
      dT_TYPE: this.filterData.DT_TYPE,
      fromDate: this.filterData?.dateRange?.[0]? new Date(this.filterData.dateRange[0]).toISOString(): null,
      toDate: this.filterData?.dateRange?.[1]? new Date(this.filterData.dateRange[1]).toISOString(): null,
      fmDate: this.forwardDocForm.value.FM_Date

    }
    this.PFMService.getForwardFMDocuments(payload).subscribe({
      next: (response) => {
         this.responseData = response.data;
      },
      complete: () => {
         this.isLoading = false;
      },
      error: () => {
         this.isLoading = false;
      }
   });
}

toggleAll(event: any) {
  const checked = event.target.checked;
  this.responseData?.docketList?.forEach((item: any) => {
    item.isChecked = checked;
  });
}

toggleSingle(event: any, item: any) {
  item.isChecked = event.target.checked;
}

isAllSelected(): boolean {
  const list = this.responseData?.docketList || [];
  return list.length > 0 && list.every((item: any) => item.isChecked);
}

isAnySelected(): boolean {
  const list = this.responseData?.docketList || [];
  return list.some((item: any) => item.isChecked);
}

  onSubmit() {
    const selectedList = (this.responseData?.docketList || []).filter((item: any) => item.isChecked);
    const payload = {
      wffdmvm: {
        wffdm: {
          fM_No: this.forwardDocForm.value.FM_No || '',
          id: 0,
          fM_Close: "",
          fM_Status: "",
          fM_FWD_LocCode: this.docketService.loginUserList.LocationCode,
          fM_Ack_Status: "",
          courier_Way_Bill_No: this.forwardDocForm.value.Courier_Way_Bill_No || '',
          fM_Edit_by: "",
          loc_Cust_Code: this.forwardDocForm.value.Loc_Cust_Code || '',
          fM_Entry_Date: this.responseData?.fmEntryDate,
          courier_Way_Bill_Date: this.forwardDocForm.value.Courier_Way_Bill_Date.toISOString(),
          fM_Rec_dt: new Date().toISOString(),
          total_Documents: selectedList.length, 
          fM_Edit_Date: new Date().toISOString(),
          manual_FM_No: this.forwardDocForm.value.Manual_FM_No || '',
          fM_FWD_CurrYear: new Date().getFullYear().toString(),
          fM_Date: this.forwardDocForm.value.FM_Date.toISOString(),
          doc_FWD_To: this.forwardDocForm.value.Doc_FWD_To || '',
          fM_Doc_Type: Number(this.forwardDocForm.value.FM_Doc_Type),
          courier_Code: this.forwardDocForm.value.Courier_Code || '',
          isAck: false,
          isFinalized: false,
          entryBy: this.docketService.loginUserList.UserId
        },
        ffdfm: {
          docType: "",
          fromDate: new Date().toISOString(),
          toDate: new Date().toISOString(),
          paybas: "",
          dockets: "",
          dT_TYPE: "",
          loccode: ""
        }
      },
      billList: [],
      thcList: [],
      coddodpodList: selectedList.map((item: any) => ({
        ...item,
        manual_dockno:item.manual_dockno || '',
        curr_loc: '',
        dkt: '',
        doc_ack_status: '',
        doc_fwd_to: '',
        documentName: '',
        fm_ack_status: '',
        fur_FWD_loc: '',
        loc_cust_code: '',
      })),
      baseLocationCode: this.docketService.loginUserList.LocationCode,
      baseUserName: this.docketService.loginUserList.BaseUserName,
      baseFinYear: this.docketService.loginUserList.FinYear
    }

    console.log(payload)
    if (this.forwardDocForm.valid) {
      this.PFMService.onSubmitForward(payload).subscribe({
        next: (response) => {

        }
      })
    } else {
      this.forwardDocForm.markAllAsTouched();
    }
  }

  goToBackList() {
    this.router.navigate(['/Document/ForwardFMDocumentsQuery']);
  }
}
