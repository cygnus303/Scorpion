import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocketService } from 'app/shared/services/docket.service';
import { PFMService } from 'app/shared/services/pfm.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { environment } from 'environments/environment';

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
  env = environment;
  constructor(private route: ActivatedRoute,private PFMService: PFMService,private router: Router,private docketService:DocketService,private sweetAlertService:SweetAlertService) {}

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

  CheckValidateDocket(event:any,index: number){
    const docketNo=event.target.value;
     if (!docketNo) return;
    this.PFMService.validateDocket(docketNo,this.docketService.loginUserList.LocationCode).subscribe({
      next:(response)=>{
      if(response.cnt===0){
         this.sweetAlertService.info(`Please enter Valid Docket No.!!!`, () => {
         this.dockets.at(index).get('docket')?.setValue(null);
        });
      }
      }
    })
  }

 onSubmit() {
  if (this.editMfform.invalid) {
    this.editMfform.markAllAsTouched();
    return;
  }
  const formData = this.editMfform.getRawValue();
  const payload = {
    fmNo: this.fmNo,
    entryBy:this.docketService.loginUserList.BaseUserName,
    dockList: formData.dockets.map((item: any, index: number) => ({
      srno: index + 1,
      dockno: item.docket
    }))
  };
  console.log('Submit Payload:', payload);

  this.PFMService.onSubmitAckEdit(payload).subscribe({
    next:(response)=>{
    if(response.tranXaction === 'Done'){
      window.parent.location.href = `${this.env.liveUrl}Document/FMEditDone?FMNO=${response.fM_No}&Status=1`;
    }
    }
  })
}

}
