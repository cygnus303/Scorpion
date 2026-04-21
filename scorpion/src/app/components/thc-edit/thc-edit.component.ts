import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';


@Component({
  selector: 'app-thc-edit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thc-edit.component.html',
  styleUrl: './thc-edit.component.scss'
})
export class ThcEditComponent {
    public modalRef!: BsModalRef;
  
    @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
    public thcEditData=[
      {
        contractAmt:'35000',
        StandardAmt :'0.00',
        AdvanceAmt:'0',
        advanceAmtPaid:'PIM',
        balanceAmtAt:'PIM'
      }
    ]
  

  
    constructor(private modalService: BsModalService,public PRSDRSApiService:PRSDRSApiService) { }

      showPopup(data: any) {
    console.log("HCC Details Data:", data);
    this.getTHCEditDetail(data);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  getTHCEditDetail(data:any){
    const params={
      thcNo:data.thcNo,
      vendorType:null
    }

    // this.PRSDRSApiService.getTHCList(params).subscribe({
    //   next : (response:any)=>{
    //     if(response){
    //       this.thcData= response.data;
    //        this.pagination.totalRecords = response.pagination.totalRecords;
    //       this.pagination.totalPages = response.pagination.totalPages;
    //       this.summaryData = response.summary;
    //       this.isLoading = false;
    //     }
    //   }, error: (err) => {
    //     console.error(err);
    //     this.isLoading = false;
    //   }
    // })



  }

}
