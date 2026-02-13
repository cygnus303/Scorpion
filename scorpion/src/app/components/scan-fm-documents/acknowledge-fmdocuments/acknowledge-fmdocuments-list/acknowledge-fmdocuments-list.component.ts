import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { PFMService } from 'app/shared/services/pfm.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
   selector: 'app-acknowledge-fmdocuments-list',
   standalone: true,
   imports: [CommonModule, NgSelectModule],
   templateUrl: './acknowledge-fmdocuments-list.component.html',
   styleUrl: './acknowledge-fmdocuments-list.component.scss'
})
export class AcknowledgeFmdocumentsListComponent {
   public detailList: any = null;
   public isDetailLoading = false;
   public filterData: any;
   public isLoading = false;
   public responseData: any;
   constructor(private router: Router, private PFMService: PFMService, private docketService: DocketService) { }
   
   goToBackList() {
      this.router.navigate(['/Document/AcknowledgeFMDocumentsQuery']);
   }

   ngOnInit() {
      this.filterData = history.state.filterData;
      this.getForwardFMDocumentList();
   }

   getForwardFMDocumentList() {
      this.isLoading = true;
      const payload = {
         fromDate: this.filterData?.dateRange?.[0] ? new Date(this.filterData.dateRange[0]).toISOString() : null,
         toDate: this.filterData?.dateRange?.[1] ? new Date(this.filterData.dateRange[1]).toISOString() : null,
         fmType: this.filterData.fmType,
         locCode: this.filterData.locCode,
         fmNo: this.filterData.fmNo || '',
         baseLocCode: this.docketService.loginUserList.LocationCode
      };
      this.PFMService.getForwardFMAckDocuments(payload).subscribe({
         next: (response) => {
            this.responseData = response;
         },
         complete: () => {
            this.isLoading = false;
         },
         error: () => {
            this.isLoading = false;
         }
      });
   }

   openDetails(document: any) {
      this.isDetailLoading = true;
      this.PFMService.getFMDOCDetail(document.fm_no).subscribe({
         next: (res: any) => {
            this.detailList = res;
            this.isDetailLoading = false;
         },
         error: () => {
            this.isDetailLoading = false;
         }
      });
   }
}
