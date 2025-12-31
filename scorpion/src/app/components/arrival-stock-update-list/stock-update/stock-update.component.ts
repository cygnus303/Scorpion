import { CommonModule, formatCurrency } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UnloaderUsers, WarehouseList } from 'app/shared/models/stock-update.model';
import { CommonService } from 'app/shared/services/common.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-stock-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule,SharedModule],
  templateUrl: './stock-update.component.html',
  styleUrl: './stock-update.component.scss'
})
export class StockUpdateComponent {
public unloaderUsers:UnloaderUsers[]=[];
public notUnloaderName:string='Enter at least 3 characters';
public stockUpdateForm!:FormGroup;
public warehouseList:WarehouseList[]=[];
public stockData:any;
conditionList = [
  { text: 'GOOD', value: 1 },
  { text: 'SHORT', value: 2 },
  { text: 'DAMAGE', value: 3 },
  { text: 'OPEN CONDITION', value: 4 },
  { text: 'PILFERAGE', value: 5 }
];

 constructor(public docketService: DocketService, public commonService: CommonService,private stockUpdateService:StockUpdateService,public generalMasterService:GeneralMasterService) { }

  ngOnInit(){
    this.buildForm()
    this.generalMasterService.getDeliveryProcessData();
    this.getStockUpdateDetails();
    this.getWarehouseData();
    this.generalMasterService.getDamageData();
  }

  buildForm(){
         this.stockUpdateForm = new FormGroup({
      hDamage:  new FormControl(false),
      hCondition:new FormControl(),
      hWarehouse:new FormControl(),
      hPilferage: new FormControl(false),
      hDeliveryProcess : new FormControl(null),
      stockUpdateList: new FormArray([]),
      UpdateDate:new FormControl(this.getCurrentDateTime())
    });
  }

    getCurrentDateTime(): string {
    const now = new Date();

    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // 12-hour format

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }

  get stockUpdateArray(): FormArray {
    return this.stockUpdateForm.get('stockUpdateList') as FormArray;
  }

  stockUpdateUsers(event:any) {
    const searchText = event.term;
    if (!searchText || searchText.length < 3) {
      this.unloaderUsers = [];
      this.notUnloaderName = 'Enter at least 3 characters';
      return;
    }
    const payload = {
      searchTerm:searchText,
      baseLocationCode: this.docketService.loginUserList.LocationCode,
    };
    this.notUnloaderName = 'Searching...';
    this.stockUpdateService.stockUpdateUsers(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.unloaderUsers = response.data;
          this.notUnloaderName = 'No matches found';
        }
      }
    });
  }

onChangeDamage(event: any, index: number) {
  if (!event) {
    return;
  }
  const severityValue = event.codeFor;

  const rowGroup = this.stockUpdateArray.at(index) as FormGroup;

  rowGroup.patchValue({
    severity: severityValue
  });
}


  resetUnloaderDropdown(){
    this.unloaderUsers = [];
    this.notUnloaderName = 'Enter at least 3 characters';
  }

 onWarehouse(value: any) {
    this.stockUpdateArray.controls.forEach((row: any) => {
      row.get('warehouse')?.setValue(value.godown_srno);
    });
  }

   onArrivalCondition(value: any) {
    this.stockUpdateArray.controls.forEach((row: any) => {
      row.get('condition')?.setValue(value.value);
    });
  }

  onDeliveryProcessChange(value: any) {
    this.stockUpdateArray.controls.forEach((row: any) => {
      row.get('deliveryProcess')?.setValue(value.codeId);
    });
  }

  onHeaderDamageChange() {
    const checked = this.stockUpdateForm.get('hDamage')?.value;

    this.stockUpdateArray.controls.forEach((row: any) => {
      row.get('damage')?.setValue(checked);
    });
  }

  /* HEADER PILFERAGE */
  onHeaderPilferageChange() {
    const checked = this.stockUpdateForm.get('hPilferage')?.value;

    this.stockUpdateArray.controls.forEach((row: any) => {
      row.get('pilferage')?.setValue(checked);
    });
  }

  getStockUpdateDetails() {
    const payload = {
      id: this.docketService.loginUserList.id,
      baseLocationCode: this.docketService.loginUserList.LocationCode
    };
    this.stockUpdateService.getStockUpdateDetails(payload).subscribe({
      next: (response:any) => {
       if (response) {
          this.stockUpdateArray.clear();
          response.listVSFUM.forEach((item: any) => {
            this.stockUpdateArray.push(this.createForm(item));
          });;
          this.stockData=response.vsfum;
        }
      }
    });
  }

  getWarehouseData() {
    this.stockUpdateService.getWarehouseData(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response:any) => {
       if (response && response?.length) {
          this.warehouseList = response;
        }
      }
    });
  }

  createForm(item: any): FormGroup {
  return new FormGroup({
    selected: new FormControl(false), 

    damage: new FormControl(item.isDamage),
    pilferage: new FormControl(item.isPilferage),

    mfNo: new FormControl(item.tcno),
    docketNo: new FormControl(item.dockNo),
    route: new FormControl(`${item.orgncd} - ${item.desT_CD}`),

    bookingDate: new FormControl(item.dockdt),
    committedDate: new FormControl(item.cdelydt),

    pkgs: new FormControl(item.pkgsno),
    weight: new FormControl(item.actuwt),

    bizType: new FormControl(item.bizType),
    serviceType: new FormControl(item.service_Class),

    arrivedPkgs: new FormControl(item.pkgsno, [Validators.required,Validators.max(item.pkgsno)]),
    arrivedWt: new FormControl({ value: item.actuwt, disabled: true }),

    condition: new FormControl(null),
    warehouse: new FormControl(null),
    deliveryProcess: new FormControl(null),

    shortQty: new FormControl(item.shortageQty || 0),
    shortWt: new FormControl(item.shortageWeight || 0),
    shortReason: new FormControl(''),
    shortRemarks: new FormControl(''),

    pilferageQty: new FormControl(item.pilferageQty || 0),
    pilferageWt: new FormControl(item.pilferageWeight || 0),
    pilferageReason: new FormControl(''),
    pilferageRemarks: new FormControl(''),

    damageQty: new FormControl(item.damageQry || 0),
    damageWt: new FormControl(item.damageWeight || 0),
    damageReason: new FormControl(''),
    damageType: new FormControl(null),
    severity: new FormControl(null)
  });
}


}
