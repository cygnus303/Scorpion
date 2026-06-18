import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DocketService } from 'app/shared/services/docket.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-deps-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deps-details.component.html',
  styleUrl: './deps-details.component.scss'
})
export class DepsDetailsComponent {
  env = environment;
  public modalRef!: BsModalRef;
  public drsNo: string = '';
  public depsNo: string = '';
  public dateStr: string = '';
  public vendorName: string = '';
  public totalDeliveredDockets: number = 0;
  public generatedBy: string = '';
  public totalExceptions: number = 0;
  public depsList: any[] = [];
  public isLoading: boolean = false;

  @Output() dataEmitter = new EventEmitter<void>();
  @ViewChild('TemplateDepsDetails', { static: true }) TemplateDepsDetails!: TemplateRef<any>;

  constructor(private modalService: BsModalService,private docketService: DocketService,private thcMasterService: THCMasterService) {}

  showPopup(data: any) {
    this.drsNo = data.drsNo;
    this.depsNo = data.depsNo ;
    this.vendorName = data.vendorName ;
    this.totalDeliveredDockets = data.deliveredCount || data.totalDockets || 0;
    this.dateStr = data.drsDate ;
    const username = this.docketService.loginUserList?.BaseUserName ;
    const location = this.docketService.loginUserList?.LocationCode ;
    this.generatedBy = `${username} / ${location}`;
    this.isLoading = true;
    this.thcMasterService.getHCCDynamicData({
      FilterJson: {
        ReportId: '365',
        Thcno: this.drsNo
      }
    }).subscribe({next: (res: any) => {
        this.isLoading = false;
        const list = (res && res.success && res.data && res.data.Table1) || (res && res.Table1) || [];
        // Attach full URL for image files
        this.depsList = list.map((item:any) => ({
          ...item,
          fileUrl: `${this.env.liveUrl}Uploads/${item.DepsImage}`
        }));
        this.totalExceptions = this.depsList.length;
        this.modalRef = this.modalService.show(this.TemplateDepsDetails, {
          class: 'modal-xxl modal-dialog-centered deps-details-modal-wrapper',
          backdrop: 'static'
        });
      }});
  }

  getDepsTypeLabel(type: string): string {
    if (type === 'D') {
      return 'Damage';
    } else if (type === 'S') {
      return 'Shortage';
    }
    return type || '—';
  }

  getDepsTypeClass(type: string): string {
    if (type === 'D') return 'badge-damage';
    if (type === 'S') return 'badge-shortage';
    return 'badge-secondary';
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  printDetails() {
    // Inject dynamic style tag to override page margin globally (removes browser header/footer)
    const style = document.createElement('style');
    style.id = 'deps-print-page-margins';
    style.innerHTML = '@page { margin: 0 !important; }';
    document.head.appendChild(style);

    document.documentElement.classList.add('deps-printing-mode');
    document.body.classList.add('deps-printing-mode');
    
    const afterPrint = () => {
      document.documentElement.classList.remove('deps-printing-mode');
      document.body.classList.remove('deps-printing-mode');
      
      const styleEl = document.getElementById('deps-print-page-margins');
      if (styleEl) {
        styleEl.remove();
      }
      
      window.removeEventListener('afterprint', afterPrint);
    };
    
    window.addEventListener('afterprint', afterPrint);
    setTimeout(() => {
      window.print();
    }, 50);
  }
}
