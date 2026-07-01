import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { DocketService } from 'app/shared/services/docket.service';
import { ExportService } from 'app/shared/services/export.service';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, Subscription } from 'rxjs';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SingleCnoteDrsUpdateComponent } from './single-cnote-drs-update/single-cnote-drs-update.component';
import { HCCDetailsComponent } from '../prs-generation-list/hcc-details/hcc-details.component';
import { environment } from 'environments/environment';
import { PRSDRSEditComponent } from '../prs-generation-list/prsdrs-edit/prsdrs-edit.component';
import { DRSUpdateListComponent } from './drs-update-list/drs-update-list.component';
import { HccViewComponent } from '../hcc-view/hcc-view.component';
import { MenuAccessService } from 'app/shared/services/menu-access.service';
import { DepsEntryComponent } from './deps-entry/deps-entry.component';
import { DepsDetailsComponent } from './deps-details/deps-details.component';

@Component({
  selector: 'app-drs-generation-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, FormsModule, PaginationComponent, ReactiveFormsModule, DRSUpdateListComponent, PRSDRSEditComponent, SingleCnoteDrsUpdateComponent, HCCDetailsComponent, HccViewComponent, DepsEntryComponent, DepsDetailsComponent],
  providers: [BsModalService],
  templateUrl: './drs-generation-list.component.html',
  styleUrl: './drs-generation-list.component.scss'
})
export class DrsGenerationListComponent {
  public DRSFilterForm !: FormGroup;
  public DRSData: any[] = [];
  public isLoading: boolean = false;
  private listSubscription?: Subscription;
  public summaryData: any;
  public isdownload: boolean = false;
  public requestCache = new Map<string, any>();

  refreshData() {
    this.requestCache.clear();
    this.fetchData();
  }
  public showUpdateModal: boolean = false;
  public selectedDRS: any;
  public env = environment;

  public pagination = {
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  };
  statusList = [
    { value: 'All', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 0 },
    { value: 'Generated', label: 'Generated', color: 'generated', bg: 'var(--teal)', count: 0 },
    { value: 'Updated', label: 'Updated', color: 'updated', bg: 'var(--orange)', count: 0 },
    { value: 'Billed', label: 'Billed', color: 'billed', bg: 'var(--accent-hover)', count: 0 },
    { value: 'Cancelled', label: 'Cancelled', color: 'cancelled', bg: 'var(--red)', count: 0 },
    { value: 'Delivered', label: 'Delivered', color: 'hcc-generated', bg: 'var(--green)', count: 0 },
    { value: 'Undelivered', label: 'UnDelivered', color: 'hcc-generated', bg: 'var(--green)', count: 0 },
  ];
  odaTypeList = [
    { value: '', label: 'All' },
    { value: 'ODA', label: 'ODA' },
    { value: 'Non ODA', label: 'Non ODA' }
  ];
  @ViewChild('singleCnoteDrsUpdateComponent') singleCnoteDrsUpdateComponent!: SingleCnoteDrsUpdateComponent;
  @ViewChild('HCCDetailsComponent') HCCDetailsComponent!: HCCDetailsComponent;
  @ViewChild('PRSDRSEditComponent') PRSDRSEditComponent!: PRSDRSEditComponent;
  @ViewChild('HccViewComponent') HccViewComponent!: HccViewComponent;
  @ViewChild('DepsEntryComponent') depsEntryComponent!: DepsEntryComponent;
  @ViewChild('DepsDetailsComponent') depsDetailsComponent!: DepsDetailsComponent;


  constructor(
    private prsdrsApiService: PRSDRSApiService,
    private fb: FormBuilder,
    private exportService: ExportService,
    private dockerService: DocketService,
    private route: Router,
    private sweetAlertService: SweetAlertService,
    public docketService:DocketService,
    public menuAccessService: MenuAccessService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.loginUserList.LocationCode = 'PIM'
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.buildFilterForm();
    this.fetchData();
    this.menuAccessService.loadMenuPermissions('DR1');
  }

  get isHQTR(): boolean {
    return this.docketService.loginUserList?.LocationCode === 'HQTR';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Generated': return 's-gen';
      case 'Billed': return 's-billed';
      case 'Delivered': return 's-hcc';
      case 'Undelivered': return 's-loading-hcc';
      case 'Cancelled': return 's-canc';
      case 'Loading HCC': return 's-loading-hcc';
      case 'Unloading HCC': return 's-Unloading-hcc';
      case 'Updated': return 's-updated';
      default: return '';
    }
  }

  getODAClass(status: string): string {
    switch (status) {
      case 'ODA': return 's-gen';
      case 'Non ODA': return 's-hcc';
      default: return '';
    }
  }

  buildFilterForm() {
    this.DRSFilterForm = this.fb.group({
      fromDate: [new Date()],
      toDate: [new Date()],
      statusFilter: ['All'],
      odaType: [''],
      searchText: [null]
    });

    this.DRSFilterForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.fetchData();
    });
  }

  filterByStatus(status: string) {
    this.DRSFilterForm.patchValue({ statusFilter: status }, { emitEvent: false });
    this.fetchData();
  }

  fetchData() {
    this.pagination.page = 1;
    this.getDRSdetail();
  }

  refreshFilter() {
    this.requestCache.clear();
    this.buildFilterForm();
    this.fetchData()
  }

  setPage(p: number) {
    if (this.pagination.page === p) return;
    this.pagination.page = p;
    this.getDRSdetail();
  }

  openHccView(data: any,chargeType:string){
    this.HccViewComponent.showPopup(data,chargeType,'D');
  }

  isHccValid(hcc: any): boolean {
    if (!hcc) return false;
    if (hcc === 'NO HCC' || hcc === 'NOHCC' || hcc === '0' || hcc === 0) return false;
    if (!isNaN(hcc) && Number(hcc) <= 0) return false;
    return true;
  }

    isHccOpen(hcc: any): boolean {
    if (hcc === null || hcc === undefined || hcc === '') return false;
    if (hcc === 'NO HCC' || hcc === 'NOHCC') return false;
    
    if (!isNaN(hcc)) {
      return Number(hcc) === 0;
    }
    
    return true;
  }

  onFilterChange() {
    this.pagination.page = 1;
    this.getDRSdetail();
  }

  formatDate(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatDateToISO(dateVal: any): string | null {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString();
  }

  getDRSdetail() {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }

    const payload = {
      fromDate: this.formatDateToISO(this.DRSFilterForm.value.fromDate),
      toDate: this.formatDateToISO(this.DRSFilterForm.value.toDate),
      locCode: this.docketService.loginUserList.LocationCode,
      statusFilter: this.DRSFilterForm.value.statusFilter,
      pageNumber: this.pagination.page,
      pageSize: this.pagination.pageSize,
      isDownload: false,
      odaType: this.DRSFilterForm.value.odaType,
      searchText: this.DRSFilterForm.value.searchText
    }

    const cacheKey = JSON.stringify(payload);
    if (this.requestCache.has(cacheKey)) {
      this.isLoading = false;
      const response = this.requestCache.get(cacheKey);
      this.DRSData = response.data;
      this.pagination.totalRecords = response.pagination.totalRecords;
      this.pagination.totalPages = response.pagination.totalPages;
      this.summaryData = response.summary;
      return;
    }

    this.isLoading = true;

    this.listSubscription = this.prsdrsApiService.getDRSList(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.requestCache.set(cacheKey, response);
        this.DRSData = response.data;
        this.pagination.totalRecords = response.pagination.totalRecords;
        this.pagination.totalPages = response.pagination.totalPages;
        this.summaryData = response.summary;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  downloadList() {
    this.isdownload = true;
    const payload = {
      fromDate: this.formatDateToISO(this.DRSFilterForm.value.fromDate),
      toDate: this.formatDateToISO(this.DRSFilterForm.value.toDate),
      locCode: this.docketService.loginUserList.LocationCode,
      statusFilter: this.DRSFilterForm.value.statusFilter,
      pageNumber: this.pagination.page,
      pageSize: this.pagination.pageSize,
      isDownload: true,
      odaType: this.DRSFilterForm.value.odaType,
      searchText: this.DRSFilterForm.value.searchText
    };
    this.listSubscription = this.prsdrsApiService.getDRSList(payload).subscribe({
      next: (response: any) => {
        this.isdownload = false;
        if (response && response.data) {
          this.exportService.exportToExcel(response.data, `DRS_Export`);
        }
      },
      error: (err: any) => {
        this.isdownload = false;
        console.error('Error downloading Excel', err);
      }
    });
  }

  onAddDRS() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      let user = JSON.parse(saved);
      user.Type = '3';
      this.dockerService.loginUserList = user;
      localStorage.setItem("loginUserList", JSON.stringify(user));
    }
    this.route.navigate(['Operation/ChallanList'], { queryParams: { fromPRS: 'true' } });
  }

  onCancel(drsNo: string) {
    this.sweetAlertService.cancel(`Are You Sure You Want to Cancel ${drsNo}?`, () => {
      this.onCancelDrs(drsNo);
    });
  }

  onCancelDrs(drsNo: string) {
    const payload = {
      baseUserName: this.dockerService.loginUserList?.BaseUserName,
      filterType: "D",
      pdcno: drsNo
    }
    this.prsdrsApiService.onCancelDRS(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.sweetAlertService.success(`DRS ${drsNo} has been cancelled successfully.`);
          this.refreshData();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  openUpdateModal(data: any) {
    this.selectedDRS = data;
    this.showUpdateModal = true;
  }

  closeModal() {
    this.showUpdateModal = false;
  }

  handleDataEmitter(event?: string) {
    if (event !== 'close') {
      this.refreshData();
    }
    this.closeModal();
  }

  openSingleDRSUpdate(data: any) {
    this.singleCnoteDrsUpdateComponent.showPopup(data);
  }

  openDeps(data: any, isEditMode: boolean = false) {
    this.depsEntryComponent.showPopup(data, isEditMode);
  }

  openDepsDetails(data: any) {
    this.depsDetailsComponent.showPopup(data);
  }

 
  openPRSDRSEdit(data: any, flag: string) {
    this.PRSDRSEditComponent.showPopup(data, flag);
  }

  openHCCModal(hccNo: string) {
    const url = `${this.env.liveUrl}Tracking/TripAllView?LsNO=${hccNo}&VPType=LoadingUnloading&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

  openHHCDetails(data: any) {
    this.HCCDetailsComponent.showPopup(data, 'D');
  }

  openView(drsNo: string) {
    const url = `${this.env.liveUrl}ViewPrint/ViewDRS?DocumentNo=${drsNo}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }
}
