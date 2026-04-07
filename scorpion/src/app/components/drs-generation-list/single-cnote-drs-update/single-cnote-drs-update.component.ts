import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DeliveryUpdateService } from 'app/shared/services/delivery-update.service';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { SharedModule } from 'app/shared/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'single-cnote-drs-update',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule,ReactiveFormsModule,FormsModule,SharedModule],
  templateUrl: './single-cnote-drs-update.component.html',
  styleUrl: './single-cnote-drs-update.component.scss'
})
export class SingleCnoteDrsUpdateComponent {
  public modalRef!: BsModalRef;
  public DRSUpdateForm !:FormGroup;
  public selectedData: any;
  public docketData:any[]=[];
  public deliveryReason:any[]=[];
  public drsSummary:any;
  public isSubmit: boolean = false;
  today: Date = new Date();
  public isLoading = false;
  frontPreview: string | ArrayBuffer | null = null;
  backPreview: string | ArrayBuffer | null = null;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;


  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    private prsDrsApiService: PRSDRSApiService, 
    private deliveryUpdateService: DeliveryUpdateService,
    private sweetAlertService: SweetAlertService
  ) { }

  ngOnInit(){
    this.buildForm();
  }

 buildForm() {
   this.DRSUpdateForm = this.fb.group({
      cnoteList: this.fb.array([])
    });
 }

createCnoteForm(item: any): FormGroup {
  const [day, month, year] = item.booking_Date.split('/').map(Number);
  const formattedDate = new Date(year, month - 1, day);

  const form = this.fb.group({
    dockno: [item.dockno],
    booking_Date: [formattedDate],
    orgncd: [item.orgncd],
    destcd: [item.destcd],
    payBasis: [item.payBasis],
    csgncd: [item.csgncd],
    csgnnm: [item.csgnnm],
    csgecd: [item.csgecd],
    csgenm: [item.csgenm],
    pkgs_Pending: [item.pkgs_Pending],
    pkgs_Arrived: [item.pkgs_Arrived],
    pkgs_Booked: [item.pkgs_Booked],
    comm_Dely_Dt: [item.comm_Dely_Dt],
    IsEnabledBadPodoption: [item.isEnabledBadPodoption || false],
    IsChecked: [''],
    PKGSDELIVERED: ['', [Validators.required, this.maxPendingValidator('pkgs_Pending')]],
    DelyLocation: [null],
    DELYDATE: [this.getCurrentDateTime()],
    DELYPERSON: [''],
    cboReason: [''],
    podFront: [null],
    podBack: [null],
    frontFiles: [[]],
    backFiles: [[]],
    frontPreview: [null],
    backPreview: [null],
    });
  return form;
}

onDeliveredInput(event: any, row: AbstractControl) {
  let value = +event.target.value;
  const pending = +row.get('pkgs_Pending')?.value;

  if (value > pending) {
    row.get('PKGSDELIVERED')?.setErrors({ maxPending: true });
  } else {
    row.get('PKGSDELIVERED')?.setErrors(null);
  }
}

  maxPendingValidator(pendingKey: string) {
  return (control: AbstractControl) => {
    const parent = control.parent;
    if (!parent) return null;

    const pending = parent.get(pendingKey)?.value;
    const delivered = control.value;

    if (delivered && pending && delivered > pending) {
      return { maxPending: true };
    }
    return null;
  };
}

 get cnoteList(): FormArray {
  return this.DRSUpdateForm.get('cnoteList') as FormArray;
}

  showPopup(data: any) {
    console.log('Data received for Single C Note Update:', data);
    this.selectedData=data;
    this.drsSummary=null;
    this.DRSUpdateForm.reset();
    this.cnoteList.clear();
    this.frontPreview = null;
    this.backPreview = null;
    this.docketDetail(data.drsNo);
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  } 

  docketDetail(drsNo:string){
    this.prsDrsApiService.docketList(drsNo).subscribe({
      next: (response:any) => {
        this.docketData = response;
      }
    })
  }

   getDRSDetail(event:any){
    const params = {
      "dockNo": event.dockNo,
      "drsCode":this.selectedData.drsNo,
      "dockSf": "."
    }

      this.isLoading = true;
   this.prsDrsApiService.singleDRSUpdateDetail(params).subscribe({
      next: (response: any) => {
        const list = response?.data?.updateDRSLits || [];
        this.drsSummary=response?.data?.drsSummary;
      this.cnoteList.clear();

      // 🔹 Push new data
      list.forEach((item: any) => {
        this.cnoteList.push(this.createCnoteForm(item));
      });
      this.getDeliveryReason();
      this.isLoading = false;
      },
      error: (err:any) => {
        console.error(err);
      this.isLoading = false;
      }
    });
  }

  getDeliveryReason(){
    this.prsDrsApiService.getDeliveryDetail().subscribe({
      next: (response: any) => {
       this.deliveryReason=response.data;
      },
      error: (err:any) => {
        console.error(err);
      }
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

removeFile(index: number, type: 'FRONT' | 'BACK') {
  const row = this.cnoteList.at(index) as FormGroup;

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

  const row = this.cnoteList.at(index) as FormGroup;
  const previewUrl = URL.createObjectURL(file);

  if (type === 'FRONT') {
    const old = row.get('frontPreview')?.value;
    if (old) URL.revokeObjectURL(old);

    row.patchValue({
      frontFiles: [file],
      frontPreview: previewUrl
    });

    row.get('frontFiles')?.markAsTouched();
  } else {
    const old = row.get('backPreview')?.value;
    if (old) URL.revokeObjectURL(old);

    row.patchValue({
      backFiles: [file],
      backPreview: previewUrl
    });
  }

  event.target.value = '';

  this.validatePOD(index);
}

  validatePOD(index: number) {

    const row = this.cnoteList.at(index) as FormGroup;
    const docketNo = row.get('dockno')?.value;

    if (!docketNo) {
      console.error('Dock No not found for row', index);
      return;
    }

    const frontFiles = row.get('frontFiles')?.value || [];
    const backFiles = row.get('backFiles')?.value || [];

    // OPTIONAL: only front mandatory
    if (!frontFiles.length) {
      return;
    }

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
  const row = this.cnoteList.at(index) as FormGroup;

  const deliveredPkgs = Number(row.get('deliveredPkgs')?.value || 0);
  const frontPreview = row.get('frontPreview')?.value;

  return (
    deliveredPkgs > 0 &&
    !frontPreview &&
    (row.get('frontFiles')?.touched || this.isSubmit)
  );
}
}
