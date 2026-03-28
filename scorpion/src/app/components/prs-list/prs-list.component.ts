import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChallanService } from 'app/shared/services/challan.service';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { SortService } from 'app/shared/services/sort.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-prs-list',
  standalone: true,
  imports: [CommonModule, RouterModule,NgSelectModule,ReactiveFormsModule,BsDatepickerModule,FormsModule],
  templateUrl: './prs-list.component.html',
  styleUrl: './prs-list.component.scss'
})
export class PrsListComponent {
  public arrivalFilterForm!:FormGroup;
  public arrivalList:any[]=[];
  public filteredArrivalList:any[]=[];
  public paginatedList: any[] = [];
  public totalPages = 0;
  public pages: number[] = [];
  public startIndex = 0;
  public endIndex = 0;
  public sortColumn: string = '';
  public sortDirection: 'asc' | 'desc' = 'asc';
  public isLoading = false;
  public searchText: string = '';


  public recordOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '15', value: 15 },
    { label: '20', value: 20 },
    { label: 'All', value: 'all' }
  ];
  public selectedRecordCount: any = 10;
    public currentPage = 1;




  constructor(
    public commonService:CommonService,
    public generalMasterService:GeneralMasterService,
    private THCMasterService:THCMasterService,
    public docketService:DocketService,
    private sortService: SortService,
    
  ){}

  ngOnInit(){
    this.buildFilterForm();
    this.getVendorType();
    this.generalMasterService.getChargeTypeData();
     this.arrivalFilterForm.get('UnloadBy')?.valueChanges.subscribe((value) => {
          const rateTypeControl = this.arrivalFilterForm.get('RateType');
          if (value !== 'XX9' && value !== 'XX5') {
            rateTypeControl?.setValidators([Validators.required]);
          } else {
            rateTypeControl?.clearValidators();
            rateTypeControl?.setValue(null);
          }
          rateTypeControl?.updateValueAndValidity();
        });
    
  }

  buildFilterForm(){
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 29);
  
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
      this.arrivalFilterForm=new FormGroup({
        fromdt:new FormControl(formatDate(fromDate)),
        todt:new FormControl(formatDate(today)),
        DocNo:new FormControl(null),
        UnloadBy:new FormControl(null),
        RateType:new FormControl(null),
        reportrange:new FormControl([fromDate, today]),
      })
  }

  getVendorType() {
    this.THCMasterService.getVendorType(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          const userType = Number(this.docketService.loginUserList.Type);  // 1 / 2 / 3
          const typeToIndex: any = {
            3: 0,   // D
            2: 1,   // P
            1: 2    // M
          };
          const index = typeToIndex[userType];
          if (index !== undefined && response.data[index]) {
            this.generalMasterService.getLoadingByDetail(response.data[index].loading_VendorType);
          }
        }
      }
    });
  }

  formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];
  const month = months[date.getMonth()];
  return `${day} ${month} ${year}`;
  }

  getArrivalList(){
    if(this.arrivalFilterForm.valid){
    this.isLoading = true;

      const payload={
        fromDate: this.formatDate(this.arrivalFilterForm?.value.reportrange[0]),
        toDate: this.formatDate(this.arrivalFilterForm?.value.reportrange[1]),
        docNo: this.arrivalFilterForm.value.DocNo,
        unloadBy: this.arrivalFilterForm.value.UnloadBy,
        rateType: this.arrivalFilterForm.value.RateType,
        baseLocationCode: this.docketService.loginUserList.LocationCode
      }
      this.THCMasterService.getPRSArrivalList(payload).subscribe({
        next: (response:any) => {
          if(response){
            this.arrivalList=response;
             this.filteredArrivalList = [...this.arrivalList];
        this.currentPage = 1;
        this.updatePagination();

          }
        }, complete: () => {
         this.isLoading = false;
      },
      error: () => {
         this.isLoading = false;
      }
      });

    }
  }

  onRecordCountChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const list = this.filteredArrivalList;
    if (this.selectedRecordCount === 'all') {
      this.paginatedList = list;
      this.totalPages = 1;
      this.pages = [1];
      this.startIndex = list.length > 0 ? 0 : 0;
      this.endIndex = list.length;
      return;
    }

    this.totalPages = Math.ceil(list.length / this.selectedRecordCount) || 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.startIndex = (this.currentPage - 1) * this.selectedRecordCount;
    this.endIndex = Math.min(
      this.startIndex + this.selectedRecordCount,
      list.length
    );
    this.paginatedList = list.slice(this.startIndex, this.endIndex);
  }

  sort(column: string) {

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredArrivalList = this.sortService.sort(
      this.filteredArrivalList,
      column as any,
      this.sortDirection
    );

    this.updatePagination();
  }

    goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  applyFilter() {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.filteredArrivalList = [...this.arrivalList];
    }

    else {
      this.filteredArrivalList = this.arrivalList.filter(item =>
        item.pdcno?.toLowerCase().includes(search) ||
        item.pdcdt?.toLowerCase().includes(search) ||
        item.vendorCode?.toLowerCase().includes(search) ||
        item.vehno?.toLowerCase().includes(search) ||
        item.pdcbr?.toLowerCase().includes(search)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  onPDCNo(){

  } 


}
