import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { environment } from 'environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ThcArrivalPopupComponent } from '../thc-arrival-popup/thc-arrival-popup.component';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-thc-arrival-list',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,NgSelectModule,BsDatepickerModule,PaginationComponent,ThcArrivalPopupComponent],
  providers:[BsModalService],
  templateUrl: './thc-arrival-list.component.html',
  styleUrl: './thc-arrival-list.component.scss'
})
export class ThcArrivalListComponent {
  public isLoading :boolean = false;
  public env = environment;
    @ViewChild('ThcArrivalPopupComponent') ThcArrivalPopupComponent!:ThcArrivalPopupComponent ;
    

 statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Pending For Arrival', label: 'Pending For Arrival', color: 'pending-for-arrival', bg: 'var(--teal)', count: 0 },
    { value: 'Arrival Completed', label: 'Arrival Completed', color: 'arrival-completed', bg: 'var(--orange)', count: 0 },
    { value: 'HCC Generated', label: 'HCC Generated', color: 'hcc-generated', bg: 'var(--green)', count: 0 },
  ];
   public pagination = {
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  };

  public arrivalData=[
    {
      thcNo:'VH/LTT/2526/001764',
      thcDate:'21-03-2026',
      totalDocket:'21',
      mFNO:'MF/2526/00001',
      vendorType:'ABC Logistics',
      vendorName:'OWn Transport',
      ATD:'21-03-2026',
      ETA:'21-03-2026',
      PreviousLocation:'Mumbai',
      THCRoute:'Mumbai → Pune',
      LoadingHCCNo:'HCC/2526/00001',
      UnLoadingHCCNo:'HCC/2526/00011',
      UnloadingSheetNo:'VH/ABH/2526/002487',
      status:'Billed'
    },
    {
      thcNo:'VH/ABH/2526/002487',
      thcDate:'22-03-2026',
      totalDocket:'15',
      mFNO:'MF/2526/00002',
      vendorType:'XYZ Freight',
      vendorName:'XYZ Cargo Services',
      ATD:'22-03-2026',
      ETA:'22-03-2026',
      PreviousLocation:'Delhi',
      THCRoute:'Delhi → Jaipur',
      LoadingHCCNo:'HCC/2526/00002',
      UnLoadingHCCNo:'HCC/2526/00012',
      UnloadingSheetNo:'VH/LTT/2526/001763',
      status:'HCC Generated'
    },
    {
      thcNo:'VH/RPR/2526/000068',
      thcDate:'23-03-2026',
      totalDocket:'32',
      mFNO:'MF/2526/00003',
      vendorType:'Quick Move',
      vendorName:'Quick Move Logistics',
      ATD:'23-03-2026',
      ETA:'23-03-2026',
      PreviousLocation:'Bangalore',
      THCRoute:'Bangalore → Chennai',
      LoadingHCCNo:'HCC/2526/00003',
      UnLoadingHCCNo:'HCC/2526/00013',
      UnloadingSheetNo:'VH/LTT/2526/001764',
      status:'Arrival Completed'
    }
  ]

    getStatusClass(status: string): string {
    switch (status) {
      case 'Billed': return 's-gen';
      case 'HCC Generated': return 's-billed';
      case 'Arrival Completed': return 's-hcc';
      default: return '';
    }
  }

  openUnloadingSheet(unloadingSheetNo: string) {
     const url = `${this.env.liveUrl}ViewPrint/UnLoadingSheet_ViewPrint?LSNo=${unloadingSheetNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }

  }

  openThcArrival(data:any){
    this.ThcArrivalPopupComponent.showPopup(data);

  }
}
