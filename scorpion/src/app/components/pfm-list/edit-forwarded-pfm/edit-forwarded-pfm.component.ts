import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PFMapiService } from 'app/shared/services/pfmapi.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-edit-forwarded-pfm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BsDatepickerModule],
  templateUrl: './edit-forwarded-pfm.component.html',
  styleUrl: './edit-forwarded-pfm.component.scss',
  providers: [BsModalService]
})
export class EditForwardedPFMComponent {
  public modalRef!: BsModalRef;
  public editForm!: FormGroup;
  public pfmData: any;

  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private modalService: BsModalService,
    private pfmApiService: PFMapiService,
    private sweetAlertService:SweetAlertService
  ) { }

  showPopup(data: any) {
    console.log(data);
    this.createForm(); // blank form first
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
    if (data?.fM_No) {
      this.pfmApiService.GetCourierDetails(data.fM_No).subscribe({
        next: (response: any) => {
          const courier = response?.header || response;
          this.editForm.patchValue({
            lR_Number: data?.dockNo || '',
            route: data?.from_To || '',
            fM_No: courier?.pfM_Number || '',
            courier_Code: courier?.courier_Company_Name || '',
            courier_Way_Bill_No: courier?.courier_Number || '',
            courier_Way_Bill_Date: courier?.courier_Way_Bill_Date ? new Date(courier.courier_Way_Bill_Date) : new Date()
          });
          this.pfmData = response.lrList;
        }
      });
    }
  }

  createForm() {
    this.editForm = new FormGroup({
      courier_Code: new FormControl('', Validators.required),
      courier_Way_Bill_No: new FormControl('', Validators.required),
      courier_Way_Bill_Date: new FormControl(),
      route: new FormControl(''),
      lR_Number: new FormControl(''),
      fM_No: new FormControl('')
    });
  }

  formatFromTo(val: string): string {
    if (!val) return '—';
    return val.replace(':', ' → ');
  }

  saveChanges() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const { lR_Number, route, ...formVal } = this.editForm.value;
    const payload = {
      ...formVal,
      courier_Way_Bill_Date: new Date(formVal.courier_Way_Bill_Date).toISOString()
    };

    this.pfmApiService.PFMCourierUpdate(payload).subscribe({
      next: (res: any) => {
        this.sweetAlertService.success('Courier updated Successfully!!')
        this.dataEmitter.emit('Courier updated successfully');
        this.modalRef.hide();
      },
      error: (err: any) => {
        this.sweetAlertService.error(err);
      }
    });
  }
}
