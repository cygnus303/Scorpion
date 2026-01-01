import { CommonModule, formatCurrency } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UnloaderUsers, WarehouseList } from 'app/shared/models/stock-update.model';
import { CommonService } from 'app/shared/services/common.service';
import { DeliveryUpdateService } from 'app/shared/services/delivery-update.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
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
public maxDate = new Date();
conditionList = [
  { text: 'GOOD', value: 1 },
  { text: 'SHORT', value: 2 },
  { text: 'DAMAGE', value: 3 },
  { text: 'OPEN CONDITION', value: 4 },
  { text: 'PILFERAGE', value: 5 }
];

 constructor(public docketService: DocketService, public commonService: CommonService,private stockUpdateService:StockUpdateService,public generalMasterService:GeneralMasterService,public deliveryUpdateService:DeliveryUpdateService,public sweetAlertService:SweetAlertService) { }

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
      hCondition:new FormControl(1),
      hWarehouse:new FormControl(),
      hPilferage: new FormControl(false),
      IsAllgood: new FormControl(false),
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

  get isAllGoodChecked() {
    debugger
  return this.stockUpdateForm.get('IsAllgood')?.value;
}

  get isPilferageDamage() {
    const stockUpdateControls = this.stockUpdateArray.controls;
    return (
      this.stockUpdateForm.get('hDamage')?.value ||
      this.stockUpdateForm.get('hPilferage')?.value ||
      stockUpdateControls.some((row: any) => row.get('damage')?.value || row.get('pilferage')?.value)
    );
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
      this.toggleDamageValidators(row, checked);
    });
  }

  /* HEADER PILFERAGE */
  onHeaderPilferageChange() {
    const checked = this.stockUpdateForm.get('hPilferage')?.value;
    this.stockUpdateArray.controls.forEach((row: any) => {
      row.get('pilferage')?.setValue(checked);
      this.togglePilferageValidators(row, checked);
    });
  }
  


  private togglePilferageValidators(row: FormGroup, isChecked: boolean) {
    const qtyCtrl = row.get('pilferageQty');
    const pilferageWt = row.get('pilferageWt');
    const pilferageReason = row.get('pilferageReason');
    const pilferageFile = row.get('pilferageFile');
    if (isChecked) {
      qtyCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(row.get('arrivedPkgs')?.value)]);
      pilferageWt?.setValidators([Validators.required, Validators.min(1)]);
      pilferageReason?.setValidators([Validators.required]);
      pilferageFile?.setValidators([Validators.required]);
    } else {
      qtyCtrl?.clearValidators();
      qtyCtrl?.setValue(null);
      pilferageWt?.clearValidators();
      pilferageWt?.setValue(null);
      pilferageReason?.clearValidators();
      pilferageReason?.setValue(null);
     pilferageFile?.clearValidators();
     pilferageFile?.setValue(null);
    }
     qtyCtrl?.updateValueAndValidity();
     pilferageWt?.updateValueAndValidity();
     pilferageReason?.updateValueAndValidity();
     pilferageFile?.updateValueAndValidity();
  }

  private toggleDamageValidators(row: FormGroup, isChecked: boolean) {
    const damageQty = row.get('damageQty');
    const damageWt = row.get('damageWt');
    const damageReason = row.get('damageReason');
    const damageType = row.get('damageType');
    const severity = row.get('severity');
    const damageFile = row.get('damageFile');

    if (isChecked) {
      damageQty?.setValidators([Validators.required, Validators.min(1), Validators.max(row.get('arrivedPkgs')?.value)]);
      damageWt?.setValidators([Validators.required, Validators.min(1)]);
      damageReason?.setValidators([Validators.required]);
      damageType?.setValidators([Validators.required]);
      severity?.setValidators([Validators.required]);
      damageFile?.setValidators([Validators.required]);
    } else {
      damageQty?.clearValidators();
      damageQty?.setValue(null);
      damageWt?.clearValidators();
      damageWt?.setValue(null);
      damageReason?.clearValidators();
      damageReason?.setValue(null);
      damageType?.clearValidators();
      damageType?.setValue(null);
      severity?.clearValidators();
      severity?.setValue(null);
      damageFile?.clearValidators();
      damageFile?.setValue(null);
    }
    damageQty?.updateValueAndValidity();
    damageWt?.updateValueAndValidity();
    damageReason?.updateValueAndValidity();
    damageType?.updateValueAndValidity();
    severity?.updateValueAndValidity();
    damageFile?.updateValueAndValidity();
  }

onArrivedPkgsChange(index: number) {
  const row = this.stockUpdateArray.at(index) as FormGroup;
  const pkgs = +row.get('pkgs')?.value || 0;
  const arrived = +row.get('arrivedPkgs')?.value || 0;
  const shortQty = row.get('shortQty');
  const shortWt = row.get('shortWt');
  const shortReason = row.get('shortReason');
  const shortRemarks = row.get('shortRemarks');
  // jo file control hoy to
  const shortFile = row.get('shortFile');

  if (pkgs - arrived > 0) {
    // 🔴 ADD validators
    shortQty?.setValidators([Validators.required, Validators.min(1)]);
    shortWt?.setValidators([Validators.required, Validators.min(1)]);
    shortReason?.setValidators([Validators.required]);
    shortRemarks?.setValidators([Validators.required]);
    shortFile?.setValidators([Validators.required]);

  } else {
    // 🟢 REMOVE validators
    shortQty?.clearValidators();
    shortWt?.clearValidators();
    shortReason?.clearValidators();
    shortRemarks?.clearValidators();
    shortFile?.clearValidators();

    shortQty?.setValue(0);
    shortWt?.setValue(0);
    shortReason?.setValue('');
    shortRemarks?.setValue('');
    shortFile?.setValue(null);
  }

  shortQty?.updateValueAndValidity();
  shortWt?.updateValueAndValidity();
  shortReason?.updateValueAndValidity();
  shortRemarks?.updateValueAndValidity();
  shortFile?.updateValueAndValidity();
}


  onPilferageFileChange(event: any, row: any) {
  const file = event.target.files?.[0] || null;
  row.get('pilferageFile')?.setValue(file);
  row.get('pilferageFile')?.markAsTouched();
}

  onShortFileChange(event: any, row: any) {
  const file = event.target.files?.[0] || null;
  row.get('shortFile')?.setValue(file);
  row.get('shortFile')?.markAsTouched();
}

 onDamageFileChange(event: any, row: any) {
  const file = event.target.files?.[0] || null;
  row.get('damageFile')?.setValue(file);
  row.get('damageFile')?.markAsTouched();
}


onRowPilferageChange(index: number) {
  const row = this.stockUpdateArray.at(index) as FormGroup;
  const checked = row.get('pilferage')?.value;
  this.togglePilferageValidators(row, checked);
}

onRowDamageChange(index: number) {
  const row = this.stockUpdateArray.at(index) as FormGroup;
  const checked = row.get('damage')?.value;
  this.toggleDamageValidators(row, checked);
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
          this.stockUpdateForm.patchValue({
            hWarehouse: response[0].godown_srno
          });
          this.stockUpdateArray.controls.forEach((row: any) => {
            row.get('warehouse')?.setValue(response[0].godown_srno);
          });
        }
      }
    });
  }

  createForm(item: any): FormGroup {
     const [day, month, year] = item.dockdt.split('/');
     const formattedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  return new FormGroup({
    IsPartStockUpdate: new FormControl(false), 

    damage: new FormControl(false),
    pilferage: new FormControl(false),

    mfNo: new FormControl(item.tcno),
    docketNo: new FormControl(item.dockNo),
    route: new FormControl(`${item.orgncd} - ${item.desT_CD}`),

    bookingDate: new FormControl(formattedDate),
    committedDate: new FormControl(item.cdelydt),

    pkgs: new FormControl(item.pkgsno),
    weight: new FormControl(item.actuwt),

    bizType: new FormControl(item.bizType),
    serviceType: new FormControl(item.service_Class),

    arrivedPkgs: new FormControl(item.pkgsno, [Validators.required,Validators.max(item.pkgsno)]),
    arrivedWt: new FormControl({ value: item.actuwt, disabled: true }),

    condition: new FormControl(1),
    warehouse: new FormControl(null),
    deliveryProcess: new FormControl(null),

    shortQty: new FormControl(item.shortageQty || 0),
    shortWt: new FormControl(item.shortageWeight || 0),
    shortReason: new FormControl(''),
    shortRemarks: new FormControl(''),
    shortFile: new FormControl(null), 

    pilferageQty: new FormControl(item.pilferageQty || 0),
    pilferageWt: new FormControl(item.pilferageWeight || 0),
    pilferageReason: new FormControl(''),
    pilferageRemarks: new FormControl(''),

    damageQty: new FormControl(item.damageQry || 0),
    damageWt: new FormControl(item.damageWeight || 0),
    damageReason: new FormControl(''),
    damageType: new FormControl(null),
    severity: new FormControl(null),
    pilferageFile: new FormControl(null), 
    damageFile: new FormControl(null), 
    DELYDATE: new FormControl(this.getCurrentDateTime()),
    /* ================= POD CONTROLS ================= */
    frontFiles: new FormControl([]),
    backFiles: new FormControl([]),

    frontPreview: new FormControl(null),
    backPreview: new FormControl(null),

    podValidated: new FormControl(false)
  });
}

removeFile(index: number, type: 'FRONT' | 'BACK') {
  const row = this.stockUpdateArray.at(index) as FormGroup;

  if (type === 'FRONT') {
    const url = row.get('frontPreview')?.value;
    if (url) URL.revokeObjectURL(url);

    row.patchValue({
      frontFiles: [],
      frontPreview: null
    });

    row.get('frontFiles')?.markAsTouched();
  } else {
    const url = row.get('backPreview')?.value;
    if (url) URL.revokeObjectURL(url);

    row.patchValue({
      backFiles: [],
      backPreview: null
    });
  }
}

onFileSelected(event: any, index: number, type: 'FRONT' | 'BACK') {
  const file = event.target.files?.[0];
  if (!file) return;

  const row = this.stockUpdateArray.at(index) as FormGroup;
  const previewUrl = URL.createObjectURL(file);

  if (type === 'FRONT') {
    const oldUrl = row.get('frontPreview')?.value;
    if (oldUrl) URL.revokeObjectURL(oldUrl);

    row.patchValue({
      frontFiles: [file],
      frontPreview: previewUrl
    });

    row.get('frontFiles')?.markAsTouched();
  } else {
    const oldUrl = row.get('backPreview')?.value;
    if (oldUrl) URL.revokeObjectURL(oldUrl);

    row.patchValue({
      backFiles: [file],
      backPreview: previewUrl
    });
  }

  // reset input so same file can be selected again
  event.target.value = '';
  this.validatePOD(index);
}
validatePOD(index: number) {
  const row = this.stockUpdateArray.at(index) as FormGroup;
  const docketNo = row.get('docketNo')?.value;

  if (!docketNo) {
    console.error('Dock No not found for row', index);
    return;
  }

  const frontFiles: File[] = row.get('frontFiles')?.value || [];
  const backFiles: File[] = row.get('backFiles')?.value || [];

  // Only validate if front file exists
  if (!frontFiles.length) return;

  const formData = new FormData();
  formData.append('DocNo', docketNo);

  frontFiles.forEach((file: File) => {
    formData.append('PodFile', file);
  });

  // If backend needs back also
  backFiles.forEach((file: File) => {
    formData.append('PodBackFile', file);
  });

  this.deliveryUpdateService.checkPODValidation(formData).subscribe({
    next: (response: any) => {
      if (response?.success) {
        row.patchValue({ podValidated: true });
      } else {
        this.sweetAlertService.error(
          `POD validation failed for Dock No ${docketNo}`
        );
      }
    },
    error: (error) => {
      this.sweetAlertService.error(
        error?.error?.message || `Error validating POD for Dock No ${docketNo}`
      );
    }
  });
}

isPodFrontRequired(index: number): boolean {
  const row = this.stockUpdateArray.at(index);
  if (!row) return false;

  const deliveryProcess = row.get('deliveryProcess')?.value;
  const frontFiles = row.get('frontFiles')?.value;

  // Return true only if deliveryProcess is '2' and frontFiles is empty
  return deliveryProcess === '2' && (!frontFiles || frontFiles.length === 0);
}

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.stockUpdateArray.controls.forEach(row => row.get('IsPartStockUpdate')?.setValue(checked));
  }

  isAllSelected(): boolean {
    return this.stockUpdateArray.controls.every(row => row.get('IsPartStockUpdate')?.value);
  }

  stockUpdate() {
     const selectedRows = this.stockUpdateArray.controls
      .filter(row => row.get('IsPartStockUpdate')?.value)
      .map(row => row.value);

    console.log('Selected Rows:', selectedRows);
    if (this.stockUpdateForm.valid) {
    } else {
      this.stockUpdateForm.markAllAsTouched();
    }
  }
}
