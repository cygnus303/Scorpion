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
  public groupedDocketDetails: any[] = [];
  
  public totalEwayBills: number = 0;
  public totalDimensions: number = 0;

  public assignmentHistory: any[] = [];
  public isHistoryLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService,
    private sweetAlertService: SweetAlertService
  ) {}

  showPopup(prqNo: string) {
       this.modalRef = this.modalService.show(this.Templatepod, {
      backdrop: 'static',
      class: 'modal-xl modal-dialog-centered'
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
          this.fetchDocketDetails(prqNo);
          this.getAssignmentHistory(prqNo);
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

  fetchDocketDetails(prqNo: string) {
    this.isDetailLoading = true;
    this.groupedDocketDetails = [];
    
    // API payload to fetch EWay Bill and Volumetric details (ReportId 286)
    const payload = {
      "FilterJson": {
        "ReportId": '286',
        "IndentNo": prqNo
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isDetailLoading = false;
        if (response && response.Table1) {
          this.detailList = response.Table1;
          // Group the flattened API response by Docket No.
          this.groupDetailsByDocket();
        } else {
          this.detailList = [];
        }
      },
      error: (error: any) => {
        this.isDetailLoading = false;
        // Don't show error if no details found, just leave empty
      }
    });
  }

  getAssignmentHistory(prqNo: string) {
    this.isHistoryLoading = true;
    this.assignmentHistory = [];
    const payload = {
      "FilterJson": {
        "ReportId": "386",
        "PRQNo": prqNo
      }
    };

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isHistoryLoading = false;
        if (response && response.Table1) {
          this.assignmentHistory = response.Table1;
        }
      },
      error: (error: any) => {
        this.isHistoryLoading = false;
      }
    });
  }

  // This method groups the flat list of EWay/Volumetric details into a structured array
  // where each Docket has its own list of invoices and dimensions.
  groupDetailsByDocket() {
    const groups: { [key: string]: any } = {};
    this.totalEwayBills = 0;
    this.totalDimensions = 0;
    
    this.detailList.forEach(item => {
      // Find the Docket number from the item object
      const dockNo = item.DOCKNO || item.DockNo;
      if (!dockNo) return;
      
      // Initialize the group for this Docket if it doesn't exist yet
      if (!groups[dockNo]) {
        groups[dockNo] = {
          dockNo: dockNo,
          indentNo: item.IndentNo,
          invoices: [],
          dimensions: []
        };
      }
      
      // -- INVOICE DETAILS LOGIC --
      // Check if this item is an invoice row (has EWayBillNo or INVNO)
      // Since the API returns flattened data (Cartesian product of invoices x dimensions), 
      // we need to avoid adding duplicate invoice entries.
      const invoiceExists = groups[dockNo].invoices.find((inv: any) => inv.INVNO === item.INVNO && inv.EWayBillNo === item.EWayBillNo);
      if (!invoiceExists && (item.INVNO || item.EWayBillNo)) {
        groups[dockNo].invoices.push(item);
        this.totalEwayBills++;
      }
      
      // -- VOLUMETRIC DETAILS LOGIC --
      // Check if this item is a volumetric row (has VOL_L)
      // Similarly, prevent duplicate dimension entries by checking SrNo
      const dimensionExists = groups[dockNo].dimensions.find((dim: any) => dim.SrNo === item.SrNo);
      if (!dimensionExists && item.VOL_L) {
        groups[dockNo].dimensions.push(item);
        this.totalDimensions++;
      }
    });
    
    // Convert the dictionary object back to an array for easier *ngFor binding in HTML
    this.groupedDocketDetails = Object.values(groups);
  }

  scrollToDocketDetails() {
    const element = document.getElementById('docketDetailsSection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
