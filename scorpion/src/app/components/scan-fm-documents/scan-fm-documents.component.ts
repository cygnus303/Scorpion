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
    this.generalMasterService.getDocumentType()
  }

  addRow() {
    this.documents.push(this.createRow());
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
      Remarks: new FormControl('', Validators.required)
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
