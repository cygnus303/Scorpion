import { Component, OnInit } from '@angular/core';
import { DocketService } from '../../shared/services/docket.service';
import { BasicDetailService } from '../../shared/services/basic-detail.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DecryptService } from '../../shared/services/decryptservice ';
@Component({
  selector: 'app-docket-list',
  standalone: false,
  templateUrl: './docket-list.component.html',
  styleUrl: './docket-list.component.scss'
})
export class DocketListComponent implements OnInit{
  public isSubmitting :boolean = false;
  decrypted: string = '';

  constructor(
    public docketService: DocketService, private basicDetailService: BasicDetailService, private activatedRoute: ActivatedRoute,private decryptService:DecryptService,private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const encrypted = params['data'];
      const key = 'WebX';
      if (encrypted) {
        try {
          this.decrypted = this.decryptService.decrypt(encrypted, key);
          const parsedData = JSON.parse(this.decrypted);
          localStorage.setItem("loginUserList", JSON.stringify(parsedData));
          // ✅ Required keys
          const requiredKeys = [
            "FinYear",
            "LocationCode",
            "LocationName",
            "UserImage",
            "UserId",
            "BaseUserName",
            "Companycode"
          ];

          // ✅ check karvu ke badha keys exist kare chhe
          const isValid = requiredKeys.every(key => parsedData.hasOwnProperty(key));

          if (isValid) {
            // 🔑 badha key male → normal flow
            this.docketService.loginUserList = parsedData;
            this.docketService.Location = parsedData.LocationCode;
              // this.docketService.Location ='BDD';
            this.docketService.BaseUserCode = parsedData.UserId;
          } else {
            // ❌ ek pan key missing hoy → redirect
            console.error("Invalid decrypted data, redirecting...");
            this.router.navigate(['/error']);
          }
        } catch (err) {
          console.error("Decryption or parsing failed:", err);
          this.router.navigate(['/error']);
        }
      } else {
        // ❌ query param ma data nathi → redirect
        this.router.navigate(['/error']);
      }
    });
  }

  resetAllForms() {
  // Badha build methods ne call karo
  this.docketService.detailForm();
  this.docketService.consignorbuild();
  this.docketService.freightbuild();
  this.docketService.invoicebuild();
}

  onSubmit() {
    if (this.docketService.basicDetailForm.valid && this.docketService.consignorForm.valid && this.docketService.invoiceform.valid && this.docketService.freightForm.valid) {
      const listCCH = this.docketService.freightchargingData.map(charge => ({
        ChargeCode: charge.chargeCode,
        ChargeName: charge.chargeName,
        Operator: charge.operator,
        ChargeAmount: Number(this.docketService.freightForm.get(charge.chargeCode)?.value || 0)
      }));

    const DynamicList: any[] = [];
    Object.values(this.docketService.groupedCharges).forEach((charges: any[]) => {
      charges.forEach((charge) => {
        DynamicList.push({
          ChargeCode: charge.chargeCode,
          Operator: charge.operator,
          ChargeAmount: Number(this.docketService.freightForm.get(charge.camelCaseCode)?.value || 0) ,
          Acccode: ""   // empty as per your example
        });
      });
    });

    const invoiceList = this.docketService.invoiceRows.value.map((row: any, index: number) => {
      const obj: any = {
        SrNo: row.srNo,
        DOCKNO: this.docketService.basicDetailForm.value.cNoteNo,
        INVNO: row.invoiceNo || '',
        INVDT: row.invoicedate || null,
        DECLVAL: row.declaredvalue || 0,
        PKGSNO: row.noOfPkgs || 0,
        ACTUWT: row.actualWeight || 0,
        VOL_L: row.length || 0,
        VOL_B: row.breadth || 0,
        VOL_H: row.height || 0,
        toT_CFT: row.cubicweight || 0,
        vol_cft: row.cubicweight || 0,
        Part_No: '',
        EWayBillNo: row.ewayBillNo || '',
        EWayInvoicevalue: 0,
        EWayBillInvoiceDate: row.ewayinvoiceDate || null,
        CHRGWT: 0
      };

      // ✅ conditionally add eWayBillExpiredDate only if eWayBillNo has value
      if (row.ewayBillNo) {
        obj.EWayBillExpiredDate = row.ewayBillExpiry || null;
      }

      return obj;
    });
    const payload = {
      "wmd": {
        "dockno": this.docketService.basicDetailForm.value.cNoteNo,
        "docksf": ".",
        "orgncd": this.docketService.basicDetailForm.value.origin,
        "destcd": this.docketService.basicDetailForm.value.destination,
        "reassigN_DESTCD": this.docketService.basicDetailForm.value.destination,
        "from_loc": this.docketService.basicDetailForm.value.fromCity,
        "to_loc": this.docketService.basicDetailForm.value.toCity,
        "paybas": this.docketService.basicDetailForm.value.billingType,
        "pkgsno": this.docketService.invoiceform.value.totalNoOfPkgs,
        "actuwt": this.docketService.invoiceform.value.finalActualWeight,
        "chrgwt": Math.max(this.docketService.invoiceform.value.finalActualWeight || 0, this.docketService.invoiceform.value.totalCubicWeight || 0),
        "chargedPkgsNo": this.docketService.invoiceform.value.chargeWeightPerPkg,
        "prodcd": this.docketService.basicDetailForm.value.contents,
        "spl_svc_req": "",
        "stax_paidby": "",//dropdown mathi avshe teni key
        "stax_regno": "",
        "service_Class": this.docketService.basicDetailForm.value.serviceType,
        "ftl_types": this.docketService.basicDetailForm.value.typeMovement,
        "fincmplbr": this.docketService.freightForm.value.billedAt,
        "csgncd": '8888',
        "csgnnm": this.docketService.consignorForm.value.consignorMasterName,
        "csgnaddr": this.docketService.consignorForm.value.consignorAddress,
        "csgnCity": this.docketService.consignorForm.value.consignorCity,
        "csgnPinCode": this.docketService.consignorForm.value.consignorPincode,
        "csgnTeleNo": this.docketService.consignorForm.value.consignorMobile,
        "csgnEmail": this.docketService.consignorForm.value.consignorEmail,
        "csgecd": '8888',
        "csgenm": this.docketService.consignorForm.value.consigneeMasterName,
        "csgeaddr": this.docketService.consignorForm.value.consigneeAddress,
        "csgeCity": this.docketService.consignorForm.value.consigneeCity,
        "csgePinCode": this.docketService.consignorForm.value.consigneePincode,
        "csgeTeleNo": this.docketService.consignorForm.value.consigneeMobile,
        "csgeEmail": this.docketService.consignorForm.value.consigneeEmail,
        "partY_CODE": this.docketService.basicDetailForm.value.billingParty,
        "privatemark": this.docketService.consignorForm.value.privateMark,
        "tpnumber": this.docketService.consignorForm.value.tpNumber,
        "trN_MOD": this.docketService.basicDetailForm.value.mode,
        "coD_DOD": this.docketService.basicDetailForm.value.IsCODDOD === 'Y' ? true : false,
        "cfT_YN": this.docketService.step2DetailsList?.isVolumentric === 'Y' ? true : false,
        "dacC_YN": this.docketService.basicDetailForm.value.isDACC === 'Y' ? true : false,  // step2 na response ma pn
        "localCN_YN": this.docketService.basicDetailForm.value.isLocalNote, //y and n
        "pickup_Dely": this.docketService.basicDetailForm.value.pickup,
        "permit_yn": "",// api baki chhe
        "permit_recvd_at": "",
        "permit_No": "",
        "entryby":this.docketService.loginUserList.UserId, // je user login hoy tenu userId
        "pkgsty": this.docketService.basicDetailForm.value.packingType,
        "insuyn": this.docketService.consignorForm.value.riskType,  // jo Carrier's Risk hoy to c ,owener hoy to 'o'
        "insupl": this.docketService.consignorForm.value.policyNo,
        "ctr_no": this.docketService.consignorForm.value.customerRefNo,
        "tot_modvat": Number(this.docketService.consignorForm.value.internalCovers) || 0,
        "tot_covers": Number(this.docketService.consignorForm.value.modvatCovers) || 0,
        "codchrg": this.docketService.step2DetailsList.codCharged,
        "codamt": this.docketService.step2DetailsList.codCharged,
        "businesstype": this.docketService.basicDetailForm.value.businessType,
        "loadtype": "",
        "entrysheetno": "",
        "obdno": "",
        "bacode": "", //controller side thi
        "dopino": "",
        "stax_exmpt_yn": this.docketService.basicDetailForm.value.exemptServices ? 'N' : 'Y',
        "party_as": "",
        "sourcedockno": this.docketService.basicDetailForm.value.referenceDocket,
        "multiplepickup_yn": "",
        "multipledelivery_yn": "",
        "doctype": "DKT",
        "multidelivery_yn": "",
        "multipickup_yn": "",
        "ctr_gpno": "",
        "ctr_delno": "",
        "pl_partner": "",
        "oct_amt": 0,
        "csgnaddrcd": "",
        "csgeaddrcd": "",
        "manual_dockno": this.docketService.basicDetailForm.value.cNoteNo,
        "company_code":this.docketService.loginUserList.Companycode, //login mathi
        "hday_appl_yn": "",
        "csgnmobile": this.docketService.consignorForm.value.consignorMobile,
        "csgemobile": this.docketService.consignorForm.value.consigneeMobile,
        "quot_no": "",
        "agnd_no": "",
        "party_name": this.docketService.basicDetailForm.value.billingName,
        "hday_booked_yn": "",
        "engineNo": "",
        "modelNo": "",
        "gpsNo": "",
        "csgnTinNo": "",
        "csgncstNo": "",
        "csgeTinNo": "",
        "csgecstNo": "",
        "tamNo": "",
        "chassisNo": "",
        "industry": "",
        "vehicleNo": this.docketService.basicDetailForm.value.vehicleno,
        "docketMode": "F",
        "gcType": "",
        "cft": this.docketService.invoiceform.value.cftTotal,
        "isVolumetric": this.docketService.step2DetailsList?.isVolumentric === 'Y' ? true : false,
        "isCODDOD": this.docketService.basicDetailForm.value.isCODDOD === 'Y' ? true : false,
        "isODA": this.docketService.step2DetailsList.IsODA === 'Y' ? true : false,
        "isDACC": this.docketService.basicDetailForm.value.isDACC === 'Y' ? true : false,
        "isLocalDocket": this.docketService.basicDetailForm.value.IsLocalDocket ? true : false,
        "isStaxExemp": this.docketService.basicDetailForm.value.exemptServices === 'Y' ? true : false,
        "person": this.docketService.basicDetailForm.value.personName,
        "apmtMobile": this.docketService.basicDetailForm.value.contactNo,
        "apmtRemark": this.docketService.basicDetailForm.value.remarks,
        "fromTime": this.docketService.basicDetailForm.value.fromTime,
        "toTime": this.docketService.basicDetailForm.value.toTime,
        "cftWtRatio": this.docketService.invoiceform.value.cft_Ratio,
        "cfttot": this.docketService.invoiceform.value.cftTotal,
        "decval": this.docketService.invoiceform.value.totalDeclaredValue,
        "contractId": this.docketService.step2DetailsList.contractid,
        "chargeRule": "NONE",
        "chargeSubRule": "NONE",
        "baseCode1": "NONE",
        "baseCode2": "NONE",
        "contractDepth": this.docketService.depth,
        "flagProceed": this.docketService.flagprocedd,
        "codRateType": this.docketService.step2DetailsList.codRateType,
        "min_CODCharged": this.docketService.step2DetailsList.min_CODCharged,
        "codCharged": this.docketService.step2DetailsList.codCharged,
        "daccRateType": this.docketService.step2DetailsList.daccRateType,
        "daccCharged": this.docketService.step2DetailsList.daccCharged,
        "min_DACCCharged": this.docketService.step2DetailsList.min_DACCCharged,
        "dktdaccCharges": 0,
        "ftltype": this.docketService.basicDetailForm.value.typeMovement,
        "dockdate": this.docketService.basicDetailForm.value.cNoteDate,
        "is_ODA_Apply": this.docketService.basicDetailForm.value.isODAApplicable,
        "mailId": "",
        "referenceNo": this.docketService.basicDetailForm.value.referenceDocket,
        "originStateCode": this.docketService.basicDetailForm.value.csgngstState,
        "originStateName": this.docketService.basicDetailForm.value.originState,
        "destStateCode": this.docketService.basicDetailForm.value.csgegstState,
        "destStateName": this.docketService.basicDetailForm.value.destinationState,
        "isUnionTeritory": true, ///Number(this.docketService.gstCalculationList.isunionterritory),
        "origin_Area": this.docketService.basicDetailForm.value.origin_Area,///consinee mathi avshe adress
        "destination_Area": this.docketService.basicDetailForm.value.destination_Area,///consinor mathi avshe adress
        "custGSTNo": "",
        "custGSTState": this.docketService.basicDetailForm.value.csgegstState,
        "csgeCustGSTNo": this.docketService.consignorForm.value.consigneeGSTNo,
        "csgeCustGSTState":  this.docketService.basicDetailForm.value.csgegstState,
        "isCompletion": true,
        "billingState": this.docketService.freightForm.value.billingState,
        "eWayBillNo": this.docketService.basicDetailForm.value.ewayBillNo,
        "isCounterPickUpPRS": true,
        "isCounterDelivery": true,
        "retailsd": true,
        "isDockType": "DKT",
        "txtVehicleNo": this.docketService.basicDetailForm.value.vehicleno,
        "isReferenceDKT": this.docketService.basicDetailForm.value.isreferenceDKT,
        "referenceDocketNo": this.docketService.basicDetailForm.value.referenceDocket,
        "totalPiece": 0,
        "isDKTPayment": this.docketService.basicDetailForm.value.isDocketPayment,
        "gstRateType": this.docketService.freightForm.value.gstRate,
        "isLSDocket": true,
        "origin": this.docketService.basicDetailForm.value.origin,
        "destination": this.docketService.basicDetailForm.value.destination,
        "consignor": this.docketService.consignorForm.value.consignorSelection,
        "consignee": this.docketService.consignorForm.value.consigneeSelection,
        "billingParty": this.docketService.basicDetailForm.value.billingParty,
        "freight": this.docketService.freightForm.value.freightCharges,
        "billigLocation": this.docketService.step2DetailsList.billingLocation,
        "docdt": this.docketService.basicDetailForm.value.cNoteDate,
        "tpCustGSTNo": "",
        "tpcd": "",
        "tpnm": "",
        "tpaddr": "",
        "tpCity": "",
        "tpPinCode": "",
        "tpTeleNo": "",
        "sacCode": this.docketService.basicDetailForm.value.sacCode,
        "sacCodeDesc": this.docketService.basicDetailForm.value.sacDescription,
        "exemptServices": this.docketService.basicDetailForm.value.exemptServices,
        "gstDeclarationDoc": "",
        "declarationType": "",
        "vehicleType": this.docketService.basicDetailForm.value.vehicleType,
        "isAppointmentDelivery": this.docketService.basicDetailForm.value.isAppointmentDelivery,
        "isCSDDelivery": this.docketService.basicDetailForm.value.iscsdDelivery,
        "isMAllDelivery": this.docketService.basicDetailForm.value.IsMAllDeliveryN,
      },
      wmdc: {
        "dockno": this.docketService.basicDetailForm.value.cNoteNo,
        "ratE_TYPE": this.docketService.freightForm.value.rateType,
        "frT_RATE": Number(this.docketService.freightForm.value.freightRate) || 0,
        "freighT_CALC": Number(this.docketService.freightForm.value.freightRate) || 0,
        "freight": Number(this.docketService.freightForm.value.freightCharges) || 0,
        "fov": this.docketService.freightForm.value.fovRate,
        "subTotal": this.docketService.freightForm.value.subTotal,
        "svctax": 0,
        "cess": 0,
        "dkttot": this.docketService.freightForm.value.dktTotal,
        "hedu_cess": 0,
        "svctaX_Rate": 0,
        "discount": Number(this.docketService.freightForm.value.discount) || 0,
        "sbcRate": 0,
        "sbCess": 0,
        "fovCalculated": 0,
        "kkcRate": 0,
        "kkcAmount": 0,
        "gstType": this.docketService.gstCalculationList.gsttype,
        "igstRate": this.docketService.freightForm.value.igstrate || 0,
        "igstAmount": this.docketService.freightForm.value.igstamount || 0,
        "cgstRate": this.docketService.freightForm.value.cgstrate || 0,
        "cgstAmount": this.docketService.freightForm.value.cgstamount || 0,
        "sgstRate": this.docketService.freightForm.value.sgstrate || 0,
        "sgstAmount": this.docketService.freightForm.value.sgstamount || 0,
        "utgstRate": this.docketService.freightForm.value.utgstrate || 0,
        "utgstAmount": this.docketService.freightForm.value.utgstamount || 0,
        "advanceAmount": 0,
        "discountValue": 0,
      },
      "PC": {
        "paymentMode": "",
        "payAmount": 0,
        "chequeNo": "",
      },
    };
      const formData = new FormData();
      this.appendObjectToFormData(formData, payload.wmd, "DVM.WMD");
      this.appendObjectToFormData(formData, payload.wmdc, "DVM.WMDC");
      formData.append("DVM.isCompletion", "false")
      formData.append("docketInvoiceList", JSON.stringify(invoiceList));
      formData.append("docketChargesList", JSON.stringify(listCCH));
      formData.append("DOCTYP", "DKT");
      formData.append("DynamicList", JSON.stringify(DynamicList));
      this.appendObjectToFormData(formData, payload.PC, "PC");

      // GSTDeclaration file
      const gstFile = this.docketService.basicDetailForm.value.GSTDeclaration;
      if (gstFile instanceof File) {
        formData.append("GSTDeclaration", gstFile, gstFile.name);
      } else {
        formData.append("GSTDeclaration", "");
      }
      formData.append("BaseFinYear",this.docketService.loginUserList.FinYear);
      formData.append("BaseCompanyCode", this.docketService.loginUserList.Companycode);
      formData.append("BaseUserName", this.docketService.BaseUserCode);
      formData.append("DVM.WMD.insupldt", new Date(this.docketService.consignorForm.value.policyDate).toISOString()),
        formData.append("DVM.PC.chequeDate", new Date().toISOString()),
        formData.append("DVM.WMD.permitdt", new Date().toISOString()),
        formData.append("DVM.WMD.sdD_Date", new Date().toISOString()),
        formData.append("DVM.WMD.dockdt", this.docketService.basicDetailForm.value.cNoteDate ? new Date(this.docketService.basicDetailForm.value.cNoteDate).toISOString() : '');
      formData.append("DVM.WMD.cdeldt", new Date(this.docketService.freightData.edd).toISOString()),
        formData.append("DVM.WMD.AppointmentDT", new Date(this.docketService.basicDetailForm.value.appointmentDT).toISOString()),
       formData.append("DVM.WMD.Version", String(Number('1')));
        formData.append("DVM.docketType", "DKT");
           this.isSubmitting = true; 
      this.basicDetailService.onSubmit(formData).subscribe({
        next: (response: any) => {
          if (response) {
       window.scrollTo({ top: 0, behavior: 'smooth' }); 

            this.docketService.successMsg='Docket submitted successfully.'
            this.docketService.basicDetailForm.reset();
            this.docketService.freightForm.reset();
            this.docketService.invoiceform.reset();
            this.docketService.consignorForm.reset();
             setTimeout(() => {
                window.location.reload();
              }, 4000);
          }
           this.isSubmitting = false;
        },
        error: (error) => {
      this.docketService.submitErrorMsg =error?.error?.message;
        this.isSubmitting = false; // ✅ loader stop on error
       window.scrollTo({ top: 0, behavior: 'smooth' }); 

      }
      });
    } else {
      this.docketService.basicDetailForm.markAllAsTouched();
      this.docketService.consignorForm.markAllAsTouched();
      this.docketService.invoiceform.markAllAsTouched();
      this.docketService.freightForm.markAllAsTouched();
       window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  }

  appendObjectToFormData(formData: FormData, obj: any, parentKey: string = "") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const formKey = parentKey ? `${parentKey}.${key}` : key;

        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          // Recursive call if nested object
          this.appendObjectToFormData(formData, value, formKey);
        } else {
        formData.append(formKey, value !== null && value !== undefined ? String(value) : "");
        }
      }
    }
  }

}

