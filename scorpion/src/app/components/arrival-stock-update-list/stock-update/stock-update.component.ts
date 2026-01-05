import { CommonModule, formatCurrency } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UnloaderUsers, WarehouseList } from 'app/shared/models/stock-update.model';
import { CommonDateService } from 'app/shared/services/common-date.service';
import { CommonService } from 'app/shared/services/common.service';
import { DeliveryUpdateService } from 'app/shared/services/delivery-update.service';
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { StockUpdateService } from 'app/shared/services/stock-update.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { environment } from 'environments/environment';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-stock-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, BsDatepickerModule,SharedModule],
  templateUrl: './stock-update.component.html',
  styleUrl: './stock-update.component.scss'
})
export class StockUpdateComponent {
env = environment;
public unloaderUsers:UnloaderUsers[]=[];
public notUnloaderName:string='Enter at least 3 characters';
public stockUpdateForm!:FormGroup;
public warehouseList:WarehouseList[]=[];
public showShortageSection: boolean[] = [];
public selectedImage: string | ArrayBuffer | null = null;
public selectedPilferageImage: string | ArrayBuffer | null = null;
public selectedDamageImage: string | ArrayBuffer | null = null;
public stockData:any;
public isSubmitting: boolean = false;
public isRedirect: boolean = false; 
minDate: Date | undefined;
maxDate: Date | undefined;
public status: 'loading' | 'nodata' | 'data' = 'loading';
conditionList = [
  { text: 'GOOD', value: 1 },
  { text: 'SHORT', value: 2 },
  { text: 'DAMAGE', value: 3 },
  { text: 'OPEN CONDITION', value: 4 },
  { text: 'PILFERAGE', value: 5 }
];

 constructor(public docketService: DocketService, 
  public commonService: CommonService,
  private stockUpdateService:StockUpdateService,
  public generalMasterService:GeneralMasterService,
  public deliveryUpdateService:DeliveryUpdateService,
  public sweetAlertService:SweetAlertService,
  public commonDateService:CommonDateService) { }

  ngOnInit(){
    this.buildForm()
    this.generalMasterService.getDeliveryProcessData();
    this.getStockUpdateDetails();
    this.getWarehouseData(this.docketService.loginUserList.LocationCode);
    this.generalMasterService.getDamageData();
    this.dateAccess()
  }

  buildForm(){
   this.stockUpdateForm = new FormGroup({
      hDamage:  new FormControl(false),
      hCondition:new FormControl(1),
      hWarehouse:new FormControl(),
      hPilferage: new FormControl(false),
      IsAllgood: new FormControl(false),
      hDeliveryProcess : new FormControl(null),
      ISCheckRemarks : new FormControl(null),
      UnLoaderName: new FormControl(null,Validators.required),
      UnLoadingSupervisor: new FormControl(null,Validators.required),
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

    dateAccess() {
  const payload = {
    moduleCode: '47',
    baseUserName: this.docketService.baseUsername
  };

  this.commonDateService.userDateSelection(payload).subscribe({
    next: (res: any) => {
      if (res && res.length > 0) {
        const rule = res[0];

        // API min_Date
        this.minDate = new Date(rule.min_Date);

        // BackDate days logic
        if (rule.backDate_Days && rule.backDate_Days > 0) {
          const today = new Date();
          this.minDate = new Date(today.setDate(today.getDate() - rule.backDate_Days));
        }

        // Max date = today
        this.maxDate = new Date();
      }
    }
  });
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

onDamageQtyChange(index: number): void {
  const row = this.stockUpdateArray.at(index) as FormGroup;

  const damageQty = Number(row.get('damageQty')?.value || 0);
  const totalPkgs = Number(row.get('bkG_PKGSNO')?.value || 0);
  const totalWt = Number(row.get('bkG_ACTUWT')?.value || 0);

  if (damageQty < totalPkgs && totalPkgs > 0 && totalWt > 0) {
    const avgWt = Math.floor(totalWt / totalPkgs);
    const damageWeight = Math.floor(avgWt * damageQty);

    row.patchValue({
      damageWt: damageWeight
    });
  } else {
    row.patchValue({
      damageWt: 0,
      damageReason: ''
    });
  }
}

hasAnyPartStockUpdate(): boolean {
  return this.stockUpdateArray.controls.some(
    row => row.get('IsPartStockUpdate')?.value === true
  );
}


onPilferageQtyChange(index: number): void {
  const row = this.stockUpdateArray.at(index) as FormGroup;

  const pilferageQty = Number(row.get('pilferageQty')?.value || 0);
  const pkgsNo = Number(row.get('pkgs')?.value || 0);        // PKGSNO
  const totalPkgs = Number(row.get('bkG_PKGSNO')?.value || 0);
  const totalWt = Number(row.get('bkG_ACTUWT')?.value || 0);

  if (pilferageQty <= pkgsNo && totalPkgs > 0 && totalWt > 0) {
    const avgWt = Math.floor(totalWt / totalPkgs);
    const pilferageWeight = Math.floor(avgWt * pilferageQty);

    row.patchValue({
      pilferageWt: pilferageWeight
    });
  } else {
    row.patchValue({
      pilferageWt: 0,
      pilferageReason: ''
    });
  }
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


  onPilferageFileChange(event: Event, row: any): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      // Set the file to the form control
      row.get('pilferageFile')?.setValue(file);
      // Create a FileReader to load and preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPilferageImage = reader.result;  // Store the image preview data URL
      };
      reader.readAsDataURL(file);  // Read the file as a data URL for the image preview
    }
  }

  onShortFileChange(event: Event, row: any): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      // Update the form control with the file
      row.get('shortFile')?.setValue(file);
      // Show the selected image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onDamageFileChange(event: Event, row: any): void {
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];
  if (file) {
      // Set the file to the form control
    row.get('damageFile')?.setValue(file);
      // Create a FileReader to load and preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedDamageImage = reader.result;  // Store the image preview data URL
      };
      reader.readAsDataURL(file);  // Read the file as a data URL for the image preview
  }
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
    this.status = 'loading';
    this.stockUpdateArray.clear();
    this.stockUpdateService.getStockUpdateDetails(payload).subscribe({
      next: (response: any) => {
        if (response) {
          this.stockData = response.vsfum;
          if (response.listVSFUM && response.listVSFUM.length > 0) {
            response.listVSFUM.forEach((item: any) => {
              this.stockUpdateArray.push(this.createForm(item));
            });
            this.status = 'data';
          } else {
            this.status = 'nodata';
          }
        }
      },
      error: () => {
        this.status = 'nodata';
      }
    });
  }

  getWarehouseData(data:any) {
    this.stockUpdateService.getWarehouseData(data).subscribe({
      next: (response:any) => {
       if (response && response?.length) {
          this.warehouseList = response;
          this.stockUpdateForm.patchValue({
            hWarehouse: response[0].godown_srno
          });
      
          setTimeout(() => {
            this.stockUpdateArray.controls.forEach((row: any) => {
              row.get('warehouse')?.setValue(response[0].godown_srno);
            });
          }, 300);
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
    desT_CD:new FormControl(item.desT_CD),
    bookingDate: new FormControl(formattedDate),
    committedDate: new FormControl(item.cdelydt),
    isFTLDelivery:new FormControl(item.isFTLDelivery),
    pkgs: new FormControl(item.pkgsno),
    weight: new FormControl(item.actuwt),
    thcbr:new FormControl(item.thcbr),
    bizType: new FormControl(item.bizType),
    serviceType: new FormControl(item.service_Class),
    arrivedPkgs: new FormControl(item.pkgsno, [Validators.required,Validators.max(item.pkgsno)]),
    arrivedWt: new FormControl({ value: item.actuwt, disabled: true }),
    condition: new FormControl(1),
    warehouse: new FormControl(item.desT_CD),
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
    podValidated: new FormControl(false),
    bkG_PKGSNO:new FormControl(item.bkG_PKGSNO),
    bkG_ACTUWT:new FormControl(item.bkG_ACTUWT),
    invvalue:new FormControl(item.invvalue),
   arrPkgQty:new FormControl(item.arrPkgQty),
   actarrv_dt:new FormControl(item.actarrv_dt),
   isShort:new FormControl(item.isShort),
   delPkgQty:new FormControl(item.delPkgQty),
      isAllgood:new FormControl(item.isAllgood),
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

formatDate(date: Date): string {
  const d = new Date(date);
  return d.toISOString();
}

stockUpdate() {
  /* ================= SELECTED ROWS PAYLOAD ================= */
  const selectedControls = this.stockUpdateArray.controls.filter(row => row.get('IsPartStockUpdate')?.value === true);
  const payload = selectedControls.map(row => {
    const v = row.value;
    return {
      invvalue: v.invvalue,
      actuwt: v.weight,
      bkG_ACTUWT: v.bkG_ACTUWT,
      isPartStockUpdate: true,
      dockdt: this.formatDate(v.bookingDate),
      cdelydt: v.committedDate,
      tcno: v.mfNo,
      dockNo: v.docketNo,
      orgncd: v.route?.split(' - ')[0],
      desT_CD: v.desT_CD,
      bizType: v.bizType,
      service_Class: v.serviceType,
      pkgsno: v.pkgs,
      bkG_PKGSNO: v.bkG_PKGSNO,
      arrPkgQty: v.arrivedPkgs,
      actarrv_dt: v.actarrv_dt,
      isShort: v.shortQty > 0,
      shortageQty: v.shortQty,
      shortageWeight: v.shortWt,
      shortageReason: v.shortReason,
      shortageRemarks: v.shortRemarks,
      shortFileName: v.shortFile ? v.shortFile.name : null,
      isPilferage: v.pilferageQty > 0,
      pilferageQty: v.pilferageQty,
      pilferageWeight: v.pilferageWt,
      pilferageReason: v.pilferageReason,
      pilferageRemarks: v.pilferageRemarks,
      pilferageFileName: v.pilferageFile ? v.pilferageFile.name : null,
      isDamage: v.damageQty > 0,
      damageQry: v.damageQty,
      damageWeight: v.damageWt,
      damageReason: v.damageReason,
      damageType: v.damageType,
      severity: v.severity,
      damageFileName: v.damageFile ? v.damageFile.name : null,
      delPkgQty: v.delPkgQty,
      delydate: v.DELYDATE,
      delytime: v.DELYDATE,
      isFTLDelivery: v.isFTLDelivery,
      isAllgood: v.isAllgood,
      updateDate: new Date(),
      isMobileUser: 'N'
    };
  });
  /* ================= FORM DATA ================= */
  const formData = new FormData();
  formData.append("ViewModel.VSFUM.CDELYDT", this.stockData?.cdelydt);
  formData.append("ViewModel.VSFUM.PKGSNO", this.stockData?.pkgsno);
  formData.append("ViewModel.VSFUM.DockSF", this.stockData?.dockSF);
  formData.append("ViewModel.VSFUM.BKG_PKGSNO", this.stockData?.bkG_PKGSNO);
  formData.append("ViewModel.VSFUM.CODDOD", this.stockData?.coddod);
  formData.append("ViewModel.VSFUM.CODDODAmount", this.stockData?.coddodAmount);
  formData.append("ViewModel.VSFUM.ACTUWT", this.stockData?.actuwt);
  formData.append("ViewModel.VSFUM.BKG_ACTUWT", this.stockData?.bkG_ACTUWT);
  formData.append("ViewModel.VSFUM.TCNO", this.stockData?.tcno);
  formData.append("ViewModel.VSFUM.DockNo", this.stockData?.dockNo);
  formData.append("ViewModel.VSFUM.DOCKDT", this.stockData?.dockdt);
  formData.append("ViewModel.VSFUM.CODDODCOLLECTED", this.stockData?.coddodcollected);
  formData.append("ViewModel.VSFUM.ShortageQty", this.stockData?.shortageQty);
  formData.append("ViewModel.VSFUM.PilferageQty", this.stockData?.pilferageQty);
  formData.append("ViewModel.VSFUM.PilferageWeight", this.stockData?.pilferageWeight);
  formData.append("ViewModel.VSFUM.ShortageWeight", this.stockData?.shortageWeight);
  formData.append("ViewModel.VSFUM.IsCODDODChar", this.stockData?.isCODDODChar);

  formData.append("ViewModel.VSFUM.AC", '');
  formData.append("ViewModel.VSFUM.WI", '');
  formData.append("ViewModel.VSFUM.DP", '');
  formData.append("ViewModel.VSFUM.DELYREASON", '');
  formData.append("ViewModel.VSFUM.DELYPERSON", '');
  formData.append("ViewModel.VSFUM.ShortageReason", '');
  formData.append("ViewModel.VSFUM.ShortageRemarks", '');
  formData.append("ViewModel.VSFUM.PilferageReason", '');
  formData.append("ViewModel.VSFUM.PilferageRemarks", '');
  formData.append("ViewModel.VSFUM.DamageReason", '');
  formData.append("ViewModel.VSFUM.DamageRemarks", '');
  formData.append("ViewModel.VSFUM.DamageFileName", '');
  formData.append("ViewModel.VSFUM.PilferageFileName", '');
  formData.append("ViewModel.VSFUM.ShortFileName", '');
  formData.append("ViewModel.VSFUM.DamageType", '');
  formData.append("ViewModel.VSFUM.Severity", '');

  formData.append("ViewModel.VSFUM.DamageQry", this.stockData?.damageQry);
  formData.append("ViewModel.VSFUM.DamageWeight", this.stockData?.damageWeight);
  formData.append("ViewModel.VSFUM.ISCounterDelivery", this.stockData?.isCounterDelivery);
  formData.append("ViewModel.VSFUM.IsPartStockUpdate", this.stockData?.isPartStockUpdate);
  formData.append("ViewModel.VSFUM.AutoNo", this.stockData?.autoNo);
  formData.append("ViewModel.VSFUM.DELYDATE", this.stockUpdateForm.value.UpdateDate);
  formData.append("ViewModel.VSFUM.THCNO", this.stockData?.thcno);
  formData.append("ViewModel.VSFUM.THC_NextLoc", this.docketService.loginUserList.LocationCode);
  formData.append("ViewModel.VSFUM.UnLoadingSupervisor", this.stockUpdateForm.value.UnLoadingSupervisor);
  formData.append("ViewModel.VSFUM.UnLoaderName", this.stockUpdateForm.value.UnLoaderName);
  formData.append("ViewModel.VSFUM.UpdateDate", this.stockUpdateForm.value.UpdateDate);
  formData.append("ViewModel.VSFUM.IsAllgood", this.stockUpdateForm.value.IsAllgood);
  formData.append("ViewModel.VSFUM.ISCheckRemarks", this.stockUpdateForm.value.ISCheckRemarks);
  formData.append("BaseUserName", this.docketService.loginUserList.BaseUserName);
  formData.append("BaseFinYear", this.docketService.loginUserList.FinYear);

  /* ================= JSON ================= */
  formData.append("StockUpdateList", JSON.stringify(payload));

  /* ================= FILES ================= */
  selectedControls.forEach((row, index) => {
    const v = row.value;

    if (v.shortFile) {
      formData.append("ShortFiles", v.shortFile,
        `${v.docketNo}_SHORT_${index}_${v.shortFile.name}`);
    }

    if (v.pilferageFile) {
      formData.append("PilferageFiles", v.pilferageFile,
        `${v.docketNo}_PILFERAGE_${index}_${v.pilferageFile.name}`);
    }

    if (v.damageFile) {
      formData.append("DamageFiles", v.damageFile,
        `${v.docketNo}_DAMAGE_${index}_${v.damageFile.name}`);
    }

    if (v.frontFiles?.length) {
      v.frontFiles.forEach((file: File, i: number) => {
        formData.append("PodFrontFiles", file,
          `${v.docketNo}_POD_FRONT_${i}_${file.name}`);
      });
    }

    if (v.backFiles?.length) {
      v.backFiles.forEach((file: File, i: number) => {
        formData.append("PodBackFiles", file,
          `${v.docketNo}_POD_BACK_${i}_${file.name}`);
      });
    }
  });

  console.log('Final Payload:', payload);
  this.isSubmitting = false;
  /* ================= SUBMIT ================= */
  if (this.stockUpdateForm.valid) {
    this.stockUpdateService.onStockupdate(formData).subscribe({
      next: (response: any) => {
        if (response) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // this.successMsg = 'submitted successfully.'
            this.isRedirect = true;
          // https://sepluat.cygnux.in/Operation/ArrivalUpdateDone?ThcNo=VH%2FBLR%2F2526%2F000981&TranXaction=True&view=Stock%20Update&DepsId=DE%2FPIM%2F2526%2F0000018
          window.parent.location.href = `${this.env.liveUrl}Operation/ArrivalUpdateDone?ThcNo=${this.stockData?.thcno}&TranXaction=True&view=StockUpdate&DepsId=${response.depsId}&src=angular`;
          this.stockUpdateForm.reset();
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // this.submitErrorMsg = error?.error?.message;
        this.isSubmitting = false; // ✅ loader stop on error
         this.isRedirect = true;
      }
    });
  } else {
    this.stockUpdateForm.markAllAsTouched();
  }
}

  onArrPkgQtyBlur(index: number) {
  const row = this.stockUpdateArray.at(index) as FormGroup;

  const arrPkgQty = Number(row.get('arrivedPkgs')?.value || 0);
  const pkgsNo = Number(row.get('bkG_PKGSNO')?.value || 0);
  const actuWt = Number(row.get('bkG_ACTUWT')?.value || 0);

  const pilferageQty = Number(row.get('pilferageQty')?.value || 0);
  const damageQty = Number(row.get('damageQty')?.value || 0);

  const sumQty = pilferageQty + damageQty;

  if (sumQty > arrPkgQty) {
    alert('Please Check Shortage Qty ....');
    row.patchValue({
      PilferageQty: 0,
      DamageQry: 0
    });
    return;
  }
  if (arrPkgQty <= pkgsNo) {
    const shortageQty = pkgsNo - arrPkgQty;

    const arrivalWT = (arrPkgQty * actuWt) / pkgsNo;
    const roundedArrivalWT = this.roundNumber(arrivalWT, 0);
    const shortWT = actuWt - roundedArrivalWT;

    row.patchValue({
      shortQty: shortageQty,
      IsShort: true,
      arrivedWt: roundedArrivalWT.toFixed(1),
      shortWt: shortWT.toFixed(1)
    });

    row.get('shortWt')?.setValidators([
      Validators.required,
      Validators.max(actuWt - 1)
    ]);
    row.get('shortReason')?.setValidators(Validators.required);
    row.get('ShortageRemarks')?.setValidators(Validators.required);

    // this.stockUpdateForm.get('IsAllgood')?.disable();
    // this.stockUpdateForm.get('IsAllgood')?.reset();

    this.showShortageSection[index] = true;

  } else {
    /** ❎ No shortage */
    row.patchValue({
      IsShort: false,
      shortWt: '',
      shortReason: '',
      ShortageRemarks: ''
    });

    row.get('shortWt')?.clearValidators();
    row.get('shortReason')?.clearValidators();
    row.get('ShortageRemarks')?.clearValidators();

    row.get('shortWt')?.updateValueAndValidity();
    row.get('shortReason')?.updateValueAndValidity();
    row.get('ShortageRemarks')?.updateValueAndValidity();

    // this.stockUpdateForm.get('IsAllgood')?.enable();
    this.showShortageSection[index] = false;
  }
}

roundNumber(value: number, decimals: number): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}


}
