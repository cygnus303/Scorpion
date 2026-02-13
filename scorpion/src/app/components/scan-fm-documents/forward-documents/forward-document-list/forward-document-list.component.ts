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

  onSubmit(){
//    const payload= {
//   "wffdmvm": {
//     "wffdm": {
//       "fM_No":this.forwardDocForm.value.FM_No,
//       "id": 0,
//       "fM_Close": "string",
//       "fM_Status": "string",
//       "fM_FWD_LocCode": "string",
//       "fM_Ack_Status": "string",
//       "courier_Way_Bill_No": "string",
//       "fM_Edit_by": "string",
//       "loc_Cust_Code": "string",
//       "fM_Entry_Date": "2026-02-13T06:14:58.468Z",
//       "courier_Way_Bill_Date": "2026-02-13T06:14:58.468Z",
//       "fM_Rec_dt": "2026-02-13T06:14:58.468Z",
//       "total_Documents": 0,
//       "fM_Edit_Date": "2026-02-13T06:14:58.468Z",
//       "manual_FM_No": this.forwardDocForm.value.Manual_FM_No,
//       "fM_FWD_CurrYear": "string",
//       "fM_Date": this.forwardDocForm.value.FM_Date,
//       "doc_FWD_To": this.forwardDocForm.value.Doc_FWD_To,
//       "fM_Doc_Type": Number(this.forwardDocForm.value.FM_Doc_Type),
//       "courier_Code": this.forwardDocForm.value.Courier_Code,
//       "isAck": true,
//       "isFinalized": true,
//       "entryBy": "string"
//     },
//     "listWFFDM": [
//       {
//         "fM_No": "string",
//         "id": 0,
//         "fM_Close": "string",
//         "fM_Status": "string",
//         "fM_FWD_LocCode": "string",
//         "fM_Ack_Status": "string",
//         "courier_Way_Bill_No": "string",
//         "fM_Edit_by": "string",
//         "loc_Cust_Code": "string",
//         "fM_Entry_Date": "2026-02-13T06:14:58.468Z",
//         "courier_Way_Bill_Date": "2026-02-13T06:14:58.468Z",
//         "fM_Rec_dt": "2026-02-13T06:14:58.468Z",
//         "total_Documents": 0,
//         "fM_Edit_Date": "2026-02-13T06:14:58.468Z",
//         "manual_FM_No": "string",
//         "fM_FWD_CurrYear": "string",
//         "fM_Date": "2026-02-13T06:14:58.468Z",
//         "doc_FWD_To": "string",
//         "fM_Doc_Type": 0,
//         "courier_Code": "string",
//         "isAck": true,
//         "isFinalized": true,
//         "entryBy": "string"
//       }
//     ],
//     "ffdfm": {
//       "docType": this.forwardDocForm.value.FM_Doc_Type,
//       "fromDate": this.filterData?.dateRange?.[0]? new Date(this.filterData.dateRange[0]).toISOString(): null,
//       "toDate": this.filterData?.dateRange?.[1]? new Date(this.filterData.dateRange[1]).toISOString(): null,
//       "paybas": this.filterData.value.paybas,
//       "dockets": this.filterData.value.paybas,
//       "dT_TYPE": this.filterData.value.paybas,
//       "loccode": this.docketService.loginUserList.LocationCode
//     },
//     // // "listFFDFM": [
//     // //   {
//     //    "docType": this.forwardDocForm.value.FM_Doc_Type,
//     //   "fromDate": this.fromDate,
//     //   "toDate": this.toDate,
//     //   "paybas": this.filterData.value.paybas,
//     //   "dockets": this.filterData.value.paybas,
//     //   "dT_TYPE": this.filterData.value.paybas,
//     //   "loccode": this.docketService.loginUserList.LocationCode
//     // //   }
//     // // ],
//     "vwbff": {
//       "manualbillno": "string",
//       "doc_ack_status": "string",
//       "manualTHCno": "string",
//       "doc_fwd_to": "string",
//       "billsubbrcd": "string",
//       "documentNo": "string",
//       "fm_ack_status": "string",
//       "bgndt": "2026-02-13T06:14:58.468Z",
//       "thcdt": "2026-02-13T06:14:58.468Z",
//       "arrival_date": "2026-02-13T06:14:58.468Z",
//       "pfM_LOC": "string",
//       "bsbdt": "2026-02-13T06:14:58.468Z",
//       "ptmsnm": "string",
//       "vendoR_NAME": "string",
//       "routename": "string",
//       "loc_cust_code": "string",
//       "view_st": "string",
//       "billno": "string",
//       "thcno": "string",
//       "fwD_Cust_Rest": "string",
//       "ptmscd": "string",
//       "scaned": "string",
//       "documentName": "string",
//       "loc": "string",
//       "fm_doc_type": 0,
//       "dkt": "string",
//       "fwD_LOC_Rest": "string",
//       "billamt": 0,
//       "thcamt": 0,
//       "advamt1": 0,
//       "balanceAmt": 0,
//       "fur_FWD_loc": "string",
//       "isChecked": true
//     },
//     "listVWBFF": [
//       {
//         "manualbillno": "string",
//         "doc_ack_status": "string",
//         "manualTHCno": "string",
//         "doc_fwd_to": "string",
//         "billsubbrcd": "string",
//         "documentNo": "string",
//         "fm_ack_status": "string",
//         "bgndt": "2026-02-13T06:14:58.468Z",
//         "thcdt": "2026-02-13T06:14:58.468Z",
//         "arrival_date": "2026-02-13T06:14:58.468Z",
//         "pfM_LOC": "string",
//         "bsbdt": "2026-02-13T06:14:58.468Z",
//         "ptmsnm": "string",
//         "vendoR_NAME": "string",
//         "routename": "string",
//         "loc_cust_code": "string",
//         "view_st": "string",
//         "billno": "string",
//         "thcno": "string",
//         "fwD_Cust_Rest": "string",
//         "ptmscd": "string",
//         "scaned": "string",
//         "documentName": "string",
//         "loc": "string",
//         "fm_doc_type": 0,
//         "dkt": "string",
//         "fwD_LOC_Rest": "string",
//         "billamt": 0,
//         "thcamt": 0,
//         "advamt1": 0,
//         "balanceAmt": 0,
//         "fur_FWD_loc": "string",
//         "isChecked": true
//       }
//     ],
//     "vwdffm": {
//       "dockno": "string",
//       "manual_dockno": "string",
//       "doc_fwd_to": "string",
//       "fm_ack_status": "string",
//       "fm_doc_type": 0,
//       "orgncd": "string",
//       "pfM_LOC": "string",
//       "dely_date": "string",
//       "loc_cust_code": "string",
//       "view_st": "string",
//       "curr_loc": "string",
//       "scaned": "string",
//       "documentName": "string",
//       "doc_ack_status": "string",
//       "loc": "string",
//       "dockdt": "2026-02-13T06:14:58.468Z",
//       "from_to": "string",
//       "dkttot": 0,
//       "delivered": "string",
//       "dkt": "string",
//       "paybas": "string",
//       "fur_FWD_loc": "string",
//       "isChecked": true
//     },
//     "listVWDFFM": [
//       {
//         "dockno": "string",
//         "manual_dockno": "string",
//         "doc_fwd_to": "string",
//         "fm_ack_status": "string",
//         "fm_doc_type": 0,
//         "orgncd": "string",
//         "pfM_LOC": "string",
//         "dely_date": "string",
//         "loc_cust_code": "string",
//         "view_st": "string",
//         "curr_loc": "string",
//         "scaned": "string",
//         "documentName": "string",
//         "doc_ack_status": "string",
//         "loc": "string",
//         "dockdt": "2026-02-13T06:14:58.468Z",
//         "from_to": "string",
//         "dkttot": 0,
//         "delivered": "string",
//         "dkt": "string",
//         "paybas": "string",
//         "fur_FWD_loc": "string",
//         "isChecked": true
//       }
//     ],
//     "listWFFDDM": [
//       {
//         "manual_Bill_No": "string",
//         "orgn_Dest": "string",
//         "bill_Date": "2026-02-13T06:14:58.468Z",
//         "documentDate": "2026-02-13T06:14:58.468Z",
//         "fM_Ack_Status": "string",
//         "doc_status": "string",
//         "documentNo": "string",
//         "dely_Date": "2026-02-13T06:14:58.468Z",
//         "bill_Amount": 0,
//         "submission_Location": "string",
//         "id": 0,
//         "from_To": "string",
//         "scan_Status_New": "string",
//         "billing_Party": "string",
//         "dockNo": "string",
//         "currLoc": "string",
//         "bill_no": "string",
//         "amount": 0,
//         "updt": "2026-02-13T06:14:58.468Z",
//         "rE_FWD": "string",
//         "hdR_ID": 0,
//         "dockDt": "2026-02-13T06:14:58.468Z",
//         "scan_Status": 0
//       }
//     ],
//     "cbsHdrList": [
//       {
//         "companyCode": 0,
//         "cbsNo": "string",
//         "id": 0,
//         "branchCode": "string",
//         "period": "string",
//         "fromDate": "2026-02-13T06:14:58.468Z",
//         "toDate": "2026-02-13T06:14:58.468Z",
//         "entryBy": "string",
//         "cbsDate": "string",
//         "entryDate": "2026-02-13T06:14:58.468Z",
//         "isFinalized": true,
//         "finalizedBy": "string",
//         "finalizedDate": "2026-02-13T06:14:58.468Z",
//         "isCancelled": true,
//         "cancelledBy": "string",
//         "cancelledDate": "2026-02-13T06:14:58.468Z",
//         "cancelledReason": "string",
//         "banK_Credit": 0,
//         "banK_Debit": 0,
//         "casH_Credit": 0,
//         "casH_Debit": 0
//       }
//     ],
//     "fm_no": "string",
//     "listFDDM": [
//       {
//         "srNo": 0,
//         "dockno": "string"
//       }
//     ]
//   },
//   "billList": [
//     {
//       "manualbillno": "string",
//       "doc_ack_status": "string",
//       "manualTHCno": "string",
//       "doc_fwd_to": "string",
//       "billsubbrcd": "string",
//       "documentNo": "string",
//       "fm_ack_status": "string",
//       "bgndt": "2026-02-13T06:14:58.468Z",
//       "thcdt": "2026-02-13T06:14:58.468Z",
//       "arrival_date": "2026-02-13T06:14:58.468Z",
//       "pfM_LOC": "string",
//       "bsbdt": "2026-02-13T06:14:58.468Z",
//       "ptmsnm": "string",
//       "vendoR_NAME": "string",
//       "routename": "string",
//       "loc_cust_code": "string",
//       "view_st": "string",
//       "billno": "string",
//       "thcno": "string",
//       "fwD_Cust_Rest": "string",
//       "ptmscd": "string",
//       "scaned": "string",
//       "documentName": "string",
//       "loc": "string",
//       "fm_doc_type": 0,
//       "dkt": "string",
//       "fwD_LOC_Rest": "string",
//       "billamt": 0,
//       "thcamt": 0,
//       "advamt1": 0,
//       "balanceAmt": 0,
//       "fur_FWD_loc": "string",
//       "isChecked": true
//     }
//   ],
//   "thcList": [
//     {
//       "manualbillno": "string",
//       "doc_ack_status": "string",
//       "manualTHCno": "string",
//       "doc_fwd_to": "string",
//       "billsubbrcd": "string",
//       "documentNo": "string",
//       "fm_ack_status": "string",
//       "bgndt": "2026-02-13T06:14:58.468Z",
//       "thcdt": "2026-02-13T06:14:58.468Z",
//       "arrival_date": "2026-02-13T06:14:58.468Z",
//       "pfM_LOC": "string",
//       "bsbdt": "2026-02-13T06:14:58.468Z",
//       "ptmsnm": "string",
//       "vendoR_NAME": "string",
//       "routename": "string",
//       "loc_cust_code": "string",
//       "view_st": "string",
//       "billno": "string",
//       "thcno": "string",
//       "fwD_Cust_Rest": "string",
//       "ptmscd": "string",
//       "scaned": "string",
//       "documentName": "string",
//       "loc": "string",
//       "fm_doc_type": 0,
//       "dkt": "string",
//       "fwD_LOC_Rest": "string",
//       "billamt": 0,
//       "thcamt": 0,
//       "advamt1": 0,
//       "balanceAmt": 0,
//       "fur_FWD_loc": "string",
//       "isChecked": true
//     }
//   ],
//   "coddodpodList": [
//     {
//       "dockno": "string",
//       "manual_dockno": "string",
//       "doc_fwd_to": "string",
//       "fm_ack_status": "string",
//       "fm_doc_type": 0,
//       "orgncd": "string",
//       "pfM_LOC": "string",
//       "dely_date": "string",
//       "loc_cust_code": "string",
//       "view_st": "string",
//       "curr_loc": "string",
//       "scaned": "string",
//       "documentName": "string",
//       "doc_ack_status": "string",
//       "loc": "string",
//       "dockdt": "2026-02-13T06:14:58.469Z",
//       "from_to": "string",
//       "dkttot": 0,
//       "delivered": "string",
//       "dkt": "string",
//       "paybas": "string",
//       "fur_FWD_loc": "string",
//       "isChecked": true
//     }
//   ],
//   "baseLocationCode": "string",
//   "baseUserName": "string",
//   "baseFinYear": "string"
// }

if(this.forwardDocForm.valid){
  // this.PFMService.onSubmitForward(payload).subscribe({
  //   next:(response)=>{
  
  //   }
  // })

}else{
   this.forwardDocForm.markAllAsTouched();
}
  }

  goToBackList() {
    this.router.navigate(['/Document/ForwardFMDocumentsQuery']);
  }
}
