import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { generalMasterResponse } from 'app/shared/models/general-master.model';
import { PRSGeneralMasterResponse } from 'app/shared/models/thc-master.model';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonService } from 'app/shared/services/common.service';

@Component({
  selector: 'app-forward-documents',
  standalone: true,
  imports: [CommonModule , NgSelectModule , ReactiveFormsModule,BsDatepickerModule],
  templateUrl: './forward-documents.component.html',
  styleUrl: './forward-documents.component.scss'
})
export class ForwardDocumentsComponent {
  public filterForm!:FormGroup;
  public PayBsData:PRSGeneralMasterResponse[]=[];
  public DocTypelist =[
    { text:"Bill", value : "2" },
    { text:"COD/DOD", value : "4" },
    { text:"POD", value : "1" },
    { text:"THC", value : "6" },
  ];
  public DateTypelist =[
    { text:"THC Date", value : "1" },
    { text:"Arrival Date", value : "2" }
  ]



  constructor(
    private router: Router,
    public THCMasterService:THCMasterService,
    public commonService:CommonService
  ) { }

  ngOnInit(){
    this.buildForm();
  }

  buildForm(){
     const endDate = new Date(); // aaje ni date
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 29); 
    this.filterForm=new FormGroup({
      DocType:new FormControl(null,[Validators.required]),
      DT_TYPE:new FormControl(null,[Validators.required]),
      Paybas:new FormControl(null,[Validators.required]),
      Dockets:new FormControl(null),
      dateRange:new FormControl([startDate, endDate])
  })
  }

  onChangeDocType(event:any){
    if(event?.value==='2'){
      this.PayBsData=[];
      this.getPaybsData('BILLTYP');
    }else {
      this.PayBsData=[];
      this.getPaybsData('PAYTYP');
    }
  }

  getPaybsData(codeType:string) {
    this.THCMasterService.getGeneralMasterDetail(codeType).subscribe({
      next: (response) => {
        if (response.success) {
          this.PayBsData = response.data;
        }
      }
    });
  }

  goToForwardList() {
    if(this.filterForm.valid){
      this.router.navigate(
      ['/Document/ForwardFMDocuments'],
      { state: { filterData: this.filterForm.value } }
      );
    }else{
      this.filterForm.markAllAsTouched();
    }
  }


}
