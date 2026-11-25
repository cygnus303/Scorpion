import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicDetailService } from 'app/shared/services/basic-detail.service';
import { DefaultContractService } from 'app/shared/services/default-contract.service';
import { DocketService } from 'app/shared/services/docket.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'default-contract',
  standalone: false,
  templateUrl: './default-contract.component.html',
  styleUrl: './default-contract.component.scss'
})
export class DefaultContractComponent {
  public getPincodeMaster: any;
  public DefaultcontractForm!: FormGroup;
  public contractcharge:any;
  public defaultContractList: any;
  private lastRequestId = 0;
  public isSubmitting:boolean=false;
  public showDiscountFields: boolean = true;

  constructor(
    public docketService: DocketService,
    public basicDetailService: BasicDetailService,
    public defaultContractService: DefaultContractService,
    private sweetAlertService:SweetAlertService,
    public apiLoading: LoadingService,private cdr: ChangeDetectorRef,
    public dynamicDataService: DynamicDataService
  ) { }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  
    this.buildForm();
    this.docketService.getTransportModeData();
    this.getcontractservicecharge();
    this.GetCustomerDetail();
    this.DefaultcontractForm.get('AppointmentDeliver')?.valueChanges.subscribe(() => {this.setAppointmentCharge()});
    this.DefaultcontractForm.get('CSDDelivery')?.valueChanges.subscribe(() => {this.setCSDDeliveryCharge()});
    this.DefaultcontractForm.get('MallDelAppl')?.valueChanges.subscribe(() => {this.setMallDeliveryCharge()});

    this.DefaultcontractForm.get('VolumetricAppl')?.valueChanges.subscribe((isVolumetric: boolean) => {this.applyLBHLogic(isVolumetric)});

    const fields = ['Pkgs', 'weightKG', 'length', 'height', 'breadth'];
    fields.forEach(field => {this.DefaultcontractForm.get(field)?.valueChanges.pipe(debounceTime(700),distinctUntilChanged()).subscribe(() => {
        this.getCFTCalculation(); 
         this.cdr.detectChanges();
      });
    });
  }

  GetCustomerDetail() {
    const payload = {
      "FilterJson": {
        ReportId: '391',
        UserName: this.docketService?.loginUserList?.BaseUserName || '' // Using dynamic username if available, else fallback
      }
    };
    
    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        console.log('Dynamic API Response:', response);
        const data = response.Table1?.[0]; 
        
        // Hide if UserType is "C" and PayBas is "P02" or ""
        if (data?.UserType === 'C' && data?.PayBas === 'P02') {
          this.showDiscountFields = false;
        } else {
          this.showDiscountFields = true;
        }
      },
      error: (error: any) => {
        console.error('Error in Dynamic API:', error);
      }
    });
  }

  get volumetricRows(): FormArray {
    return this.DefaultcontractForm.get('volumetricRows') as FormArray;
  }

  get extraVolumetricRows(): FormArray {
    return this.volumetricRows;
  }

  createVolumetricRow(length: any = '', breadth: any = '', height: any = '', noOfPkgs: any = '', cubicweight: any = 0, actualWeight: any = ''): FormGroup {
    const isVolumetric = this.DefaultcontractForm ? this.DefaultcontractForm.get('VolumetricAppl')?.value : false;
    const measure = this.contractcharge?.cft_Measure;
    const maxValue = measure === 'INCHES' ? 99.99 : measure === 'CM' ? 999.99 : null;
    const validators: any[] = [];
    const reqValidators: any[] = [];
    if (isVolumetric) {
      validators.push(Validators.required);
      if (maxValue !== null) {
        validators.push(Validators.max(maxValue));
      }
      reqValidators.push(Validators.required, Validators.min(1));
    }

    const row = new FormGroup({
      length: new FormControl(length, validators),
      breadth: new FormControl(breadth, validators),
      height: new FormControl(height, validators),
      noOfPkgs: new FormControl(noOfPkgs, reqValidators),
      cubicweight: new FormControl(cubicweight),
      actualWeight: new FormControl(actualWeight, reqValidators)
    });
    row.valueChanges.subscribe(() => {
      this.getCFTCalculation();
    });
    return row;
  }

  addVolumetricRow() {
    this.volumetricRows.push(this.createVolumetricRow('', '', '', '', 0, ''));
    this.getCFTCalculation();
  }

  removeVolumetricRow(index: number) {
    if (this.volumetricRows.length > 1) {
      this.volumetricRows.removeAt(index);
    } else {
      this.volumetricRows.at(0).reset({ length: '', breadth: '', height: '', noOfPkgs: '', cubicweight: 0, actualWeight: '' });
    }
    this.getCFTCalculation();
  }

  applyLBHLogic(isVolumetric: boolean) {
    const measure = this.contractcharge?.cft_Measure; // INCHES | CM | FEET
    const maxValue = measure === 'INCHES' ? 99.99 : measure === 'CM' ? 999.99 : null;
    const validators = isVolumetric ? [Validators.required] : [];
    if (isVolumetric && maxValue !== null) {
      validators.push(Validators.max(maxValue));
    }
    const reqValidators = isVolumetric ? [Validators.required, Validators.min(1)] : [];

    ['length', 'breadth', 'height'].forEach(field => {
      const control = this.DefaultcontractForm.get(field);
      if (isVolumetric) {
        control?.setValidators(validators);
      } else {
        control?.clearValidators();
        control?.setValue(0);
      }
      control?.updateValueAndValidity();
    });

    if (this.volumetricRows) {
      this.volumetricRows.controls.forEach(row => {
        ['length', 'breadth', 'height'].forEach(field => {
          const ctrl = row.get(field);
          if (isVolumetric) {
            ctrl?.setValidators(validators);
          } else {
            ctrl?.clearValidators();
            ctrl?.setValue('');
          }
          ctrl?.updateValueAndValidity();
        });
        ['noOfPkgs', 'actualWeight'].forEach(field => {
          const ctrl = row.get(field);
          if (isVolumetric) {
            ctrl?.setValidators(reqValidators);
          } else {
            ctrl?.clearValidators();
            ctrl?.setValue('');
          }
          ctrl?.updateValueAndValidity();
        });
      });
      if (!isVolumetric) {
        this.volumetricRows.clear();
        this.volumetricRows.push(this.createVolumetricRow('', '', '', '', 0, ''));
      }
    }
    this.getCFTCalculation();
  }

  resetLBHValues() {
    if (this.volumetricRows) {
      this.volumetricRows.clear();
      this.volumetricRows.push(this.createVolumetricRow('', '', '', '', 0, ''));
    }
    this.getCFTCalculation();
  }

  buildForm(){
    this.DefaultcontractForm=new FormGroup({
      originPincode:new FormControl(null, Validators.required),
      PickupArea:new FormControl(''),
      PickupODA:new FormControl(''),
      originCity:new FormControl(''),
      fromState:new FormControl(''),
      originZone:new FormControl(''),
      email:new FormControl('',[Validators.required, Validators.email]),
      destination_pincode:new FormControl(null, Validators.required),
      destinationArea:new FormControl(''),
      ODA:new FormControl(''),
      destinationCity:new FormControl(''),
      toState:new FormControl(''),
      destinationZone:new FormControl(''),
      deliveryBranchCode:new FormControl(''),
      ODACategory:new FormControl(''),
      mode:new FormControl('6'),
      tatNormal:new FormControl(''),
      tatoda:new FormControl(''),
      trDays:new FormControl(''),
      weightKG:new FormControl(25, [Validators.required,Validators.min(1)]),
      Pkgs:new FormControl(0, [Validators.required, Validators.min(1)]),
      VolumetricAppl:new FormControl(false),
      AppointmentDeliver:new FormControl(false),
      CSDDelivery:new FormControl(false),
      MallDelAppl:new FormControl(false),
      invoiceValue:new FormControl(0, [Validators.required, Validators.min(1)]),
      chrgwt:new FormControl(0),
      cftTotal:new FormControl(0),
      freightRate:new FormControl(0),
      length:new FormControl(''),
      breadth:new FormControl(''),
      height:new FormControl(''),
      CFTRatio:new FormControl(''),
      volumetricRows: new FormArray([this.createVolumetricRow('', '', '', '', 0, '')]),
      fuelSurchrg:new FormControl(0,Validators.required),
      orgncd:new FormControl(''),
      orgArea:new FormControl(''),
      destArea:new FormControl(''),

      freightCharge:new FormControl(0),
      schG07:new FormControl(0),
      schG20:new FormControl(0),
      ODARate:new FormControl(0),
      gstRate:new FormControl(0),
      statedetail:new FormControl(''),
      stateCharges:new FormControl(0),
      schG08:new FormControl(0),
      schG04:new FormControl(0),
      schG17:new FormControl(0),
      uchG08:new FormControl(0),
      schG10:new FormControl(0),
      ichG01:new FormControl(0),
      schG01:new FormControl(0),

      schG25:new FormControl(0),
      schG28:new FormControl(0),
      uchG06:new FormControl(0),

      schG23:new FormControl(0),
      schG26:new FormControl(0),
      schG29:new FormControl(0),
      schG30:new FormControl(0),
      uchG01:new FormControl(0),
      uchG03:new FormControl(0),
      uchG14:new FormControl(0),

      Disc_Rate:new FormControl(0,[Validators.max(20)]),
      Disc_amount:new FormControl(0),
      Disc_Sub_Total:new FormControl(0),
      subTotal:new FormControl(0),
      GrandTotal:new FormControl(0),
      fuelSurchrgBas:new FormControl()
    });
    this.listenDefaultContractChanges();
  }

  listenDefaultContractChanges() {
    this.DefaultcontractForm.valueChanges.pipe(debounceTime(500), map(form => ({
      mode: form.mode,
      invoiceValue: form.invoiceValue,
      Pkgs: form.Pkgs,
      originPincode: form.originPincode,
      destinationPincode: form.destination_pincode
    })),distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe(() => {
        this.calculateRate();
    });
  }


  clearOnFocus(controlOrName: any, field?: string) {
    const control = field && controlOrName?.get ? controlOrName.get(field) : (typeof controlOrName === 'string' ? this.DefaultcontractForm.get(controlOrName) : controlOrName);
    if (control && (control.value === 0 || control.value === '0')) {
      control.setValue('');
    }
  }

  resetOnBlur(controlOrName: any, field?: string) {
    const control = field && controlOrName?.get ? controlOrName.get(field) : (typeof controlOrName === 'string' ? this.DefaultcontractForm.get(controlOrName) : controlOrName);
    if (control && !control.value) {
      control.setValue(0);
    }
  }

  getPincodeMasterList(event: any, type: string) {
    this.basicDetailService.getPincodeMasterList(event.value).subscribe({
      next: (response: any) => {
        if (response) {
          this.getPincodeMaster = response;
          if (type === 'origin') {
            this.DefaultcontractForm.patchValue({
              PickupArea: this.getPincodeMaster.area,
              PickupODA: this.getPincodeMaster.is_ODA_Apply,
              originCity: this.getPincodeMaster.location,
              // originZone: this.getPincodeMaster.regionName,
              fromState: this.getPincodeMaster.stnm,
              orgncd: this.getPincodeMaster.handling_Location,
              orgArea: this.getPincodeMaster.area
            })
          }
          if (type === 'destination') {
            this.DefaultcontractForm.patchValue({
              destinationArea: this.getPincodeMaster.area,
              ODA: this.getPincodeMaster.is_ODA_Apply,
              destinationCity: this.getPincodeMaster.location,
              // destinationZone:this.getPincodeMaster.regionName,
              toState:  this.getPincodeMaster.stnm,
              deliveryBranchCode: this.getPincodeMaster.handling_Location,
              ODACategory: this.getPincodeMaster.category,
              destArea: this.getPincodeMaster.area
            })
          }
        }
      }
    });
  }

  calculateRate() {
    const payload = {
      trnMode: this.DefaultcontractForm.value.mode,
      contractID: "P018888",
      invoiceAmount: this.DefaultcontractForm.value.invoiceValue || 0,
      actualWeight: this.DefaultcontractForm.value.weightKG || 0,
      totalCFT: this.DefaultcontractForm.value.cftTotal || 0,
      packageCount: this.DefaultcontractForm.value.Pkgs || 0,
      originPincode: this.DefaultcontractForm.value.originPincode,
      destinationPincode: this.DefaultcontractForm.value.destination_pincode,
      UserName :this.docketService?.loginUserList?.BaseUserName || ''
    }
    if (!payload.trnMode || !payload.originPincode) {
      return;
    }
    const currentId = ++this.lastRequestId;
    this.defaultContractService.calculateRate(payload).subscribe({next: (response: any) => {
        if (response) {
          this.defaultContractList = response;
          if(currentId === this.lastRequestId){
          this.DefaultcontractForm.patchValue(response);
          this.DefaultcontractForm.patchValue({
            originZone: this.defaultContractList.orgZone,
            destinationZone: this.defaultContractList.destZone
          })
          this.setAppointmentCharge();
          this.setCSDDeliveryCharge();
          this.setMallDeliveryCharge();
          this.calculateSubTotal();
        }
       }
      }
    });
  }

setAppointmentCharge() {
  if (this.DefaultcontractForm.get('AppointmentDeliver')?.value) {
    this.DefaultcontractForm.get('uchG08')?.setValue(this.defaultContractList.uchG08);
  } else {
    this.DefaultcontractForm.get('uchG08')?.setValue(0);
  }
  this.calculateSubTotal()
}

setCSDDeliveryCharge() {
  if (this.DefaultcontractForm.get('CSDDelivery')?.value) {
    this.DefaultcontractForm.get('schG10')?.setValue(this.defaultContractList.schG10);
  } else {
    this.DefaultcontractForm.get('schG10')?.setValue(0);
  }
  this.calculateSubTotal()

}

setMallDeliveryCharge() {
  if (this.DefaultcontractForm.get('MallDelAppl')?.value) {
    this.DefaultcontractForm.get('schG17')?.setValue(this.defaultContractList.schG17);
  } else {
    this.DefaultcontractForm.get('schG17')?.setValue(0);
  }
  this.calculateSubTotal()

}

calculateSubTotal() {
  const chargeFields = [
    'freightCharge','schG20','ODARate',
    'stateCharges','schG08','schG04','schG17','uchG08',
    'schG10','ichG01','schG07','schG01'
  ];
  const subTotal = chargeFields.reduce((sum, field) => {
    const value = Number(this.DefaultcontractForm.get(field)?.value) || 0;
    return sum + value;
  }, 0);
  const fixedSubTotal = Number(subTotal.toFixed(2));
  let gstAmount = (fixedSubTotal * Number(this.defaultContractList.gstRate || 0)) / 100;
  const discAmount = Number(this.DefaultcontractForm.get('Disc_amount')?.value) || 0;
  this.DefaultcontractForm.patchValue({
     gstRate:gstAmount,
    subTotal: fixedSubTotal,
    GrandTotal: subTotal - discAmount
  }, { emitEvent: false });

  this.calculateDiscount()
}


  getcontractservicecharge() {
    if (this.DefaultcontractForm.value.mode) {
      this.basicDetailService
        .contractservicecharge('P018888', this.DefaultcontractForm.value.mode)
        .subscribe({
          next: (response: any) => {
            if (response) {
              this.contractcharge = response[0];
              this.DefaultcontractForm.patchValue({
                CFTRatio: response[0].cft_Ratio,
                fuelSurchrg: response[0].fuelSurchrg,
                fuelSurchrgBas: response[0].fuelSurchrgBas
              });
            }
            this.applyLBHLogic(
              this.DefaultcontractForm.get('VolumetricAppl')?.value
            );
          },
          error: (err) => {
            console.error("Error in contractservicecharge:", err);
          },
        });
    }
  }

  setLBHValidators() {
    const measure = this.contractcharge?.cft_Measure;
    let maxValue = null;
    if (measure === 'INCHES') {
      maxValue = 99.99;
    } else if (measure === 'CM') {
      maxValue = 999.99;
    }
    const controls = ['length', 'breadth', 'height'];
    controls.forEach(ctrl => {
      const control = this.DefaultcontractForm.get(ctrl);
      if (!control) return;
      const validators = [Validators.required, Validators.min(0)];
      if (maxValue !== null) {
        validators.push(Validators.max(maxValue));
      }
      control.setValidators(validators);
      control.updateValueAndValidity({ emitEvent: false });
    });

    if (this.volumetricRows) {
      const validators = [Validators.required, Validators.min(0)];
      if (maxValue !== null) {
        validators.push(Validators.max(maxValue));
      }
      this.volumetricRows.controls.forEach(row => {
        controls.forEach(ctrl => {
          const control = row.get(ctrl);
          control?.setValidators(validators);
          control?.updateValueAndValidity({ emitEvent: false });
        });
        ['noOfPkgs', 'actualWeight'].forEach(ctrl => {
          const control = row.get(ctrl);
          control?.setValidators([Validators.required, Validators.min(1)]);
          control?.updateValueAndValidity({ emitEvent: false });
        });
      });
    }
  }


  getCFTCalculation() {
    let volMeasureType = '';
    let cftWtRatio = 0;
    if (this.contractcharge) {
      volMeasureType = this.contractcharge?.cft_Measure; // 'INCHES' | 'CM' | 'FEET'
      cftWtRatio = this.contractcharge?.cft_Ratio || 0;
    }
    const defaultPkgs = Number(this.DefaultcontractForm?.value?.Pkgs) || 0;
    let totalCubicWeight = 0;
    let totalNoOfPkgs = 0;
    let totalActualWeight = 0;

    if (this.volumetricRows && this.volumetricRows.length > 0) {
      this.volumetricRows.controls.forEach(control => {
        const row = control.value;
        const l = Number(row.length) || 0;
        const b = Number(row.breadth) || 0;
        const h = Number(row.height) || 0;
        const rowPkgs = Number(row.noOfPkgs) || 0;
        const rowActualWt = Number(row.actualWeight) || 0;

        let volume = 0;
        if (volMeasureType === 'INCHES') {
          volume = (l * b * h * cftWtRatio) / 1728;
        } else if (volMeasureType === 'CM') {
          volume = (l * b * h * cftWtRatio) / 27000;
        } else if (volMeasureType === 'FEET') {
          volume = l * b * h * cftWtRatio;
        }

        const effectivePkgs = rowPkgs > 0 ? rowPkgs : (this.volumetricRows.length <= 1 && defaultPkgs > 0 ? defaultPkgs : 1);
        const rowCwt = +(volume * effectivePkgs).toFixed(2);

        if (control.get('cubicweight')?.value !== rowCwt) {
          control.get('cubicweight')?.setValue(rowCwt, { emitEvent: false });
        }

        totalCubicWeight += rowCwt;
        if (rowPkgs > 0) totalNoOfPkgs += rowPkgs;
        if (rowActualWt > 0) totalActualWeight += rowActualWt;
      });
    }

    const cubicweight = +totalCubicWeight.toFixed(2);

    const patchObj: any = {
      cftTotal: cubicweight
    };

    if (totalNoOfPkgs > 0) {
      patchObj.Pkgs = totalNoOfPkgs;
    }
    if (totalActualWeight > 0) {
      patchObj.weightKG = totalActualWeight;
    }

    this.DefaultcontractForm.patchValue(patchObj, { emitEvent: false }); 
    this.calculateRate();
  }

calculateDiscount() {
  const discControl = this.DefaultcontractForm.get('Disc_Rate');
  if (discControl?.invalid) {
    this.DefaultcontractForm.patchValue({
      Disc_amount: '0',
      Disc_Sub_Total: this.DefaultcontractForm.value.subTotal?.toFixed(2),
      GrandTotal: this.DefaultcontractForm.value.subTotal?.toFixed(2)
    });
    return;
  }
  let Subtotal = this.DefaultcontractForm.value.subTotal || 0;
  let discounts = Number(discControl?.value || 0);
  let gstRate = Number(this.DefaultcontractForm.value.gstRate || 0);
  let discountAmount = (Subtotal * discounts) / 100;
  const discountSubTotal = Subtotal - discountAmount;
  const grandTotal = discountSubTotal + gstRate

  this.DefaultcontractForm.patchValue({
    Disc_amount: discountAmount.toFixed(2),
    Disc_Sub_Total: discountSubTotal.toFixed(2),
    GrandTotal: grandTotal.toFixed(2)
  });
}

logInvalidControls() {
  Object.keys(this.DefaultcontractForm.controls).forEach(controlName => {
    const control = this.DefaultcontractForm.get(controlName);
    if (control && control.invalid) {
      console.log(`❌ ${controlName} is invalid`, control.errors);
    }
  });
}

  OnSubmit() {
    const data = this.DefaultcontractForm.value;

    const volumetricList: any[] = [];
    if (data.VolumetricAppl && this.volumetricRows) {
      this.volumetricRows.controls.forEach((control, index) => {
        const row = control.value;
        volumetricList.push({
          srNo: index + 1,
          voL_L: Number(row.length) || 0,
          voL_B: Number(row.breadth) || 0,
          voL_H: Number(row.height) || 0,
          pkgsno: Number(row.noOfPkgs) || 0,
          actuwt: Number(row.actualWeight) || 0,
          vol_cft: Number(row.cubicweight) || 0,
          toT_CFT: Number(row.cubicweight) || 0,
          cftRatio: Number(data.CFTRatio) || 0,
          DOCKNO:'',
          VolumetricBox:''
        });
      });
    }
    const firstRow = volumetricList[0] || { VOL_L: 0, VOL_B: 0, VOL_H: 0 };

    const payload = {
      enquiryID: 0,
      enquiryNo: "",
      enquiryDate: new Date().toISOString(),
      orgncd:data.orgncd,
      destcd: data.deliveryBranchCode,
      fromloc: data.originCity,
      toloc: data.destinationCity,
      fromState: data.fromState,
      toState: data.toState,
      orgPincode: data.originPincode,
      desTPincode: data.destination_pincode,
      orgArea: data.orgArea,
      destArea: data.destArea,
      orgZone: data.originZone,
      destZone: data.destinationZone,
      pickup_From_ODA: data.PickupODA,
      oda: data.ODA,
      odA_Category: data.ODACategory,
      taT_Normal:  Number(data.tatNormal),
      taT_ODA:  Number(data.tatoda),
      transDays:  Number(data.trDays),
      transMode:  data.mode,
      isVolumetric:  data.VolumetricAppl,
      declval:  data.invoiceValue || 0,
      pkgsno:  data.Pkgs || 0,
      actuwt:  data.weightKG || 0, 
      chrgwt:  data.chrgwt || 0,
      voL_L:  Number(firstRow.VOL_L) || 0,
      voL_B:  Number(firstRow.VOL_B) || 0,
      voL_H:  Number(firstRow.VOL_H) || 0,
      toT_CFT:  data.cftTotal || 0,
      vol_cft:  data.cftTotal || 0,
      docketBoxLBHEnquiryList: volumetricList,
      ratE_TYPE: this.defaultContractList?.rateType,
      frT_RATE: data.freightRate,
      freighT_CALC: data.freightRate,
      freight: data.freightCharge,
      subTotal: data.subTotal,
      isGSTApplied: true, //puchvanu
      gstType: "", //puchvanu
      igstRate: data.gstRate,
      igstAmount: 0, //puchvanu
      cgstRate: 0, //puchvanu
      cgstAmount: 0, //puchvanu
      sgstRate: 0, //puchvanu
      sgstAmount: 0, //puchvanu
      utgstRate: 0, //puchvanu
      utgstAmount: 0, //puchvanu
      discount: data.Disc_Rate || 0, //puchvanu
      discountValue: 0, //puchvanu
      discountAmt: data.Disc_amount, 
      discountType: "P",
      disSubTotal: data.Disc_Sub_Total || 0,
      quotTOT:data.GrandTotal || 0,
      isAppointmentDelivery:data.AppointmentDeliver,
      isCSDDelivery: data.CSDDelivery,
      isMAllDelivery: data.MallDelAppl,
      chargename:data.statedetail,

      schG01:data.schG01, 
      schG25:data.schG25,
      schG28:data.schG28,
      schG10:data.schG10,
      schG20:data.schG20,
      schG07:data.schG07,
      schG08:data.schG08,
      schG04:data.schG04,
      schG17:data.schG17,
      uchG08:data.uchG08,
      uchG06:data.uchG06, 
      ichG01:data.ichG01,

      schG23:data.schG23,
      schG26:data.schG26,
      schG29:data.schG29,
      schG30:data.schG30,
      uchG01:data.uchG01,
      uchG03:data.uchG03,
      uchG14:data.uchG14,
      
      customerEmail: data.email,
      quotationStatus: "",
      entryBy:this.docketService?.loginUserList?.BaseUserName || ''
    }
    console.log(payload)
    if (this.DefaultcontractForm.valid) {
      console.log(this.DefaultcontractForm.value);
      this.isSubmitting=true;
      this.defaultContractService.DocketEnquirySubmit(payload).subscribe({next: (response: any) => {
          if (response.status === 'True') {
            this.buildForm();
            this.sweetAlertService.success(`Successfully Submitted!! Enquiry No: <b>${response.enquiryNo}</b>`);
            this.isSubmitting = false;
          }else{
            this.sweetAlertService.error('Error');
            this.isSubmitting = false;
          }
        }
      })
    } else {
      this.DefaultcontractForm.markAllAsTouched();
       this.logInvalidControls();
    }
  }

}
