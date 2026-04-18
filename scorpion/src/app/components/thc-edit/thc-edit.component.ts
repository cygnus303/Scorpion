import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

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
  

  
    constructor(private modalService: BsModalService) { }

      showPopup(data: any) {
    console.log("HCC Details Data:", data);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

}
