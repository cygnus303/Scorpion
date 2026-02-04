import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from "@ng-select/ng-select";
import { GeneralMasterService } from 'app/shared/services/general-master.service';

@Component({
  selector: 'app-scan-fm-documents',
  standalone: true,
  imports: [NgSelectModule, ReactiveFormsModule, CommonModule],
  templateUrl: './scan-fm-documents.component.html',
  styleUrl: './scan-fm-documents.component.scss'
})
export class ScanFMDocumentsComponent {
public documentForm!: FormGroup;
 constructor(public generalMasterService:GeneralMasterService){}
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
        frontDoc: file,
        frontPreview: reader.result
      });
    } else {
      this.documents.at(index).patchValue({
        backDoc: file,
        backPreview: reader.result
      });
    }
  };
  reader.readAsDataURL(file);
}

removeFile(index: number, type: 'front' | 'back') {
  if (type === 'front') {
    this.documents.at(index).patchValue({
      frontDoc: null,
      frontPreview: null
    });
  } else {
    this.documents.at(index).patchValue({
      backDoc: null,
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
      frontDoc: new FormControl(''),
      Status1: new FormControl('Not Scanned'),
      backDoc: new FormControl(''),
      IsPODChecked: new FormControl(false),
      Remarks: new FormControl('', Validators.required),
      frontPreview: new FormControl(null),
      backPreview: new FormControl(null),
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

}
