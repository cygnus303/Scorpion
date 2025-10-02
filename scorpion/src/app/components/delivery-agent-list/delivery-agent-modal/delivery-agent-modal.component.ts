import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DocketService } from 'app/shared/services/docket.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeliveryAgentService } from 'app/shared/services/delivery-agent.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';


@Component({
  selector: 'delivery-agent-modal',
  standalone: false,
  templateUrl: './delivery-agent-modal.component.html',
  styleUrl: './delivery-agent-modal.component.scss',
  providers:[BsModalService],
})
export class DeliveryAgentModalComponent {
  public bsModalRef!: BsModalRef;
  public dAForm!: FormGroup;
  public deliveryAgentList:any;
  constructor(private modalService: BsModalService,public docketService: DocketService,public deliveryAgentService: DeliveryAgentService,public sweetAlertService:SweetAlertService) { }
  @ViewChild('templatePopup', { static: true }) templatePopup!: TemplateRef<any>;
   ngOnInit(){
     this.buildForm()
   }
 showPopup(data:any){
    this.deliveryAgentList = data;
    this.bsModalRef = this.modalService.show(this.templatePopup, {  backdrop: true, ignoreBackdropClick: false, class: 'modal-xl modal-dialog-centered' });
  }

  closePopup() {
    if (this.bsModalRef) {
      this.bsModalRef.hide(); // modal close karva
    }
  }

  buildForm() {
    this.dAForm = new FormGroup({
      dA_Code: new FormControl(0),
      deliveryAgentName: new FormControl(''),
      deliveryAgentMobile: new FormControl(''),
      vehicleNo: new FormControl(''),
      registrationDate: new FormControl(''),
      engineNo: new FormControl(''),
      chassisNo: new FormControl(''),
      rcBookNo: new FormControl(''),
      permitValidityDate: new FormControl(''),
      insuranceValidityDate: new FormControl(''),
      fitnessValidityDate: new FormControl(''),
      licenseNo: new FormControl(''),
      dateOfBirth: new FormControl(''),
      issueByRTO: new FormControl(''),
      licenseValidityDate: new FormControl(''),
      businessAssociateVendor: new FormControl(''),
      fTlType: new FormControl(''),
      gpsEnabled: new FormControl(false),
      gpsProvider: new FormControl(''),
      location: new FormControl(''),
      LicenseAttachmentPath: new FormControl(''),
      LicenseAttachment: new FormControl(''),
      entryBy: new FormControl(''),
      updateBy: new FormControl(''),
    })

  }

onFileSelected(event: any) {
  debugger
  const file: File = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    // reader.onload = () => {
    //   // Convert to Base64 and set in reactive form
    //   const base64String = (reader.result as string).split(',')[1];
    //   this.dAForm.patchValue({
    //     licenseAttachment: base64String,
    //   });
    // };
     this.dAForm.patchValue({
        LicenseAttachmentPath: file
      });
    reader.readAsDataURL(file); 
  }
}

  onSubmit() {
    if(this.dAForm.valid){
      const formData = new FormData();
      Object.keys(this.dAForm.value).forEach((key) => {
        formData.append(key, this.dAForm.value[key]);
      });
      this.deliveryAgentService.addDeliveryAgent(formData).subscribe({
        next: (response) => {
          if (response) {
            this.sweetAlertService.success('Delivery Agent Submitted Successfully!!')
          }
        },
      })
    }else{
      this.dAForm.markAllAsTouched();
    }
  }

}
