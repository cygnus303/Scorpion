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
  if (!vehicleNo) return;
  const payload = {
    vehicleNo: vehicleNo,
    licenseNo: '',
    dA_Code: this.dAForm.value.dA_Code
  };
  this.deliveryAgentService.validationData(payload).subscribe({
    next: (response: any) => {
      if (response?.message === 'No duplicate found. You can proceed to save data.') {
        const params = {
          vehNo: vehicleNo,
          baseUserName: this.docketService.loginUserList.BaseUserName
        };
        this.isvehicleLoading=true;
        this.deliveryAgentService.getVehicleDetail(params).subscribe({
          next: (response: any) => {
            if (response) {
              this.dAForm.patchValue({
                chassisNo: response.rc_chasi_no || '',
                rcBookNo: response.rc_regn_no || '',
                registrationDate: response.rc_regn_upto ? new Date(response.rc_regn_upto) : null,
                engineNo: response.rc_eng_no || '',
                permitValidityDate: response.rc_permit_valid_upto ? new Date(response.rc_permit_valid_upto) : null,
                insuranceValidityDate: response.rc_insurance_upto ? new Date(response.rc_insurance_upto) : null,
                fitnessValidityDate: response.rc_fit_upto ? new Date(response.rc_fit_upto) : null,
              });
            }
            this.isvehicleLoading=false;
          },
          error: (err) => {
            console.error('Error fetching vehicle details:', err);
            this.isvehicleLoading=false;
          }
        });

      } 
      else {
        this.sweetAlertService.info(
          'Vehicle number or License Number is already used in another Delivery Agent. Please use a different vehicle or license number.'
        );

        this.dAForm.patchValue({ vehicleNo: null });
        setTimeout(() => {
          const vehicleInput = document.querySelector('input[formControlName="vehicleNo"]') as HTMLInputElement;
          vehicleInput?.focus();
        }, 200);
      }
    },
    error: (err) => console.error('Validation API failed:', err)
  });
}
  
  showPopup(data?:DeliveryAgentByCodeResponse){
   this.buildForm();
   this.getVendors();
   this.getLocationData();
   this.getGPSProviderData()
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
        location:data.location?data.location: data.location?.split(",").map((x: any) => x.trim())
      };
      this.dAForm.patchValue(patchData);

          const registrationDate = this.dAForm.value.registrationDate? new Date(this.dAForm.value.registrationDate): null;
          const permitValidityDate = this.dAForm.value.permitValidityDate? new Date(this.dAForm.value.permitValidityDate): null;
          const insuranceValidityDate = this.dAForm.value.insuranceValidityDate? new Date(this.dAForm.value.insuranceValidityDate): null;
          const fitnessValidityDate = this.dAForm.value.fitnessValidityDate? new Date(this.dAForm.value.fitnessValidityDate): null;
          const today = new Date();
         const isExpired = (registrationDate && registrationDate < today) || (permitValidityDate && permitValidityDate < today) || (insuranceValidityDate && insuranceValidityDate < today) ||
        (fitnessValidityDate && fitnessValidityDate < today);

      // ✅ If expired → show button and disable fields
      if (isExpired) {
        this.showVehicleInvokeButton = true;
         this.dAForm.patchValue({
            chassisNo:'',
            rcBookNo:'',
            registrationDate:'',
            engineNo:'',
            permitValidityDate:'',
            insuranceValidityDate:'',
            fitnessValidityDate:'',
          });
      }
    const licenseDate = this.dAForm.value.licenseValidityDate ? new Date(this.dAForm.value.licenseValidityDate): null;
      if (licenseDate && licenseDate < today) {
        this.showInvokeButton = true;
        this.dAForm.patchValue({
          issueByRTO: '',
          licenseValidityDate: ''
        });
      }
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
      licenseNo: new FormControl('', [Validators.required,Validators.pattern(/^[A-Z]{2}\d{2}\s?\d{11}$/)]),
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
  if (!licenseNo || licenseNo.length < 3 || !dob) return;

 this.isLicenceLoading = true;

  const payload = {
    vehicleNo: '', // not needed here
    licenseNo: licenseNo,
    dA_Code: this.dAForm.value.dA_Code
  };
  this.deliveryAgentService.validationData(payload).subscribe({
    next: (response: any) => {
      if (response?.message === 'No duplicate found. You can proceed to save data.') {
        const params = {
          dlnumber: licenseNo,
          dob: dob ? `${('0' + dob.getDate()).slice(-2)} ${[ 'Jan','Feb','Mar', 'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dob.getMonth()]} ${dob.getFullYear()}`: '',
          baseUserName: this.docketService.loginUserList.BaseUserName
        };

        this.deliveryAgentService.getLicenceDetail(params).subscribe({
          next: (response: any) => {
            if (response && response.data) {
              this.dAForm.patchValue({
                issueByRTO: response.data.omRtoFullname || '',
                licenseValidityDate: response.data.validTillDate || ''
              });
            }
               this.isLicenceLoading = false;
          },
          error: (err) => {console.error('Error fetching license detail:', err);
             this.isLicenceLoading = false;
          }
        });

      } else {
        this.sweetAlertService.info(
          'License Number or Vehicle Number is already used in another Delivery Agent. Please use a different license or vehicle number.'
        );

        this.dAForm.patchValue({ licenseNo: null });
        setTimeout(() => {
          const licenseInput = document.querySelector('input[formControlName="licenseNo"]') as HTMLInputElement;
          licenseInput?.focus();
        }, 200);
      }
    },
    error: (err) => console.error('Validation API failed:', err)
  });
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
    this.isSubmiiting=true;
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
      })
    }else{
      this.dAForm.markAllAsTouched();
        this.isSubmiiting=false;
    }
  }

}
