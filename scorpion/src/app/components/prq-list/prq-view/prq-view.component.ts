import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DocketHistoryComponent } from '../docket-history/docket-history.component';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-prq-view',
  standalone: true,
  imports: [CommonModule, DocketHistoryComponent],
  providers: [BsModalService],
  templateUrl: './prq-view.component.html',
  styleUrl: './prq-view.component.scss'
})
export class PrqViewComponent {
   @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
   @ViewChild('detailsModalTemplate') detailsModalTemplate!: TemplateRef<any>;
   @ViewChild('docketHistoryComponent') docketHistoryComponent!: DocketHistoryComponent;
   
   public modalRef!: BsModalRef;
   public detailModalRef?: BsModalRef;
   public env=environment;
  public prqData: any = null;
  public isLoading: boolean = false;
  
  public detailList: any[] = [];
  public isDetailLoading: boolean = false;
  public detailType: 'eway' | 'volumetric' = 'eway';

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService,
    private sweetAlertService: SweetAlertService
  ) {}

  showPopup(prqNo: string) {
       this.modalRef = this.modalService.show(this.Templatepod, {
      backdrop: 'static',
      class: 'modal-lg modal-dialog-centered'
    });
    this.getPRQDetail(prqNo)
    
  }

  getPRQDetail(prqNo: string){
    this.isLoading = true;
    const payload = {
      "FilterJson": {
        "ReportId": "8",
        "PRQNo": prqNo
      }
    };
    
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.Table1 && response.Table1.length > 0) {
          this.prqData = response.Table1[0];
          
        } else {
          this.sweetAlertService.error("PRQ details not found!");
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.sweetAlertService.error("Failed to load PRQ details.");
      }
    });
  }

  onClose() {
    this.modalRef.hide();
    this.prqData = null;
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'generated': return 'bg-primary text-white';
      case 'assigned': return 'bg-info text-white';
      case 'cancelled': return 'bg-danger text-white';
      case 'arranged': return 'bg-success text-white';
      default: return 'bg-secondary text-white';
    }
  }

openDetails(type: 'eway' | 'volumetric') {
    if (!this.prqData || !this.prqData.PRQNo) {
      this.sweetAlertService.error("Docket No is not available for this PRQ.");
      return;
    }

    this.detailType = type;
    this.detailList = [];
    this.isDetailLoading = true;
    
    const config: ModalOptions = {
      class: 'modal-xl modal-dialog-centered hcc-view-modal-custom',
      backdrop: 'static'
    };
    this.detailModalRef = this.modalService.show(this.detailsModalTemplate, config);

    const payload = {
      "FilterJson": {
        "ReportId": '286',
        "IndentNo": this.prqData.PRQNo
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isDetailLoading = false;
        if (response && response.Table1) {
          this.detailList = response.Table1;
        } else {
          this.detailList = [];
        }
      },
      error: (error: any) => {
        this.isDetailLoading = false;
        this.sweetAlertService.error(error?.error?.message || 'Failed to fetch details');
      }
    });
  }

  closeDetailModal() {
    this.detailModalRef?.hide();
    this.detailList = [];
  }

  openDocketHistory() {
    if (!this.prqData) return;
    const indentNo = this.prqData.IndentNo || this.prqData.PRQNo;
    this.docketHistoryComponent.showPopup(indentNo);
  }

  viewInvoice(item:any){
      const baseUrl = `${this.env.liveUrl}UploadedDocumentsBAK/EwaybillInvoiceFile/Upload/${item}`; // Update folder name if needed
      window.open(baseUrl, '_blank');
  }
}
