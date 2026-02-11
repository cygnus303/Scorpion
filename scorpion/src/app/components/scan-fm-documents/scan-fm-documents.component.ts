import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from "@ng-select/ng-select";
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { PFMService } from 'app/shared/services/pfm.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-scan-fm-documents',
  standalone: true,
  imports: [NgSelectModule, ReactiveFormsModule, CommonModule],
  templateUrl: './scan-fm-documents.component.html',
  styleUrl: './scan-fm-documents.component.scss'
})
export class ScanFMDocumentsComponent {
  public documentForm!: FormGroup;
  public scanFMList: any;
  env = environment;
  public isSubmitting:boolean=false;

  constructor(
    public generalMasterService: GeneralMasterService,
    private pfmService: PFMService,
    private docketService: DocketService,
    private sweetAlertService:SweetAlertService
  ) { }

  ngOnInit() {
    this.documentForm = new FormGroup({
      rowsCount: new FormControl(1),
      documents: new FormArray([])
    });

    this.addRow();
    this.generalMasterService.getDocumentType();
  }

  addRow() {
    this.documents.push(this.createRow());
  }

  get documents(): FormArray {
    return this.documentForm.get('documents') as FormArray;
  }

  createRow(): FormGroup {
    return new FormGroup({
      DocType: new FormControl(null, Validators.required),
      DocketNo: new FormControl('', Validators.required),
      DocumentNo: new FormControl('', Validators.required),
      Status: new FormControl('Not Scanned'),
      Status1: new FormControl('Not Scanned'),
      IsPODChecked: new FormControl(false),
      Remarks: new FormControl('', Validators.required),
      frontPreview: new FormControl(null),
      backPreview: new FormControl(null),
      branch: new FormControl(''),
      ScanStatus: new FormControl(''),
      PartyName: new FormControl(''),
      DocumentName: new FormControl('',Validators.required),
      ScanStatus1: new FormControl(''),
      BackDocumentName: new FormControl(''),
      frontPODView: new FormControl(''),
      backPODView: new FormControl(''),
      DocumentFile: new FormControl(null, Validators.required),
      BackDocumentFile: new FormControl(''),
    });
  }

  onFileSelect(event: any, index: number, type: 'front' | 'back') {
    const file = event.target.files[0];
    if (!file) return;

      const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
    const maxSize = 1 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
      this.sweetAlertService.error('Please select valid file type!!')
      event.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      this.sweetAlertService.error('Please select file size less than 1 MB!!')
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'front') {
        this.documents.at(index).patchValue({
          DocumentFile: file,
          frontPreview: reader.result
        });
      } else {
        this.documents.at(index).patchValue({
          BackDocumentFile: file,
          backPreview: reader.result
        });
      }
    };
    reader.readAsDataURL(file);
  }

  removeFile(index: number, type: 'front' | 'back') {
    if (type === 'front') {
      this.documents.at(index).patchValue({
        DocumentFile: null,
        frontPreview: null
      });
    } else {
      this.documents.at(index).patchValue({
        BackDocumentFile: null,
        backPreview: null
      });
    }
  }

  removeRow(index: number) {
      this.documents.removeAt(index);
  }

  addRowsFromInput() {
    const count = this.documentForm.value.rowsCount;
    if (!count || count <= 0) return;
    for (let i = 0; i < count; i++) {
      this.addRow();
    }
  }

  updateAllRows(data: any) {
    this.documents.controls.forEach((control, index) => {
      const formGroup = control as FormGroup;
      formGroup.patchValue({ DocType: data.codeId });
      if (data.codeId === '4') {
        formGroup.patchValue({ DocumentNo: '' });
      } else {
        formGroup.patchValue({ DocumentNo: 'N/A' });
      }
    });
  }

  changeDocumentType($event: any, index: number): void {
    const docType = $event.codeId;
    const documentGroup = this.documents.at(index);
    if (docType === '4') {
      documentGroup.get('DocumentNo')?.setValue('');
    } else {
      documentGroup.get('DocumentNo')?.setValue('N/A');
    }
  }

  scanFMDocNo(event: any, index: number) {
    const documentsArray = this.documentForm.get('documents') as FormArray;
    const rowGroup = documentsArray.at(index) as FormGroup;

    const docType = rowGroup.get('DocType')?.value;
    const docNo = event.target.value;
    const docketCtrl = rowGroup.get('DocketNo');
    const payload = {
      docNo: docNo,
      docType: docType,
      documentNo: rowGroup.get('DocumentNo')?.value || 'N/A',
      BaseLocationCode: this.docketService.loginUserList.LocationCode,
      HeadOfficeCode: this.docketService.loginUserList.LocationCode
    };

    // DocType ન હોય તો API call નહીં
    if (!payload.docType || !payload.docNo) {
      return;
    }

    if (docType !== '5') {
      this.pfmService.checkScanSFDocNo(payload).subscribe({
        next: (response) => {
          if (!response?.data) return;

          const scanFMList = response.data;
          if (scanFMList.cnt !== 1) {
          docketCtrl?.setErrors({ invalidPOD: true });
          return;
        }

        // ✅ VALID → clear error
        docketCtrl?.setErrors(null);

          rowGroup.patchValue({
            branch: scanFMList.currLoc,
            DocumentNo: scanFMList.dcoNo !== 'N/A' ? scanFMList.dcoNo : 'N/A',
            Status: scanFMList.status,
            ScanStatus: scanFMList.scanStatus,
            PartyName: scanFMList.partyName ?? '',
            DocumentName: scanFMList.documentName ? scanFMList.documentName : '',
            Status1: scanFMList.status1,
            ScanStatus1: scanFMList.scanStatus1,
            BackDocumentName: scanFMList.backDocumentName ? scanFMList.backDocumentName :''
          });

          // ✅ VIEW URL generate only when scanned
          if (scanFMList.scanStatus === 2 || scanFMList.scanStatus === 3) {
            const frontUrl =
              `${this.env.liveUrl}fmfiles/${rowGroup.get('DocumentName')?.value}`
                .replace('/Document', '');

            const backUrl = scanFMList.backDocumentName
              ? `${this.env.liveUrl}fmfiles/${rowGroup.get('BackDocumentName')?.value}`
                .replace('/Document', '')
              : '';

            rowGroup.patchValue({
              frontPODView: frontUrl,
              backPODView: backUrl
            });
          }
        },
        error: () => {}
      });
    }
  }

  showPOD(row: any, type: 'FRONT' | 'BACK' = 'BACK') {
    const url = type === 'FRONT' ? row.get('frontPODView')?.value : row.get('backPODView')?.value;

    if (url) {
      window.open(url, '_blank');
    }
  }

  getInvalidControlsByRow(): any[] {
    const result: any[] = [];

    const documentsArray = this.documentForm.get('documents') as FormArray;

    documentsArray.controls.forEach((row: any, index: number) => {
      const invalidFields: string[] = [];

      Object.keys(row.controls).forEach(controlName => {
        const control = row.get(controlName);
        if (control?.invalid) {
          invalidFields.push(controlName);
        }
      });

      if (invalidFields.length > 0) {
        result.push({
          rowIndex: index,
          invalidControls: invalidFields
        });
      }
    });

    return result;
  }

  onSubmit() {
  if (this.documentForm.invalid) {
    this.documentForm.markAllAsTouched();
    const invalidRows = this.getInvalidControlsByRow();
    console.log('Invalid Rows:', invalidRows);
    return;
  }

    const formData = new FormData();
    const documentsArray = this.documentForm.get('documents') as FormArray;
    const fmScanArray: any[] = [];
    documentsArray.controls.forEach((row: any, index: number) => {
      const v = row.value;
      const fmScanObj = {
        Srno: index + 1,
        ScanStatus1: v.ScanStatus1,
        DocketNo: v.DocketNo,
        DocumentName: v.DocumentName,
        DocumentHref: v.frontPODView,
        BaseUserName: this.docketService.loginUserList.BaseUserName,
        THCNo: '',
        ID: 0,
        ToDate: new Date().toISOString(),
        FromDate: new Date().toISOString(),
        DocumentDate: new Date().toISOString(),
        CustomerName: '',
        Doc_Fwd: false,
        IsPODChecked: v.IsPODChecked,
        BackDocumentName: v.BackDocumentName,
        ScanStatus: v.ScanStatus,
        DocumentHrefID1: v.backPODView,
        DocType: Number(v.DocType),
        Status: v.Status,
        BaseLocationCode: v.branch,
        Remarks: v.Remarks,
        DocumentNo: v.DocumentNo,
        Status1: v.Status1
      };
      fmScanArray.push(fmScanObj);

      if (row.value.DocumentFile) {
        formData.append('Files', row.value.DocumentFile);
      }

      if (row.value.BackDocumentFile) {
        formData.append('BackFiles', row.value.BackDocumentFile);
      }
    });
    formData.append('FMScan', JSON.stringify(fmScanArray));
    console.log(fmScanArray, 'Requestpayload');
    this.isSubmitting = true;
   this.pfmService.onSubmitScanFM(formData).subscribe({
  next: (response) => {
    debugger;
    if (response?.success) {
      this.sweetAlertService.success('Done!!!');

      window.parent.location.href =
        `${this.env.liveUrl}Document/ScanFMDocumentsDone` +
        `?DocketNo=${response.docketNo}&Tranxaction=${response.tranxaction}`;
    }

    this.isSubmitting = false; // ✅ loader stop on success
  },

  error: (error) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.docketService.submitErrorMsg = error?.error?.message || 'Something went wrong';
    this.isSubmitting = false; // ✅ loader stop on error
  }
});
  }


}
