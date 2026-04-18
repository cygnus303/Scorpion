import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime } from 'rxjs';
import { ThcEditComponent } from '../thc-edit/thc-edit.component';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-thc-list',
  standalone: true,
  imports: [NgSelectModule,CommonModule,ReactiveFormsModule,BsDatepickerModule,PaginationComponent,ThcEditComponent],
  providers: [BsModalService],
  templateUrl: './thc-list.component.html',
  styleUrl: './thc-list.component.scss'
})
export class ThcListComponent {
  public isLoading: boolean = false;
  public summaryData:any;
  public THCFilterForm !:FormGroup;
    @ViewChild('ThcEditComponent') ThcEditComponent!: ThcEditComponent;
  
  public pagination={
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  };
  statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Departed', label: 'Departed', color: 'departed', bg: 'var(--teal)', count: 0 },
    { value: 'Completed Journey', label: 'Completed Journey', color: 'completed-journey', bg: 'var(--orange)', count: 0 },
    { value: 'Cancelled', label: 'Cancelled', color: 'cancelled', bg: 'var(--red)', count: 0 },
    { value: 'Billed', label: 'Billed', color: 'billed', bg: 'var(--accent-hover)', count: 0 },
  ];
    public thcData = [
    {
      thcNo: 'VH/LTT/2526/001764',
      thcDate: '21-03-2026',
      totalDocket: '21',
      mFNO: 'MF/2526/00001',
      vendorType: 'ABC Logistics',
      vendorName: 'OWn Transport',
      vehicleNo: 'MH 04 AB 1234',
      serviceType:'Full Load',
      mode:'road',
      departureTime:'21-03-2026 08:00',
      PreviousLocation: 'Mumbai',
      THCRoute: 'Mumbai → Pune',
      LoadingHCCNo: 'HCC/2526/00001',
      UnloadingSheetNo: 'VH/ABH/2526/002487',
      status: 'Billed'
    },
    {
      thcNo: 'VH/ABH/2526/002487',
      thcDate: '22-03-2026',
      totalDocket: '15',
      mFNO: 'MF/2526/00002',
      vendorType: 'XYZ Freight',
      vendorName: 'XYZ Cargo Services',
      vehicleNo: 'GJ 01 CD 5678',
      serviceType:'Part Load',
      mode:'road',
      departureTime:'21-03-2026 08:00',
      PreviousLocation: 'Delhi',
      THCRoute: 'Delhi → Jaipur',
      LoadingHCCNo: 'HCC/2526/00002',
      UnloadingSheetNo: 'VH/LTT/2526/001763',
      status: 'Cancelled'
    },
    {
      thcNo: 'VH/RPR/2526/000068',
      thcDate: '23-03-2026',
      totalDocket: '32',
      mFNO: 'MF/2526/00003',
      vendorType: 'Quick Move',
      vendorName: 'Quick Move Logistics',
      vehicleNo: 'MH 12 KL 2345',
      serviceType:'Part Load',
      mode:'road',
      departureTime:'21-03-2026 08:00',
      PreviousLocation: 'Bangalore',
      THCRoute: 'Bangalore → Chennai',
      LoadingHCCNo: 'HCC/2526/00003',
      UnloadingSheetNo: 'VH/LTT/2526/001764',
      status: 'Completed Journey'
    },
     {
      thcNo: 'VH/RPR/2526/000068',
      thcDate: '23-03-2026',
      totalDocket: '32',
      mFNO: 'MF/2526/00003',
      vendorType: 'Quick Move',
      vendorName: 'Quick Move Logistics',
      vehicleNo: 'MH 12 KL 2345',
      serviceType:'Part Load',
      mode:'road',
      departureTime:'21-03-2026 08:00',
      PreviousLocation: 'Bangalore',
      THCRoute: 'Bangalore → Chennai',
      LoadingHCCNo: 'HCC/2526/00003',
      UnloadingSheetNo: 'VH/LTT/2526/001764',
      status: 'Departed'
    }
  ];

    constructor(private fb: FormBuilder,private docketService:DocketService,private router: Router) { }
  

    ngOnInit() {
      this.buildFilterForm()
    }
    
  
    buildFilterForm() {
      this.THCFilterForm = this.fb.group({
        fromDate: [new Date(new Date().setDate(new Date().getDate() - 7))],
        toDate: [new Date()],
        statusFilter: ['All'],
        searchText: ['']
      });
  
      this.THCFilterForm.valueChanges.pipe(
        debounceTime(300)
      ).subscribe(() => {
      });
    }
getStatusClass(status: string): string {
  switch (status) {
    case 'Billed':
      return 's-billed';   // yellow

    case 'Completed Journey':
      return 's-hcc'; // green/teal

    case 'Departed':
      return 's-gen'; // blue/orange

    case 'Cancelled':
      return 's-canc'; // red

    default:
      return '';
  }
  }

    openTHC() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '1';
      this.docketService.loginUserList = user;
      localStorage.setItem("loginUserList", JSON.stringify(user));
    }
    this.router.navigate(['Operation/ChallanList']);
  }

    openEditPopup(data: any) {
    this.ThcEditComponent.showPopup(data);
  }

}
