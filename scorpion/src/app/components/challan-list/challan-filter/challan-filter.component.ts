import { Component } from '@angular/core';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'challan-filter',
  standalone: false,
  templateUrl: './challan-filter.component.html',
  styleUrl: './challan-filter.component.scss'
})
export class ChallanFilterComponent {
constructor(public docketService:DocketService , public commonService:CommonService){}
dateRange: [Date, Date] = [new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)];
}
