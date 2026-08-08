import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-bill-invoice-view',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './bill-invoice-view.component.html'
})
export class BillInvoiceViewComponent {
  public selectedInvoiceBill: any;
  public billDetail:any;
  public billList: any[] = [];
  @ViewChild('TemplateInvoice', { static: true }) TemplateInvoice!: TemplateRef<any>;

  constructor(
    public modalRef: BsModalRef,
    public modalService:BsModalService,
    public dynamicDataService:DynamicDataService
  ) {}

  showPopup(data :any){
    this.getBillData(data);
    this.modalRef = this.modalService.show(this.TemplateInvoice, { class: 'modal-xl modal-dialog-centered modal-dialog-scrollable', backdrop: true });
  }

  getBillData(data:any){
    const payload = {
      "FilterJson": {
       "ReportId" : "375",
        "BillNo" : data
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      if (response) {
        if (response.Table1) {
          this.billList = response.Table1;
        } else {
          this.billList = [];
        }
        
        if (response.Table4 && response.Table4.length > 0) {
          this.billDetail = response.Table4[0];
        } else {
          this.billDetail = null;
        }
      } else {
        this.billList = [];
        this.billDetail = null;
      }
    });
  }

  get totalChargeWt() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.CHRGWT || 0), 0) || 0;
  }

  get totalRate() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.FRT_RATE || 0), 0) || 0;
  }

  get totalFreight() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.FREIGHT || 0), 0) || 0;
  }

  get totalOtherCharges() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.OtherCharges || 0), 0) || 0;
  }

  get totalSubTotal() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.SubTotal || 0), 0) || 0;
  }

  get totalDocumentCharges() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.DocumentCharges || 0), 0) || 0;
  }

  get totalFuelSurcharge() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.FuelSurcharge || 0), 0) || 0;
  }

  get totalIGST() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.IGST || 0), 0) || 0;
  }

  get totalSGST() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.SGST || 0), 0) || 0;
  }

  get totalCGST() {
    return this.billList?.reduce((sum: number, item: any) => sum + (item.CGST || 0), 0) || 0;
  }

  downloadInvoice() {
    window.print();
  }

  closeInvoiceView() {
    this.modalRef.hide();
  }
}
