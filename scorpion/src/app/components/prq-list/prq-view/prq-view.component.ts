import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-prq-view',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './prq-view.component.html',
  styleUrl: './prq-view.component.scss'
})
export class PrqViewComponent {
   @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
   public modalRef!: BsModalRef;
  public prqData: any = null;
  public isLoading: boolean = false;

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
}
