import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-thc-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thc-edit.component.html',
  styleUrl: './thc-edit.component.scss'
})
export class ThcEditComponent {
    public modalRef!: BsModalRef;
    public selectedTHC:string='';
    public thcData:any; 
    @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  
  constructor(private modalService: BsModalService,public PRSDRSApiService:PRSDRSApiService) { }

  showPopup(data: any) {
    console.log("HCC Details Data:", data);
    this.selectedTHC=data.thcNo;
    this.getTHCEditDetail(data);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  getTHCEditDetail(data:any){
    const params={
      thcNo:data.thcNo,
      vendorType:null
    }

    this.PRSDRSApiService.getTHCEditDetail(params).subscribe({
      next : (response:any)=>{
        if(response){
          this.thcData= response.thcsumry;
        }
      }, error: (err) => {
        console.error(err);
      }
    })



  }

}
