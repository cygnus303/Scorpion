import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { PFMService } from 'app/shared/services/pfm.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-fmreport-list',
  standalone: true,
  imports: [CommonModule,NgSelectModule],
  templateUrl: './fmreport-list.component.html',
  styleUrl: './fmreport-list.component.scss'
})
export class FMReportListComponent {
  filterData: any;
  public fmList:any[]=[];
  env = environment;
  


  constructor(public pfmService:PFMService){}

  ngOnInit(){
     this.filterData = history.state.filterData;
    console.log('Received:', this.filterData);
    this.getFMList();
  }

  getFMList(){
    const payload={
      fromDate: this.filterData?.dateRange?.[0]? new Date(this.filterData.dateRange[0]).toISOString(): null,
      toDate: this.filterData?.dateRange?.[1]? new Date(this.filterData.dateRange[1]).toISOString(): null,
      ro: this.filterData.RO,
      loccode: this.filterData.Loccode,
      FmNo: this.filterData.FmNo || '',
      fM_Status: this.filterData.fM_Status
    }
    this.pfmService.getFMReport(payload).subscribe({
      next:(response)=>{
        this.fmList=response;
      }
    })
  }

  onView(selectedData:any){
    const url = `${this.env.liveUrl}ViewPrint/PFM_View_Print_Report?PFMNo=${selectedData.fm_no}&DocType=${selectedData.fm_doc_type}`;

      window.open(url, '_blank');
  }
}
