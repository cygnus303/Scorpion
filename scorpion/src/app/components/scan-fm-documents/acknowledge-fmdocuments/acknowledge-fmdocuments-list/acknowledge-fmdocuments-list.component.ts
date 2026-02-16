import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { PFMService } from 'app/shared/services/pfm.service';
import { DocketService } from 'app/shared/services/docket.service';
import { environment } from 'environments/environment';

@Component({
   selector: 'app-acknowledge-fmdocuments-list',
   standalone: true,
   imports: [CommonModule, NgSelectModule],
   templateUrl: './acknowledge-fmdocuments-list.component.html',
   styleUrl: './acknowledge-fmdocuments-list.component.scss'
})
export class AcknowledgeFmdocumentsListComponent {
   public detailList: any = null;
   public filterData: any;
   public isLoading = false;
   public responseData: any;
   env = environment;
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
      this.PFMService.getFMDOCDetail(document.fm_no).subscribe({ next: (res: any) => {
            this.detailList = res;
         }
      });
   }

   OnEditPage(fmNo: string) {
      this.router.navigate(['/Document/ForwardFMDocumentsEdit'], { queryParams: { FMNO: fmNo, Type: 'Edit' } });
   }

   toggleAll(event: any) {
      const checked = event.target.checked;
      this.responseData?.listVWFDFAM?.forEach((item: any) => {
         item.active = checked;
      });
   }

   toggleSingle(event: any, item: any) {
      item.active = event.target.checked;
   }

   isAllSelected(): boolean {
      const list = this.responseData?.listVWFDFAM || [];
      return list.length > 0 && list.every((item: any) => item.active);
   }

   isAnySelected(): boolean {
      const list = this.responseData?.listVWFDFAM || [];
      return list.some((item: any) => item.active);
   }

   onSubmit() {
      const selectedList = (this.responseData?.listVWFDFAM || []).filter((item: any) => item.active);
      const payload = {
         fmType: this.filterData.fmType,
         locCode: this.filterData.locCode,
         baseUserName: this.docketService.loginUserList.BaseUserName,
         ackList: selectedList.map((item: any) => ({
            ...item,
            manual_dockno: ''
         }))
      };
      console.log(payload)
      this.PFMService.onSubmitAcknowledge(payload).subscribe({
         next: (response) => {
            if(response.success){
               this.router.navigate(['/Document/ForwardFMDocumentsDone'], { queryParams: { fmNo: response.fmNo,fmType:this.filterData.fmType, Type: '2' } });
            }
            // window.parent.location.href = `${this.env.liveUrl}Document/ForwardFMAckDocumentsDone&src=angular`;
         }
      })
   }
}
