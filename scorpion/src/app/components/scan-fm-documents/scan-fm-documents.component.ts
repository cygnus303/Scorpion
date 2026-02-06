import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from "@ng-select/ng-select";
import { DocketService } from 'app/shared/services/docket.service';
import { GeneralMasterService } from 'app/shared/services/general-master.service';
import { PFMService } from 'app/shared/services/pfm.service';
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
public scanFMList:any;
env = environment;

 constructor(
  public generalMasterService:GeneralMasterService,
  private pfmService:PFMService,
  private docketService:DocketService
){}

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


  onFileSelect(event: any, index: number, type: 'front' | 'back') {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (type === 'front') {
      this.documents.at(index).patchValue({
        DocumentName: file,
        frontPreview: reader.result
      });
    } else {
      this.documents.at(index).patchValue({
        BackDocumentName: file,
        backPreview: reader.result
      });
    }
  };
  reader.readAsDataURL(file);
}

removeFile(index: number, type: 'front' | 'back') {
  if (type === 'front') {
    this.documents.at(index).patchValue({
      DocumentName: null,
      frontPreview: null
    });
  } else {
    this.documents.at(index).patchValue({
      BackDocumentName: null,
      backPreview: null
    });
  }
}

  removeRow(index: number) {
    this.documents.removeAt(index);
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
      branch:new FormControl(''),
      ScanStatus:new FormControl(''),
      PartyName:new FormControl(''),
      DocumentName:new FormControl(''),
      ScanStatus1:new FormControl(''),
      BackDocumentName:new FormControl(''),
      frontPODView:new FormControl(''),
      backPODView:new FormControl('')
    });
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

  // DocType ન હોય તો API call નહીં
  if (!docType) {
    return;
  }

  const payload = {
    docNo: docNo,
    docType: docType,
    documentNo: rowGroup.get('DocumentNo')?.value || 'N/A',
    BaseLocationCode: this.docketService.loginUserList.LocationCode,
    HeadOfficeCode: this.docketService.loginUserList.LocationCode
  };

  if (docType !== '5') {
    this.pfmService.checkScanSFDocNo(payload).subscribe({
      next: (response) => {
        if (!response?.data) return;

        const scanFMList = response.data;
        rowGroup.patchValue({
          branch: scanFMList.currLoc,
          DocumentNo: scanFMList.dcoNo !== 'N/A' ? scanFMList.dcoNo : 'N/A',
          Status: scanFMList.status,
          ScanStatus: scanFMList.scanStatus,
          PartyName: scanFMList.partyName ?? '',
          DocumentName: scanFMList.documentName? scanFMList.documentName : '',
          Status1: scanFMList.status1,
          ScanStatus1: scanFMList.scanStatus1,
          BackDocumentName: scanFMList.backDocumentName ? scanFMList.backDocumentName: ''
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
      error: () => {
        rowGroup.patchValue({
          Status: 'Invalid POD'
        });
      }
    });
  }
}


showPOD(row: any, type: 'FRONT' | 'BACK' = 'BACK') {
  const url = type === 'BACK' ? row.get('backPreview')?.value : row.get('frontPreview')?.value;

  if (url) {
    window.open(url, '_blank');
  }
}
  OnSubmit() {
  const formData = new FormData();
  const documentsArray = this.documentForm.get('documents') as FormArray;
  const fmScanArray: any[] = [];
  documentsArray.controls.forEach((row: any, index: number) => {
    const v = row.value;
    const fmScanObj = {
      srno: index + 1,
      scanStatus1: '',
      docketNo: v.DocketNo,
      documentName: v.frontDoc.name,
      documentHref: '',
      baseUserName: '',
      toDate: '',
      documentDate: '',
      customerName: '',
      doc_Fwd: '',
      isPODChecked: v.IsPODChecked,
      backDocumentName: v.backDoc.name,
      scanStatus: '',
      documentHrefID1: '',
      thcNo: '',
      docType: v.DocType,
      status: v.Status,
      baseLocationCode: '',
      remarks: v.Remarks,
      fromDate: '',
      id: '',
      documentNo: v.DocumentNo,
      status1: v.Status1
    };
    fmScanArray.push(fmScanObj);

    if (row.value.frontDoc) {
      formData.append('Files', row.value.frontDoc);
    }

    if (row.value.backDoc) {
      formData.append('BackFiles', row.value.backDoc);
    }
  });
  formData.append('FMScan', JSON.stringify(fmScanArray));
   console.log(fmScanArray , 'dsfffffffff')
  // // API Call
  // this.http.post('YOUR_API_URL', formData).subscribe(res => {
  //   console.log('Upload Success', res);
  // });
}


}
