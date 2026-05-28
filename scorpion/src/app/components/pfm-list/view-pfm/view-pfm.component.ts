import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { DocketService } from 'app/shared/services/docket.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-view-pfm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-pfm.component.html',
  styleUrls: ['./view-pfm.component.scss'],
  providers: [BsModalService]
})
export class ViewPfmComponent {
  public modalRef!: BsModalRef;
  public env = environment;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  public pfmData: any = {};
  public pfmDataViewList: any = {};
  public isLoading: boolean = false;

  constructor(private modalService: BsModalService, private pfmapiService: PFMapiService, public docketService: DocketService) { }

  showPopup(data: any) {
    this.pfmDataViewList = data;
    console.log('View PFM Selected Data:', data);
    this.isLoading = true;
    const fM_No = data?.fM_No;
    if (fM_No) {
      this.pfmapiService.GetCourierDetails(fM_No).subscribe({
        next: (response: any) => {
          this.pfmData = response;
          this.isLoading = false;
          this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
        }
      });
    } else {
      this.pfmData = { header: { pfM_Number: data?.fM_No, fM_Status: 'Pending' }, lrList: [data] };
      this.isLoading = false;
      this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
    }
  }

  extractOrigin(fromTo: string): string {
    if (!fromTo) return '—';
    return fromTo.split(':')[0]?.trim() || '—';
  }

  extractDestination(fromTo: string): string {
    if (!fromTo) return '—';
    const parts = fromTo.split(':');
    return parts.length > 1 ? parts[1].trim() : '—';
  }

  downloadPFM(DocumentNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewPFM?DocumentNo=${DocumentNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }

  }

}
