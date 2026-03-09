import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationService } from 'app/shared/services/pagination.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MasterService } from 'app/shared/services/master.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { DocketService } from 'app/shared/services/docket.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-vendor-contract-list',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, FormsModule, RouterModule, CommonModule, SharedModule],
  templateUrl: './vendor-contract-list.component.html',
  styleUrl: './vendor-contract-list.component.scss'
})
export class VendorContractListComponent {
  public criteriaform!: FormGroup;
  public notFoundTextValue = 'Please enter at least 1 characters';
  public AttechedTypelist = [{ text: 'Route based for THC and Distance based for PRS/DRS', value: 'RB' }];
  public Contractlist = [{ text: 'Vendor', value: '1' }]
  public vendorTypeList = [
    { text: 'Attached', value: 'XX1' },
    { text: 'Business Associate', value: '04' }
  ];
  public contractList: any[] = [];
  public isListShow: boolean = false;
  public vendorList: any[] = [];
  public filteredList: any[] = [];
  public paginatedList: any[] = [];
  public isLoading = false;
  public searchText = '';
  public totalRecords = 0;
  public startIndex = 0;
  public endIndex = 0;
  public totalPages = 0;
  public env=environment;

  constructor(
    public paginationService: PaginationService,
    public router: Router,
    public masterService: MasterService,
    public docketService: DocketService
  ) { }
  
  ngOnInit() {
     const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.loginUserList.LocationCode =  'PIM';
      // this.docketService.loginUserList.loadBy = "B";
      // this.docketService.loginUserList.chargeType='1';
      // this.docketService.loginUserList.drsId='DS/PIM/2526/002766';
      this.docketService.loginUserList.Type = 'A';
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
      console.log(this.docketService.loginUserList , 'gggggggggg')
    }

    this.buildForm();
    this.OnChangeVendorType();
  }

  changeVendorType(event: any) {
    this.criteriaform.patchValue({
      Text: event.text
    });
  }

  changeVendor(event: any) {
    this.criteriaform.patchValue({
      Vendorname: event.text,
      VendorCode:event.id
    });
  }

  buildForm() {
    this.criteriaform = new FormGroup({
      VedorType: new FormControl(null, [Validators.required]),
      ContractType: new FormControl(null),
      ContractFor: new FormControl(null),
      VendorCode: new FormControl(null, [Validators.required]),
      Text: new FormControl(''),
      Vendorname: new FormControl(''),
      matrix:new FormControl('')
    })
  }

  OnChangeVendorType() {
    this.criteriaform.get('VedorType')?.valueChanges.subscribe(value => {
      const contractTypeControl = this.criteriaform.get('ContractType');
      const contractForControl = this.criteriaform.get('ContractFor');

      if (value === 'XX1') {
        // Add required validator
        contractTypeControl?.setValidators([Validators.required]);
        contractForControl?.setValidators([Validators.required]);
      } else {
        // Remove validator
        contractTypeControl?.clearValidators();
        contractForControl?.clearValidators();

        // Reset values when hidden
        contractTypeControl?.setValue(null);
        contractForControl?.setValue(null);
      }

      // Update validation status
      contractTypeControl?.updateValueAndValidity();
      contractForControl?.updateValueAndValidity();
    });
  }

  getVendorList(searchTerm: string = '') {
    const params = {
      flag: this.docketService.loginUserList.Type === 'A' ? 'Add' : 'Edit',
      vendorType: this.criteriaform.get('VedorType')?.value,
      searchTerm: searchTerm
    };
    this.notFoundTextValue = 'Searching';

    this.masterService.getVendorData(params).subscribe({
      next: (response: any) => {
        this.vendorList = response;
        this.notFoundTextValue = 'No matches found';
      }
    });
  }

  resetVendorDropdown() {
    this.vendorList = [];
    this.notFoundTextValue = 'Enter at least 1 characters';
  }

  getVendorContract() {
    if (this.criteriaform.valid) {
      this.isListShow = true;

      const contractType = this.criteriaform.value.ContractType;
      const contractFor = this.criteriaform.value.ContractFor;
      const Type = this.criteriaform.value.VedorType;
      var matrix = '';

      if (contractType != null && contractType != "") {
        if (contractType == "RB") {
          if (contractFor == "1") {
            matrix = "01";
          }
          else if (contractFor == "2") {
            matrix = "02";
          }
          else {
            matrix = "03";
          }
        } else if (contractType == "CB") {
          if (contractFor == "1") {
            matrix = "09";
          }
          else if (contractFor == "2") {
            matrix = "10";
          }
          else {
            matrix = "11";
          }
        } else {
          if (contractFor == "1") {
            matrix = "04";
          }
          else if (contractFor == "2") {
            matrix = "05";
          }
          else {
            matrix = "06";
          }
        }
      } else {
        if (Type == "08" || Type == "XX5" || Type == "04") {
          matrix = "07";
        }
      }

      this.criteriaform.patchValue({
        matrix:matrix
      })

      this.getContractList(matrix)

    } else {
      this.criteriaform.markAllAsTouched();
      this.isListShow = true;
    }
  }


  getContractList(matrixType: string) {
    this.isLoading = true;
    const parmas = {
      vendorCode: this.criteriaform.value.VendorCode,
      matrixType: matrixType,
      vType: this.criteriaform.value.VedorType
    }

    this.masterService.getVendorList(parmas).subscribe({
      next: (response: any) => {
        this.contractList = response;
        this.paginationService.currentPage = 1;
        this.updateTable();
      },
      complete: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    })
  }

  updateTable() {
    const result = this.paginationService.paginate(
      this.contractList,
      this.searchText
    );
    this.filteredList = result.filtered;
    this.paginatedList = result.paginatedList;
    this.startIndex = result.startIndex;
    this.endIndex = result.endIndex;
    this.totalPages = result.totalPages;
    this.totalRecords = result.filtered.length;

  }

  getPages(): number[] {
  return Array(this.totalPages).fill(0).map((x, i) => i + 1);
}

  goToPage(page: number) {
    this.paginationService.currentPage = page;
    this.updateTable();
  }

  onView(item:any){
   const url = `${this.env.liveUrl}/Operation/VendorContractViewPrint?ContractID=${item.contractcd}&Type=${item.vendorType}`;
   window.open(url, '_blank');
  }

  goToNext() {
    if (this.paginationService.currentPage < this.totalPages) {
      this.paginationService.currentPage++;
      this.updateTable();
    }
  }

  goToPrevious() {
    if (this.paginationService.currentPage > 1) {
      this.paginationService.currentPage--;
      this.updateTable();
    }
  }

goToBackList() {
      const { Vendorname, ContractFor, ...rest } = this.criteriaform.value;
    const formValues = {
      ...rest,
      flag:this.docketService.loginUserList.Type
    };
    this.router.navigate(['/Master/VendorContract'], { queryParams: formValues });
  }

  onSearch() {
    this.paginationService.currentPage = 1;
    this.updateTable();
  }

onSort(event: any) {
  this.paginationService.sortColumn = event.column;
  this.paginationService.sortDirection = event.direction;
  this.paginationService.currentPage = 1;
  this.updateTable();
}

  onEditPage(item: any) {
    const { Vendorname, ContractFor, ...rest } = this.criteriaform.value;
    const formValues = {
      ...rest,
      ContractId: item.contractcd,
      flag:this.docketService.loginUserList.Type
    };
    this.router.navigate(['/Master/VendorContract'], { queryParams: formValues });
  }
}
