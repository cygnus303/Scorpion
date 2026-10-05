import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-lr-print',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lr-print.component.html',
  styleUrls: ['./lr-print.component.scss']
})
export class LrPrintComponent implements OnInit {
  @ViewChild('lrPrintModal', { static: true }) template!: TemplateRef<any>;
  modalRef?: BsModalRef;

  public data: any;
  public selectedFormat: string = '';

  constructor(private modalService: BsModalService,private dynamicDataService:DynamicDataService) { }

  ngOnInit(): void { }

  openModal(lrData: any) {
    this.data = lrData;
    this.selectedFormat = ''; // reset on open
    this.modalRef = this.modalService.show(this.template, {
      class: 'modal-md modal-dialog-centered custom-lr-print-modal'
    });
  }

  selectFormat(format: string) {
    this.selectedFormat = format;
    const url = `/Operation/lr-print-preview/${this.data.dockno}?customer=${format}`;
    window.open(url, '_blank');
    this.closeModal();
    // this.fetchLrData(this.data.dockno);
  }
  fetchLrData(docketNo: string) {
    const payload = {
      "FilterJson": {
        "ReportId": "389",
        "DocketNo": docketNo
      }
    };
    this.dynamicDataService.getDynamicData(payload).subscribe((response: any) => {
      if (response && response.Table1 && response.Table1.length > 0) {
       console.log(response.Table1[0]) ;
      }
    });
  }
  closeModal() {
    this.modalRef?.hide();
  }
}
