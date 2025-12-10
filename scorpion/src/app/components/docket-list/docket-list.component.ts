import { Component, OnInit, ViewChild } from '@angular/core';
import { DocketService } from '../../shared/services/docket.service';
import { BasicDetailService } from '../../shared/services/basic-detail.service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../shared/services/sweet-alert.service';
import { environment } from 'environments/environment';
import { FormArray } from '@angular/forms';
import { BasePayload } from 'app/shared/models/general-master.model';
import { BasicDetailsComponent } from './basic-details/basic-details.component';
@Component({
  selector: 'app-docket-list',
  standalone: false,
  templateUrl: './docket-list.component.html',
  styleUrl: './docket-list.component.scss'
})
export class DocketListComponent implements OnInit {
  public isSubmitting: boolean = false;
  decrypted: string = '';
  env = environment;
  public isRedirect:boolean = false;
  
  public isComplitionlist!:BasePayload;
  @ViewChild(BasicDetailsComponent) basicDetailsComp!: BasicDetailsComponent;


  constructor(
    public docketService: DocketService, private basicDetailService: BasicDetailService, private router: Router,
    private sweetAlertService: SweetAlertService,
  ) { }

  ngOnInit(): void {
    //  if (!this.docketService.loginUserList) {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.Location = 'PIM';
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
  // }
    const currentRoute = this.router.url.split("?")[0];
    if (currentRoute.includes("docketFinancialEdit") || currentRoute.includes("docketEditCretria")) {
      this.docketService.isComplition = true;
      this.getCompletionData();
    } 

    // this.activatedRoute.queryParams.subscribe(params => {
    //   const encrypted = params['data'];
    //   const key = 'WebX';

    //   if (!encrypted) {
    //     this.router.navigate(['/error']);
    //     return;
    //   }

    //   try {
    //     const decrypted = this.decryptService.decrypt(encrypted, key);
    //     const parsedData = JSON.parse(decrypted);

    //     // 🔑 check current route
    //     const currentRoute = this.router.url.split("?")[0];

    //     if (currentRoute.includes("docketFinancialEdit")) {
    //       this.handleFinancialEdit(parsedData);
    //     } else if (currentRoute.includes("docketEditCretria") || currentRoute.includes("docket")) {
    //       this.handleNormalDocket(parsedData);
    //     } else {
    //       this.router.navigate(['/error']);
    //     }
    //   } catch (err) {
    //     console.error("Decryption/Parsing failed", err);
    //     this.router.navigate(['/error']);
    //   }
    // });
  }

  // handleNormalDocket(parsedData: any) {
  //   const requiredKeys = [
  //     "FinYear", "LocationCode", "LocationName",
  //     "UserImage", "UserId", "BaseUserName", "Companycode"
  //   ];
  //   if (requiredKeys.every(key => parsedData.hasOwnProperty(key))) {
  //     this.docketService.loginUserList = parsedData;
  //      this.docketService.Location = parsedData.LocationCode;
  //     // this.docketService.Location = 'IDR';
  //     this.docketService.BaseUserCode = parsedData.UserId;
  //     this.docketService.baseUsername = parsedData.BaseUserName;
  //     console.log("👉 Normal docket flow loaded");
  //   } else {
  //     this.router.navigate(['/error']);
  //   }
  // }

  // handleFinancialEdit(parsedData: any) {
  //   const requiredKeys = [
  //     "FinYear", "LocationCode", "LocationName",
  //     "UserImage", "UserId", "BaseUserName", "Companycode",
  //     "DocketNo","IsFromBillGeneration","Type",
  //     // "baseLocationCode","baseCompanyCode","baseUserName"
  //   ];
  //   if (requiredKeys.every(key => parsedData.hasOwnProperty(key))) {
  //     this.docketService.loginUserList = parsedData;
  //     this.docketService.Location = parsedData.LocationCode;
  //     // this.docketService.Location = 'NAG';
  //     this.docketService.BaseUserCode = parsedData.UserId;
  //     this.docketService.baseUsername = parsedData.BaseUserName;
  //     this.docketService.isComplition=true;
  //     this.isComplitionlist = parsedData;
  //     setTimeout(() => {
  //       this.getCompletionData();
  //     }, 300);
  //   } else {
  //     this.router.navigate(['/error']);
  //   }
  // }

getCompletionData() {
  const payload = {
    docketNo: this.docketService.loginUserList.DocketNo,
    // docketNo: 'CNPIM2526000006',
    isFromBillGeneration: this.docketService.loginUserList.IsFromBillGeneration || '',
    type: this.docketService.loginUserList.Type,
    baseLocationCode: this.docketService.loginUserList.LocationCode,
    baseCompanyCode: this.docketService.loginUserList.Companycode,
    baseUserName: this.docketService.loginUserList.BaseUserName
  };

  this.basicDetailService.getCompletion(payload).subscribe({
    next: (response) => {
      if (response) {
        this.docketService.completiondata = response.data;
        const basicDetail = this.docketService.completiondata.wmd;

        if (basicDetail) {
          this.docketService.getpincodeData(basicDetail.csgePinCode);
          // first patch
          this.docketService.basicDetailForm.patchValue({
            cNoteNo: basicDetail.dockno,
            cNoteDate: new Date(basicDetail.dockdt.split('T')[0]),
            // cNoteDate: new Date(),
            pincode: basicDetail.csgePinCode ? basicDetail.csgePinCode : null,
            billingType: basicDetail.paybas,
            billingName: basicDetail.party_name,
            billingParty: basicDetail.partY_CODE,
            origin: basicDetail.orgncd,
            destination: basicDetail.destcd,
          });
           this.docketService.Location =  basicDetail.orgncd
          this.docketService.getRuleDetailForDepth();
          this.docketService.getRuleDetailForProceed()
          setTimeout(() => {
            // second patch
            this.docketService.basicDetailForm.patchValue({
              originState: basicDetail.originStateName,
              csgngstState: basicDetail.originStateCode,
              fromCity: basicDetail.from_loc,
              toCity: basicDetail.to_loc,
              mode: basicDetail.trN_MOD,
              serviceType: basicDetail.service_Class,
              pickup: basicDetail.pickup_Dely,
              exemptServices: basicDetail.exemptServices,
              isreferenceDKT: basicDetail.isReferenceDKT,
              iscsdDelivery: basicDetail.isCSDDelivery,
              isCODDOD: basicDetail.isCODDOD,
              IsMAllDeliveryN: basicDetail.isMAllDelivery,
              IsODA: basicDetail.isODA,
              contents: basicDetail.prodcd,
              packingType: basicDetail.pkgsty,
              sacCode: basicDetail.sacCode,
              sacDescription: basicDetail.sacCodeDesc,
              appointmentDT: basicDetail.appointmentDT !== '0001-01-01T00:00:00'?new Date(basicDetail.appointmentDT):new Date(),
              personName: basicDetail.person,
              contactNo: basicDetail.apmtMobile,
              remarks: basicDetail.apmtRemark,
              fromTime: basicDetail.fromTime,
              toTime: basicDetail.toTime,
              ewayBillNo: basicDetail.eWayBillNo,
              referenceDocket: basicDetail.referenceDocketNo,
              isDocketPayment: basicDetail.isDKTPayment,
              isAppointmentDelivery: basicDetail.isAppointmentDelivery,
              specialInstruction: basicDetail.spl_svc_req,
              ISCounterPickUpPRS: basicDetail.isCounterPickUpPRS,
              ISCounterDelivery: basicDetail.isCounterDelivery,
              // isDACC: basicDetail.isDACC
            });
            this.basicDetailsComp.onChangeCityListList(this.docketService.basicDetailForm.get('fromCity')?.value,'from');
            if(!basicDetail.exemptServices){
              this.docketService.GetGSTFromTrnMode()
            }
            // this.docketService.GetDKTGSTForGTA();
            this.docketService.getpincodeData(basicDetail.csgnPinCode);
            this.docketService.consignorForm.patchValue({
              consignorName: basicDetail.csgncd,
              consignorMasterName: basicDetail.csgnnm,
              consignorAddress: basicDetail.csgnaddr,
              consignorCity: basicDetail.csgnCity,
              consignorPincode: basicDetail.csgnPinCode,
              consigneeName: basicDetail.csgecd,
              consigneeMasterName: basicDetail.csgenm,
              consigneeAddress: basicDetail.csgeaddr,
              consigneeCity: basicDetail.csgeCity,
              consigneePincode: basicDetail.csgePinCode,
              consignorMobile: basicDetail.csgnmobile,
              consigneeMobile: basicDetail.csgemobile,
              consigneeGSTNo: basicDetail.csgeCustGSTNo,
              consignorGSTNo: basicDetail.custGSTNo,
            });
            if (this.docketService.completiondata.listInVoice?.length) {
               const invoiceRows = this.docketService.invoiceform.get('invoiceRows') as FormArray;
               invoiceRows.clear(); // Clear old rows
              this.docketService.completiondata.listInVoice.forEach((item: any, index: number) => {
                 invoiceRows.push(this.docketService.createInvoiceRow(index));
                this.docketService.invoiceRows.controls[index].patchValue({
                  srNo: item.srNo,
                  ewayBillNo: item.eWayBillNo,
                  ewayBillExpiry: item.eWayBillExpiredDate?new Date(item.eWayBillExpiredDate) : '01 JAN 0001',
                  ewayinvoiceDate: item.eWayBillInvoiceDate?new Date(item.eWayBillInvoiceDate) : '01 JAN 0001',
                  invoiceNo: item.invno,
                  declaredvalue: item.declval,
                });
                invoiceRows.controls.forEach((row: any) => {
                    row.initialEwayBillNo = row.get('ewayBillNo')?.value;
                  });
              });
            }

            if (this.docketService.completiondata.listBoxLBH?.length) {
              const boxRows = this.docketService.invoiceform.get('boxDetailRows') as FormArray;
              boxRows.clear(); // Clear old rows
              this.docketService.completiondata.listBoxLBH.forEach((item: any, index: number) => {
                   boxRows.push(this.docketService.createboxDetailRow(index));
                this.docketService.boxDetailRows.controls[index].patchValue({
                  srNo: item.srNo || index + 1,
                  noOfPkgs: item.pkgsno || 0,
                  actualWeight: item.actuwt || 0,
                  length: item.voL_L || 0,
                  breadth: item.voL_B || 0,
                  height: item.voL_H || 0,
                  cubicweight: item.vol_cft || 0,
                  totalCFT: item.toT_CFT || 0
                });
              });
            }
            this.docketService.onFormFieldChange();
              this.docketService.invoiceform.patchValue({
                totalNoOfPkgs: basicDetail.pkgsno,
                totalActualWeight: basicDetail.actuwt,
                finalActualWeight: basicDetail.chrgwt,
                chargeWeightPerPkg: basicDetail.chargedPkgsNo,
              });
            this.docketService.freightForm.patchValue({
            EDD: basicDetail.cdeldt === '0001-01-01T00:00:00' ? '01 JAN 0001' : basicDetail.cdeldt ,
            gstRate: basicDetail.gstRateType
          });
          if(this.docketService.loginUserList?.Type === '2'){
            if (this.docketService.completiondata?.listCharges) {
              this.docketService.completiondata.listCharges.forEach((item: any) => {
                if (this.docketService.freightForm.contains(item.chargeCode)) {
                  this.docketService.freightForm.patchValue({
                    [item.chargeCode]: item.chargeAmount
                  });
                }
              });
              this.docketService.mergeAndPatchCharges( [], // API khali
                this.docketService.completiondata?.listCharges || [],
                this.docketService.freightForm,
                this.docketService.basicDetailForm
              );
            }
            this.docketService.mergeAndPatchGST({},this.docketService.completiondata?.wmdc || {}, this.docketService.freightForm)
          }
          }, 300);
        }
      }
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
    if (this.isSubmitting) return;
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
            ChargeAmount: Number(this.docketService.freightForm.get(charge.camelCaseCode)?.value || 0),
            Acccode: "",   // empty as per your example
            entryDate: "",
            isPercentageShow: true,
            isDDL: true,
            effectiveEndDate: "",
            accountReceivable: "",
            isApplicable: true,
            entryBy: "",
            effectiveStartDate: "",
            chargeType: "",
            tempId: 0,
            isActive: true,
            fromTabel: "",
            accountPayable: "",
            whereClause: "",
            percentage: 0,
            id: 0,
            chargeName: ""
          });
        });
      });
      const invoiceList = this.docketService.invoiceRows.value.map((row: any, index: number) => {
        const obj: any = {
          SrNo: row.srNo,
          DOCKNO: this.docketService.basicDetailForm.value.cNoteNo,
          INVNO: row.invoiceNo || '',
          INVDT: new Date().toISOString(),
          DECLVAL: row.declaredvalue || 0,
          PKGSNO: Number(row.noOfPkgs) || 0,
          ACTUWT: row.actualWeight || 0,
          VOL_L: Number(row.length) || 0,
          VOL_B: Number(row.breadth) || 0,
          VOL_H: Number(row.height) || 0,
          toT_CFT: row.cubicweight || 0,
          vol_cft: row.cubicweight || 0,
          Part_No: '',
          EWayBillNo: row.ewayBillNo || '',
          EWayInvoicevalue: 0,
          EWayBillInvoiceDate: row.ewayinvoiceDate ? new Date(row.ewayinvoiceDate).toISOString() : null,
          CHRGWT: 0,
          eWayBillExpiredDate:"",
          hsnCode:"",
          itemCode:"",
          piece:0,
          pieceAmount: 0,
          pieceWeight: 0,
          pkgsno: 0,
          qty: 0,
          transportrate:0
        };

        // ✅ conditionally add eWayBillExpiredDate only if eWayBillNo has value
        if (row.ewayBillNo) {
          obj.EWayBillExpiredDate = row.ewayBillExpiry || null;
        }

        return obj;
      });
      const DocketBoxLBHList = this.docketService.boxDetailRows.value.map((row: any, index: number) => {
        const obj: any = {
          ACTUWT: Number(row.actualWeight) || 0,
          SrNo: row.srNo,
          VOL_L: Number(row.length) || 0,
          vol_cft: Number(row.cubicweight) || 0,
          PKGSNO: Number(row.noOfPkgs) || 0,
          toT_CFT: Number(row.cubicweight) || 0,
          DOCKNO: this.docketService.basicDetailForm.value.cNoteNo,
          VOL_B: Number(row.breadth) || 0,
          VolumetricBox: "",
          VOL_H: Number(row.height) || 0,
        };
        return obj;
      });
      if(this.docketService.basicDetailForm.value.isreferenceDKT === true|| this.docketService.basicDetailForm.value.billingType ==='P04'){
        this.docketService.freightForm.patchValue({
          freightRate:0,
          freightCharges:0,
          dktTotal:0
        })
      }
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
          "actuwt": this.docketService.invoiceform.value.totalActualWeight,
          // "chrgwt": Math.max(this.docketService.invoiceform.value.finalActualWeight || 0, this.docketService.invoiceform.value.totalCubicWeight || 0),
          "chrgwt": this.docketService.invoiceform.value.finalActualWeight || 0,
          "chargedPkgsNo": this.docketService.invoiceform.value.chargeWeightPerPkg,
          "prodcd": this.docketService.basicDetailForm.value.contents,
          "spl_svc_req": "",
          "stax_paidby": this.docketService.freightForm.value.stax_paidby,//dropdown mathi avshe teni key
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
          "dacC_YN": this.docketService.basicDetailForm.value.isDACC,  // step2 na response ma pn
          "localCN_YN": this.docketService.basicDetailForm.value.isLocalNote, //y and n
          "pickup_Dely": this.docketService.basicDetailForm.value.pickup,
          "permit_yn": "",// api baki chhe
          "permit_recvd_at": "",
          "permit_No": "",
          "entryby": this.docketService.loginUserList.UserId, // je user login hoy tenu userId
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
          "stax_exmpt_yn": this.docketService.freightForm.value.stax_exmpt_yn,
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
          "company_code": this.docketService.loginUserList.Companycode, //login mathi
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
          "isVolumetric":  this.docketService.basicDetailForm.value.isVolumetric,
          "isCODDOD": this.docketService.basicDetailForm.value.isCODDOD === 'Y' ? true : false,
          "isODA": this.docketService.step2DetailsList.IsODA === 'Y' ? true : false,
          "isDACC": this.docketService.basicDetailForm.value.isDACC,
          "isLocalDocket": this.docketService.basicDetailForm.value.IsLocalDocket ? true : false,
          "isStaxExemp": this.docketService.freightForm.value.isStaxExemp?true:false,
          "IsGSTApplied":this.docketService.freightForm.value.isStaxExemp?true:false, 
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
          "dockdate": new Date(this.docketService.basicDetailForm.value.cNoteDate).toISOString(),
          "is_ODA_Apply": this.docketService.basicDetailForm.value.isODAApplicable,
          "mailId": "",
          "referenceNo": this.docketService.basicDetailForm.value.referenceDocket,
          "originStateCode": this.docketService.basicDetailForm.value.csgngstState,
          "originStateName": this.docketService.basicDetailForm.value.originState,
          "destStateCode": this.docketService.basicDetailForm.value.csgegstState,
          "destStateName": this.docketService.basicDetailForm.value.destinationState,
          "isUnionTeritory": this.docketService.gstCalculationList.isunionterritory === "1",
          "origin_Area": this.docketService.basicDetailForm.value.origin_Area,///consinee mathi avshe adress
          "destination_Area": this.docketService.basicDetailForm.value.destination_Area,///consinor mathi avshe adress
          "custGSTNo":  this.docketService.consignorForm.value.consignorGSTNo,
          "custGSTState": this.docketService.basicDetailForm.value.custGSTState,
          "csgeCustGSTNo": this.docketService.consignorForm.value.consigneeGSTNo,
          "csgeCustGSTState": this.docketService.basicDetailForm.value.csgeCustGSTState,
          "isCompletion": true,
          "billingState": this.docketService.freightForm.value.billingState,
          "eWayBillNo": this.docketService.basicDetailForm.value.ewayBillNo,
          "isCounterPickUpPRS": this.docketService.basicDetailForm.value.ISCounterPickUpPRS?true:false,
          "isCounterDelivery": this.docketService.basicDetailForm.value.ISCounterDelivery?true:false,
          "retailsd": false,
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
          "docdt": new Date(this.docketService.basicDetailForm.value.cNoteDate).toISOString(),
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
          "DiscountType": this.docketService.freightForm.value.discountType,
          "AppointmentNo":"",
          "CSDNo":"",
          "MSDNo":"",
          "editinfo":"",
          "TrnServiceType":"",
          "QTY":"",
          "IsFromBillGeneration":"",
          "cutoff_applied_yn":"",
          "SerialNo":"",
          "CSGEFloor":0,
          "ISOnSubtotalorTotal":"",
          "Discount": Number(this.docketService.freightForm.value.discount) || 0,
          "TRDays":0,
          
        },
        wmdc: {
          "dockno": this.docketService.basicDetailForm.value.cNoteNo,
          "ratE_TYPE": this.docketService.freightForm.value.rateType,
          "frT_RATE": Number(this.docketService.freightForm.value.freightRate) || 0,
          "freighT_CALC": Number(this.docketService.freightForm.value.freightRate) || 0,
          "freight": Number(this.docketService.freightForm.value.freightCharges) || 0,
          "fov": this.docketService.freightForm.value.fovCharged,
          "fovRate": this.docketService.freightForm.value.fovRate,
          "subTotal": this.docketService.freightForm.value.subTotal,
          "svctax": 0,
          "cess": 0,
          "dkttot": this.docketService.freightForm.value.dktTotal,
          "hedu_cess": 0,
          "svctaX_Rate": 0,
          "discount": Number(this.docketService.freightForm.value.discount) || 0,
          "sbcRate": 0,
          "sbCess": 0,
          "fovCalculated": Number(this.docketService.freightForm.value.fovCalculated) || 0,
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
          "DiscountType": this.docketService.freightForm.value.discountType,
          "discountValue": Number(this.docketService.freightForm.value.discountAmount),
        },
        "PC": {
          "paymentMode": "",
          "payAmount": 0,
          "chequeNo": "",
        },
      };

      const DKTsubTotal = Number(this.docketService.freightForm.value.subTotal) || 0;
      const DKTTotal = Number(this.docketService.freightForm.value.dktTotal) || 0;

      const docketcharges = {
        SubTotal: DKTsubTotal,
        DocketTotal: DKTTotal,
      };

      // const validationError = this.validateDocket(payload, DKTsubTotal, docketcharges, DKTTotal);

      // if (validationError) {
      //   this.sweetAlertService.error(validationError);
      //   window.scrollTo({ top: 0, behavior: "smooth" });
      //   return;
      // }
      const formData = new FormData();
      this.appendObjectToFormData(formData, payload.wmd, "DVM.WMD");
      this.appendObjectToFormData(formData, payload.wmdc, "DVM.WMDC");
      formData.append("DVM.isCompletion", "false");
      formData.append("DVM.IsFromCompletion", this.docketService?.loginUserList?.Type?.toString() === '1'  ? "1" :"0");
      formData.append("docketInvoiceList", JSON.stringify(invoiceList));
      formData.append("DocketBoxLBHList", JSON.stringify(DocketBoxLBHList));
      formData.append("docketChargesList", JSON.stringify(listCCH));
      formData.append("DOCTYP", "DKT");
      formData.append("BaseLocationCode", "C003");

      formData.append("DynamicList", JSON.stringify(DynamicList));
      this.appendObjectToFormData(formData, payload.PC, "PC");

      // GSTDeclaration file
      const gstFile = this.docketService?.selectedFile;
      if (gstFile instanceof File) {
        formData.append("GSTDeclaration", gstFile, gstFile.name);
      } else {
        formData.append("GSTDeclaration", "");
      }
      formData.append("BaseFinYear", this.docketService.loginUserList.FinYear);
      formData.append("BaseCompanyCode", this.docketService.loginUserList.Companycode);
      formData.append("BaseUserName", this.docketService.BaseUserCode);
      formData.append("DVM.WMD.insupldt", new Date(this.docketService.consignorForm.value.policyDate).toISOString()),
        formData.append("DVM.PC.chequeDate", new Date().toISOString()),
        formData.append("DVM.WMD.permitdt", new Date().toISOString()),
        formData.append("DVM.WMD.sdD_Date", new Date().toISOString()),
        formData.append("DVM.WMD.dockdt", this.docketService.basicDetailForm.value.cNoteDate ? new Date(this.docketService.basicDetailForm.value.cNoteDate).toISOString() : '');
      // formData.append("DVM.WMD.cdeldt", new Date(this.docketService.freightData.edd).toISOString()),
        formData.append("DVM.WMD.cdeldt", this.docketService.freightData.edd );


        formData.append("DVM.WMD.AppointmentDT",this.docketService.basicDetailForm.value.appointmentDT ? new Date(this.docketService.basicDetailForm.value.appointmentDT).toISOString() : new Date().toISOString()),
        formData.append("DVM.WMD.Version", String(Number('9')));
      formData.append("DVM.docketType", "DKT");
      this.isSubmitting = true;
      if(!this.docketService.isComplition){
      this.basicDetailService.onSubmit(formData).subscribe({
        next: (response: any) => {
          if (response) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.docketService.successMsg = 'Docket submitted successfully.'
            // window.parent.location.href = `${this.env.liveUrl}Operation/DocketDone/${'1'}?DOCKNO=${response.res.dockNo}&IsFromBillGeneration=N&src=angular`;
            // {btoa('angular')}
            window.parent.location.href = `${this.env.liveUrl}Operation/DocketDone/${'1'}?DOCKNO=${response.res.dockNo}&BILLNO=${response.res.billNo}&MRSNo=${response.res.mrsNo}&APMTNO=${response.res.apmtNo}&id=${response.res.id}&IsFromBillGeneration=N&src=angular`;
            this.docketService.basicDetailForm.reset();
            this.docketService.freightForm.reset();
            this.docketService.invoiceform.reset();
            this.docketService.consignorForm.reset();
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.docketService.submitErrorMsg = error?.error?.message;
          this.isSubmitting = false; // ✅ loader stop on error

        }
      });
    }
      if(this.docketService.isComplition){
        this.basicDetailService.completionSubmit(formData).subscribe({
        next: (response: any) => {
          if (response) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.docketService.successMsg = 'Docket submitted successfully.'
             this.isRedirect = true;
            // window.parent.location.href = `${this.env.liveUrl}Operation/DocketDone/${'2'}?DOCKNO=${response.res.dockNo}&IsFromBillGeneration=N&src=angular`;
            window.parent.location.href = `${this.env.liveUrl}Operation/DocketDone/${'2'}?DOCKNO=${response.res.dockNo}&BILLNO=${response.res.billNo}&MRSNo=${response.res.mrsNo}&APMTNO=${response.res.apmtNo}&id=${response.res.id}&IsFromBillGeneration=N&src=angular`;
            this.docketService.basicDetailForm.reset();
            this.docketService.freightForm.reset();
            this.docketService.invoiceform.reset();
            this.docketService.consignorForm.reset();
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.docketService.submitErrorMsg = error?.error?.message;
          this.isSubmitting = false; // ✅ loader stop on error
           this.isRedirect = false;

        }
      });
      }
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

  validateDocket(DVM: any, DKTsubTotal: number, docketcharges: any, DKTTotal: number): string | null {
    let CalculatedFREIGHT = 0;

    // 🔹 Freight Calculation
    switch (this.docketService.freightForm.value.rateType) {
      case "P":
        CalculatedFREIGHT =
          this.docketService.invoiceform.value.totalNoOfPkgs *
          this.docketService.freightForm.value.freightRate;
        break;
      case "F":
        CalculatedFREIGHT = this.docketService.freightForm.value.freightRate;
        break;
      case "T":
        CalculatedFREIGHT =
          (Math.max(
            this.docketService.invoiceform.value.finalActualWeight || 0,
            this.docketService.invoiceform.value.totalCubicWeight || 0
          ) *
            this.docketService.freightForm.value.freightRate) / 1000;
        break;
      case "W":
        CalculatedFREIGHT =
          Math.max(
            this.docketService.invoiceform.value.finalActualWeight || 0,
            this.docketService.invoiceform.value.totalCubicWeight || 0
          ) * this.docketService.freightForm.value.freightRate;
        break;
    }

    // 🟢 Freight Validation
    if (
      Math.round(CalculatedFREIGHT) !==
      Math.round(Number(this.docketService.freightForm.value.freightCharges))
    ) {
      this.sweetAlertService.error("Freight Not Calculated Right. Please Check Freight and then submit.");
    }

    // 🟢 EDD Validation
    if (!this.docketService.freightData.edd) {
      this.sweetAlertService.error("EDD Date cannot be blank.");
    }

    // 🟢 Charge Weight Validation
    if (
      Math.max(
        this.docketService.invoiceform.value.finalActualWeight || 0,
        this.docketService.invoiceform.value.totalCubicWeight
      ) <= 0
    ) {
      this.sweetAlertService.error("Charge weight cannot be 0.");
    }

    // 🟢 SubTotal Validation
    if (Math.round(DKTsubTotal) !== Math.round(docketcharges.SubTotal)) {
      this.sweetAlertService.error("Problem in Docket Subtotal Calculation. Please retry and check charges properly.");
    }

    // 🟢 Docket Total Validation
    const DKtTotDiff = DKTTotal - docketcharges.DocketTotal;
    if (Math.abs(DKtTotDiff) >= 1) {
      this.sweetAlertService.error("Problem in Docket Total Calculation. Please retry and check charges properly.");
    }

    return null; // ✅ all validations passed
  }



}

