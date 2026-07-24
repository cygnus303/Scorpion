import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LrService } from 'app/shared/services/lr.service';
import { LrViewComponent } from 'app/components/lr-list/lr-view/lr-view.component';

@Component({
  selector: 'app-lr-documents-tab',
  standalone: true,
  imports: [CommonModule, LrViewComponent],
  templateUrl: './lr-documents-tab.component.html',
  styles: []
})
export class LrDocumentsTabComponent implements OnInit {
  @Input() lrDetails: any;
  @ViewChild('LrViewComponent') LrViewComponent: any;

  onViewClick(row: any) {
    if (this.LrViewComponent) {
      this.LrViewComponent.showPopup(row);
    }
  }

  public documentData: any = null;
  public isLoading: boolean = true;

  constructor(private lrService: LrService) {}

  ngOnInit() {
    if (this.lrDetails) {
      const dockNo = this.lrDetails.lR_Number || this.lrDetails.lrNumber || this.lrDetails.LrNumber || this.lrDetails.dockNo;
      if (dockNo) {
        this.fetchDocumentTracking(dockNo);
      } else {
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  fetchDocumentTracking(dockNo: string) {
    this.isLoading = true;
    this.lrService.getDocumentTracking(dockNo).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.data) {
          this.documentData = res.data;
        } else if (res && !res.success && res.prqDetails) {
          this.documentData = res;
        } else if (res) {
          this.documentData = res;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}
