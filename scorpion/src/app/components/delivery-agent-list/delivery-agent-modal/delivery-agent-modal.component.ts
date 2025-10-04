import { Component, EventEmitter, Output, output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DocketService } from 'app/shared/services/docket.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeliveryAgentService } from 'app/shared/services/delivery-agent.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DeliveryAgentByCodeResponse, VendorsListResponse } from 'app/shared/models/delivery-agent.model';

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
  public deliveryAgentCode!:string;
  public vendorsList:VendorsListResponse[]=[];
  public locationData:any[]=[];
  @ViewChild('templatePopup', { static: true }) templatePopup!: TemplateRef<any>;
  @Output() dataEvent = new EventEmitter<boolean>();

  constructor(private modalService: BsModalService,public docketService: DocketService,public deliveryAgentService: DeliveryAgentService,public sweetAlertService:SweetAlertService) {}
  
  showPopup(data?:DeliveryAgentByCodeResponse){
   this.buildForm();
   this.getVendors();
   this.getLocationData();
   this.docketService.getTypeofMovementData('');
    if(data){
      this.deliveryAgentCode = data.dA_Code;
      const patchData = {
        ...data,
        registrationDate: data.registrationDate ? new Date(data.registrationDate) : null,
        insuranceValidityDate: data.insuranceValidityDate ? new Date(data.insuranceValidityDate) : null,
        permitValidityDate: data.permitValidityDate ? new Date(data.permitValidityDate) : null,
        fitnessValidityDate: data.fitnessValidityDate ? new Date(data.fitnessValidityDate) : null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        licenseValidityDate: data.licenseValidityDate ? new Date(data.licenseValidityDate) : null,
        location: data.location.split(",").map((x: any) => x.trim())
      };
      this.dAForm.patchValue(patchData);
    }else{
     this.deliveryAgentCode = '';
    }
    this.bsModalRef = this.modalService.show(this.templatePopup, {  backdrop: true, ignoreBackdropClick: false, class: 'modal-xl modal-dialog-centered' });
  }

  closePopup() {
    if (this.bsModalRef) {this.bsModalRef.hide();}
  }

  buildForm() {
    this.dAForm = new FormGroup({
      dA_Code: new FormControl(null),
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
      businessAssociateVendor: new FormControl(null),
      fTlType: new FormControl(null),
      gpsEnabled: new FormControl(false),
      gpsProvider: new FormControl(''),
      location: new FormControl(null),
      LicenseAttachmentPath: new FormControl(''),
      LicenseAttachment: new FormControl(''),
      entryBy: new FormControl(this.docketService.loginUserList?.UserId),
      updateBy: new FormControl(this.docketService.loginUserList.UserId),
      isActive:new FormControl(true)
    })

  }

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    const reader = new FileReader();
     this.dAForm?.patchValue({
        LicenseAttachmentPath: file
      });
    reader.readAsDataURL(file); 
  }
}

  getVendors() {
    this.deliveryAgentService.getVendors().subscribe({next: (response) => {
        if (response) {
          this.vendorsList = response;
        }
      }
    });
  }

  getLocation(event:any){
     const result = event.vendorbrcd.split(",").map((x: any) => x.trim());
    this.dAForm.patchValue({
      location:result
    });
  }

  getLocationData() {
    this.deliveryAgentService.getLocation().subscribe({next: (response) => {
        if (response) {
          this.locationData = response.map((location: any) => ({
            locCode: location.locCode,
            locName: `${location.locCode} ~ ${location.locName}`,
          }));
        }
      },
    })
  }

  onSubmit() {
    if(this.dAForm.valid){
      const formData = new FormData();
       Object.keys(this.dAForm.value).forEach((key) => {
      let value = this.dAForm.value[key];
      if ( ['registrationDate','permitValidityDate','insuranceValidityDate','fitnessValidityDate','dateOfBirth','licenseValidityDate'].includes(key) && value) {
        value = new Date(value).toISOString();
      }
      if (key === 'LicenseAttachment' && value instanceof File) {
        formData.append(key, value, value.name);
      } else {
        formData.append(key, value ?? '');
      }
    });
      this.deliveryAgentService.addDeliveryAgent(formData).subscribe({next: (response) => {
          if (response) {
            this.sweetAlertService.success(response.message).then(()=>{
              this.bsModalRef.hide();
              this.buildForm();
              this.dataEvent.emit(true);
            });
          }
        },
      })
    }else{
      this.dAForm.markAllAsTouched();
    }
  }

}
