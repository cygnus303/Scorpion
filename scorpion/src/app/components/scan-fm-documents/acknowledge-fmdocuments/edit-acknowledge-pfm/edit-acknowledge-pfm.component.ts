import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PFMService } from 'app/shared/services/pfm.service';

@Component({
  selector: 'app-edit-acknowledge-pfm',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './edit-acknowledge-pfm.component.html',
  styleUrl: './edit-acknowledge-pfm.component.scss'
})
export class EditAcknowledgePFMComponent {
  public editMfform!: FormGroup;
  public fmNo: string = '';
  public type: string = '';
  constructor(private route: ActivatedRoute,private PFMService: PFMService,private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.fmNo = params['FMNO'];
      this.type = params['Type'];
      if (this.fmNo) {
        this.openDetails();  // 🔥 call here
      }
    });

    this.editMfform = new FormGroup({
      noOfRows: new FormControl(1),
      dockets: new FormArray([])
    });

    this.addRows(); // default 1 row
  }

openDetails() {
  this.PFMService.getFMDOCDetail(this.fmNo).subscribe({
    next: (res: any) => {
      if (res && res.length > 0) {
        this.dockets.clear();
        res.forEach((item: any) => {
          const group = this.createRow();
          group.patchValue({
            docket: item.dockNo
          });
          group.get('docket')?.disable();
          this.dockets.push(group);
        });
      }
    }
  });
}

  get dockets(): FormArray {
    return this.editMfform.get('dockets') as FormArray;
  }

  createRow(): FormGroup {
    return new FormGroup({
      docket: new FormControl('', Validators.required)
    });
  }

  addRows() {
    const count = this.editMfform.get('noOfRows')?.value || 0;
    for (let i = 0; i < count; i++) {
      this.dockets.push(this.createRow());
    }
  }

  removeRow(index: number) {
    this.dockets.removeAt(index);
  }

  goToBackList() {
    this.router.navigate(['/Document/AcknowledgeFMDocumentsQuery']);
  }

 onSubmit() {
  if (this.editMfform.invalid) {
    this.editMfform.markAllAsTouched();
    return;
  }
  const formData = this.editMfform.getRawValue();
  const payload = {
    fmNo: this.fmNo,
    type: this.type,
    dockets: formData.dockets.map((item: any) => item.docket)
  };
  console.log('Submit Payload:', payload);
}

}
