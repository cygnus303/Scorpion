import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-pfm-number-generated',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pfm-number-generated.component.html',
  styleUrl: './pfm-number-generated.component.scss',
  providers: [BsModalService]
})
export class PFMNumberGeneratedComponent {
  public modalRef!: BsModalRef;
  public selectedRecords: any[] = [];
  public fM_No: string = '';
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  constructor(private modalService: BsModalService, public PFMapiService: PFMapiService, public docketService: DocketService) { }

  showPopup(data: any) {
    console.log('PFM Selected Data:', data);
    this.selectedRecords = data || [];
    this.savePFM();
  }

  formatFromTo(val: string): string {
    if (!val) return '—';
    return val.replace(':', ' → ');
  }

  savePFM() {
    const payload = {
      header: {
        fM_No: "",
        fM_Date: new Date().toISOString(),
        manual_FM_No: "",
        fM_Doc_Type: "1",
        fM_FWD_CurrYear: this.docketService.loginUserList.FinYear,
        total_Documents: this.selectedRecords.length,
        entryBy: this.docketService.loginUserList.UserId,
        fM_FWD_LocCode: this.docketService.loginUserList.LocationCode
      },
      dockets: this.selectedRecords.map(({ party_name, fM_Status, fM_Ack_Status, displayStatus, daysSince, checked, ...rest }) => ({
        ...rest,
        currLoc:'HQTR',
        documentNo: 'N/A',
        DocumentDate: new Date().toISOString(),
        Scan_Status_New: ''
      })),
      Type: 'CODDODPOD',
      BaseFinYear: this.docketService.loginUserList.FinYear
    };

    this.PFMapiService.PFMgenerate(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.fM_No = response.fM_No;
          this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
          this.dataEmitter.emit('PFM saved successfully');
        }
      },
      error: (err) => {
        console.error('Error generating PFM:', err);
      }
    });
  }
}
