import { Component, EventEmitter, Output, output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DocketService } from 'app/shared/services/docket.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeliveryAgentService } from 'app/shared/services/delivery-agent.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DeliveryAgentByCodeResponse, LocationListResponse, VendorsListResponse } from 'app/shared/models/delivery-agent.model';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { generalMasterResponse } from 'app/shared/models/general-master.model';

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
  public locationData:LocationListResponse[]=[];
  public  gpsdata:generalMasterResponse[]=[];
  public showInvokeButton:boolean=false;
  public showVehicleInvokeButton:boolean=false;
  public isLicenceLoading : boolean =  false; 
  public isvehicleLoading : boolean =false;
  public isSubmiiting : boolean = false;
  public isFitnessExpired : boolean = false;
  public isInsuranceExpired : boolean = false;
  public isPermitExpired : boolean = false;
  public isLicenseExpired : boolean = false;
  public today: Date = new Date();
  @ViewChild('templatePopup', { static: true }) templatePopup!: TemplateRef<any>;
  @Output() dataEvent = new EventEmitter<boolean>();

  constructor(
    private modalService: BsModalService,
    public docketService: DocketService,
    public deliveryAgentService: DeliveryAgentService,
    public sweetAlertService:SweetAlertService,
    public basicDetailService:BasicDetailService
  ) {}

getVehicleDetail(event?: any) {
  const vehicleNo = event ? event.target.value.trim() : this.dAForm.value.vehicleNo?.trim();
  const vehicleNoControl = this.dAForm.get('vehicleNo');
  if (!vehicleNoControl || vehicleNoControl.invalid) return;
  const payload = {
    vehicleNo: vehicleNo.toUpperCase(),
    licenseNo: '',
    dA_Code: this.dAForm.value.dA_Code
  };
  this.deliveryAgentService.validationData(payload).subscribe({
    next: (response: any) => {
      if (response?.message === 'No duplicate found. You can proceed to save data.') {
        const params = {
          vehNo: vehicleNo.toUpperCase(),
          baseUserName: this.docketService.loginUserList.BaseUserName
        };
        this.isvehicleLoading=true;
        this.deliveryAgentService.getVehicleDetail(params).subscribe({
          next: (response: any) => {
            if (response) {
              this.dAForm.patchValue({
                chassisNo: response.rc_chasi_no || '',
                rcBookNo: response.rc_regn_no || '',
                registrationDate: response.rc_regn_dt ? new Date(response.rc_regn_dt) : null,
                engineNo: response.rc_eng_no || '',
                permitValidityDate: response.rc_permit_valid_upto ? new Date(response.rc_permit_valid_upto) : null,
                insuranceValidityDate: response.rc_insurance_upto ? new Date(response.rc_insurance_upto) : null,
                fitnessValidityDate: response.rc_fit_upto ? new Date(response.rc_fit_upto) : null,
              });
                this.checkPermitExpiry();
                this.checkInsuranceExpiry();
                this.checkFitnessExpiry();
              
            }
            this.isvehicleLoading=false;
          },
          
          error: (err) => {
            console.error('Error fetching vehicle details:', err.error.message);
            this.sweetAlertService.error(err.error.message)
            this.isvehicleLoading=false;
          }
        });

      } 
      else {
        this.sweetAlertService.info(response.message);

        this.dAForm.patchValue({ vehicleNo: null });
      }
    },
  });
}

applyGPSProviderValidation(){
  const gpsProviderControl = this.dAForm.get('gpsProvider');
  const gpsEnabledValue = this.dAForm.get('gpsEnabled')?.value;

  if (gpsEnabledValue === true) {
    gpsProviderControl?.setValidators([Validators.required]);
  } else {
    gpsProviderControl?.clearValidators();
    gpsProviderControl?.setErrors(null); // Clear old errors
  }

  gpsProviderControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
}
  
  showPopup(data?:DeliveryAgentByCodeResponse){
   this.buildForm();
   this.getVendors();
   this.getLocationData();
   this.getGPSProviderData();
      this.dAForm?.get('gpsEnabled')?.valueChanges.subscribe(() => {
      this.applyGPSProviderValidation();
    });
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
        gpsProvider:data.gpsProvider?data.gpsProvider:null,
        location:data.location?.split(",").map((x: any) => x.trim())
      };
      this.dAForm.patchValue(patchData);
      // this.checkExpiryAndToggleButton()
      this.checkPermitExpiry();
      this.checkInsuranceExpiry();
      this.checkFitnessExpiry();
      this.checkLicenseExpiry()
    }else{
     this.deliveryAgentCode = '';
    }
    this.bsModalRef = this.modalService.show(this.templatePopup, {  backdrop: true, ignoreBackdropClick: false, class: 'modal-xl modal-dialog-centered' });
  }

  closePopup() {
    if (this.bsModalRef) {this.bsModalRef.hide();}
  }

checkDateExpiry(dateValue: any): boolean {
  if (!dateValue) return false; // no message if empty
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

checkPermitExpiry(event?:any) {
  const permit = event ? event: this.dAForm.value.permitValidityDate;
  this.isPermitExpired = this.checkDateExpiry(permit);
  this.showVehicleInvokeButton = this.isPermitExpired || this.isInsuranceExpired || this.isFitnessExpired;
}

checkInsuranceExpiry(event?:any) {
  const insurance =  event ? event: this.dAForm.value.insuranceValidityDate;
  this.isInsuranceExpired = this.checkDateExpiry(insurance);
  this.showVehicleInvokeButton = this.isPermitExpired || this.isInsuranceExpired || this.isFitnessExpired;
}

checkFitnessExpiry(event?:any) {
  const fitness =  event ? event: this.dAForm.value.fitnessValidityDate;
  this.isFitnessExpired = this.checkDateExpiry(fitness);
  this.showVehicleInvokeButton = this.isPermitExpired || this.isInsuranceExpired || this.isFitnessExpired;
}

checkLicenseExpiry(event?:any) {
  const license =  event ? event: this.dAForm.value.licenseValidityDate;
  this.isLicenseExpired = this.checkDateExpiry(license);
  this.showInvokeButton = this.isLicenseExpired;
}



  buildForm() {
    this.dAForm = new FormGroup({
      dA_Code: new FormControl(null),
      deliveryAgentName: new FormControl(''),
      deliveryAgentMobile: new FormControl(''),
      vehicleNo: new FormControl('', [ Validators.required,Validators.pattern(/^[A-Za-z]{2}\d{1,2}[A-Za-z]{1,2}\d{4}$/i)]),
      registrationDate: new FormControl(''),
      engineNo: new FormControl(''),
      chassisNo: new FormControl(''),
      rcBookNo: new FormControl(''),
      permitValidityDate: new FormControl(''),
      insuranceValidityDate: new FormControl(''),
      fitnessValidityDate: new FormControl(''),
      licenseNo: new FormControl('', [Validators.required,Validators.pattern(/^[A-Za-z]{2}\d{2}\s?\d{11}$/)]),
      dateOfBirth: new FormControl(''),
      issueByRTO: new FormControl(''),
      licenseValidityDate: new FormControl(''),
      businessAssociateVendor: new FormControl(null),
      fTlType: new FormControl(null),
      gpsEnabled: new FormControl(false),
      gpsProvider: new FormControl(null),
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
     const result = event.vendorbrcd?.split(",").map((x: any) => x.trim());
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

  getGPSProviderData() {
      this.basicDetailService.getGeneralMasterList('GPSP', '', '').subscribe({
        next: (response) => {
          if (response.success) {
            this.gpsdata = response.data;
          }
        },
      });
  }

isActiveChecked(event: any) {
  event.preventDefault();
  const isChecked = this.dAForm.get('isActive')?.value;

  if (!isChecked) {
    this.sweetAlertService.confirm('Do you want to deactivate this user?').then((result: any) => {
      if (result.isConfirmed) {
        this.dAForm.get('isActive')?.setValue(false, { emitEvent: false });
      }else{
        this.dAForm.get('isActive')?.setValue(true, { emitEvent: true });
      }
    });
  } 
}

onChangeLicenceNumber(event?: any) {
  const dob = this.dAForm.value.dateOfBirth;
  const licenseNo = event ? event.target.value?.trim() : this.dAForm.value.licenseNo?.trim();
  const licenseControl = this.dAForm.get('licenseNo');
    if (!licenseControl || licenseControl.invalid || !dob) {
      licenseControl?.markAsTouched();
      this.dAForm.get('dateOfBirth')?.markAsTouched();
      return;
    }
    const payload = {
      vehicleNo: '', // not needed here
      licenseNo: licenseNo.toUpperCase(),
      dA_Code: this.dAForm.value.dA_Code
    }
    
  this.isLicenceLoading = true;
  this.deliveryAgentService.validationData(payload).subscribe({next: (response: any) => {
      if (response?.message === 'No duplicate found. You can proceed to save data.') {
        const params = {
          dlnumber: licenseNo.toUpperCase(),
          dob: dob ? dob.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          baseUserName: this.docketService.loginUserList.BaseUserName
        };
        this.deliveryAgentService.getLicenceDetail(params).subscribe({next: (response: any) => {
            if (response && response.data) {
              this.dAForm.patchValue({
                issueByRTO: response.data.omRtoFullname || '',
                licenseValidityDate: response.data.validTillDate || ''
              });
                this.checkLicenseExpiry()
            }
               this.isLicenceLoading = false;
          },
          error: (err) => {
            console.error('Error fetching license detail:', err);
            this.sweetAlertService.error(err.error.message)
             this.isLicenceLoading = false;
          }
        });
      } else {
        this.sweetAlertService.info(response.message);
        this.dAForm.patchValue({ licenseNo: null });
      }
    },
  });
}

  onSubmit() {
    if(this.dAForm.valid && !this.isFitnessExpired && !this.isInsuranceExpired && !this.isPermitExpired && !this.isLicenseExpired){
      this.isSubmiiting=true;
      const formData = new FormData();
       Object.keys(this.dAForm.value).forEach((key) => {
      let value = this.dAForm.value[key];
      if ( ['registrationDate','permitValidityDate','insuranceValidityDate','fitnessValidityDate','dateOfBirth','licenseValidityDate'].includes(key) && value) {
       const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    value = `${year}-${month}-${day}T00:00:00.000Z`;
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
        this.isSubmiiting=false;
        },
      });
       this.isSubmiiting = false;
    }else{
      this.dAForm.markAllAsTouched();
        this.isSubmiiting=false;
    }
  }

}
