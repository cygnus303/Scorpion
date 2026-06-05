import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { THCMasterService } from './thc-master.service';
import { DocketService } from './docket.service';

@Injectable({
  providedIn: 'root'
})
export class VendorChargeHelperService {
  constructor(
    private THCMasterService: THCMasterService,
    private docketService: DocketService
  ) { }

  private vendorListCache: Map<string, any[]> = new Map();

  fetchVendorListFor(vendorTypeCode: string | number | undefined, callback: (list: any[]) => void, type?: string) {
    if (!vendorTypeCode) {
      callback([]);
      return;
    }
    const strVendorTypeCode = vendorTypeCode.toString();
    const baseLocationCode = this.docketService.loginUserList.LocationCode;
    const baseUserName = this.docketService.loginUserList.BaseUserName;
    const documentType = this.docketService.loginUserList.Type;
    const cacheKey = `${strVendorTypeCode}_${baseLocationCode}_${documentType}_${type || 'L'}`;

    if (this.vendorListCache.has(cacheKey)) {
      callback(this.vendorListCache.get(cacheKey)!);
      return;
    }

    const cacheAndCallback = (list: any[]) => {
      this.vendorListCache.set(cacheKey, list);
      callback(list);
    };

    if (strVendorTypeCode === 'B' || strVendorTypeCode == '04') {
      this.getVendorListFromApi('04', baseLocationCode, baseUserName, documentType, cacheAndCallback);
    } else if (strVendorTypeCode === 'A' || strVendorTypeCode == 'XX1') {
      this.getVendorListFromApi('XX1', baseLocationCode, baseUserName, documentType, cacheAndCallback);
    } else if (strVendorTypeCode === 'M') {
      this.getVendorListFromApi('19', baseLocationCode, baseUserName, documentType, cacheAndCallback);
    } else if (strVendorTypeCode === 'XX5' || strVendorTypeCode === 'XX9' || strVendorTypeCode === 'XX8') {
      this.getBranchWiseLoadingUnloading(strVendorTypeCode, baseLocationCode, cacheAndCallback, type);
    } else {
      cacheAndCallback([]);
    }
  }

  private getVendorListFromApi(vendorType: string, branchCode: string, userName: string, documentType: any, callback: (list: any[]) => void) {
    const data = { vendorType, branchCode, userName, documentType };
    this.THCMasterService.getVendorsList(data).subscribe({
      next: (response: any) => {
        if (response.success) {
          const list = response.data.map((x: any) => ({ value: x.vendor_Code, text: x.vendor_Name }));
          callback(list);
        } else {
          callback([]);
        }
      },
      error: () => callback([])
    });
  }

  private getBranchWiseLoadingUnloading(vendorType: string, baseLocationCode: string, callback: (list: any[]) => void, type?: string) {
    const data = { vendorType, baseLocationCode, type };
    this.THCMasterService.getBranchWiseLoadingUnloadingVendorList(data).subscribe({
      next: (response: any) => {
        if (response.success) {
          callback(response.data);
        } else {
          callback([]);
        }
      },
      error: () => callback([])
    });
  }

  handleHeaderHccVendorTypeChange(
    codeId: string | number | undefined,
    formArray: FormArray,
    rowVendorLists: any[][],
    setHeaderVendorList: (list: any[]) => void,
    vendorTypeControlName: string = 'luVendorTyp',
    vendorCodeControlName: string = 'luVendorCode',
    rateTypeControlName: string = 'ratetype',
    rateControlName: string = 'newRate',
    type?: string
  ) {
    if (!codeId) return;
    const strCodeId = codeId.toString();
    this.fetchVendorListFor(strCodeId, (list) => {
      setHeaderVendorList(list);
      formArray.controls.forEach((ctrl: any, i: number) => {
        const patchData: any = { [vendorTypeControlName]: strCodeId, [vendorCodeControlName]: null };
        if (strCodeId === 'XX5' || strCodeId === 'XX9') {
          patchData[rateTypeControlName] = null;
          patchData[rateControlName] = 0;
          patchData['rateType'] = null; // some places use 'rateType' vs 'ratetype'
          patchData['NewRate'] = 0;
        }
        ctrl.patchValue(patchData);
        rowVendorLists[i] = list;
      });
    }, type);
  }

  handleHeaderVendorChange(
    vendorCode: string | number | undefined,
    formArray: FormArray,
    vendorCodeControlName: string = 'luVendorCode',
    loadUnloadType?: string,
    chargeType?: string | null,
    rateTypeControlName: string = 'ratetype',
    rateControlName: string = 'newRate',
    vendorTypeControlName: string = 'luVendorTyp',
    headerFormGroup?: FormGroup,
    headerRateTypeControlName: string = 'ratetype'
  ) {
    if (formArray.length === 0) return;

    formArray.controls.forEach((ctrl: any) => {
      ctrl.patchValue({ [vendorCodeControlName]: vendorCode });
    });

    if (!vendorCode || !loadUnloadType) return;

    // Check first row's vendor type to see if it's XX5 or XX9
    const firstRowVendorType = formArray.at(0).value[vendorTypeControlName];
    if (firstRowVendorType === 'XX5' || firstRowVendorType === 'XX9') {
      const data = {
        loadUnloadType: loadUnloadType,
        vendorCode: vendorCode.toString(),
        typeModule: this.docketService.loginUserList.Type === "2" ? "P" : "D",
        chargeType: chargeType || '',
        brdc: this.docketService.loginUserList.LocationCode,
        loadingBy: firstRowVendorType,
      };

      this.THCMasterService.getLoadingCharge(data).subscribe({
        next: (response: any) => {
          if (response) {
            let rateType = null;
            let rate = 0;
            if (response.isMonthly) {
              rateType = response.rateType;
              rate = response.rate;
            } else if (response.rate !== undefined && response.rate > 0) {
              rateType = response.rateType;
              rate = response.rate;
            }

            if (headerFormGroup) {
              headerFormGroup.patchValue({ [headerRateTypeControlName]: rateType });
            }

            formArray.controls.forEach((group: any) => {
              const patchObj: any = {};
              patchObj[rateTypeControlName] = rateType;
              patchObj[rateControlName] = rate;
              if (rateControlName === 'newRate') patchObj['NewRate'] = rate; // to handle case difference
              if (rateTypeControlName === 'ratetype') patchObj['rateType'] = rateType; // to handle case difference
              group.patchValue(patchObj);
            });
          }
        },
        error: (err) => {
          console.error('Error fetching loading charge:', err);
        }
      });
    }
  }

  handleHeaderRateTypeChange(rateTypeCode: string | number | undefined, formArray: FormArray, rateTypeControlName: string = 'ratetype', vendorTypeControlName: string = 'luVendorTyp') {
    formArray.controls.forEach((ctrl: any) => {
      const vendorTyp = ctrl.value[vendorTypeControlName];
      if (vendorTyp !== 'XX5' && vendorTyp !== 'XX9') {
        ctrl.patchValue({ [rateTypeControlName]: rateTypeCode });
      }
    });
  }

  handleRowVendorTypeChange(
    codeId: string | number | undefined,
    index: number,
    formArray: FormArray,
    rowVendorLists: any[][],
    vendorTypeControlName: string = 'luVendorTyp',
    vendorCodeControlName: string = 'luVendorCode',
    rateTypeControlName: string = 'ratetype',
    rateControlName: string = 'newRate',
    type?: string
  ) {
    const group = formArray.at(index);
    if (!codeId) {
      group.patchValue({ [vendorCodeControlName]: null });
      rowVendorLists[index] = [];
      return;
    }

    const strCodeId = codeId.toString();
    group.patchValue({ [vendorCodeControlName]: null });

    if (strCodeId === 'XX5' || strCodeId === 'XX9') {
      group.patchValue({
        [rateTypeControlName]: null,
        [rateControlName]: 0,
        rateType: null,
        NewRate: 0
      });
    }

    this.fetchVendorListFor(strCodeId, (list: any[]) => {
      rowVendorLists[index] = list;
    }, type);
  }

  handleRowVendorCodeChange(
    vendorCode: string | number | undefined,
    index: number,
    formArray: FormArray,
    loadUnloadType: string,
    chargeType: string | undefined | null,
    rateTypeControlName: string = 'ratetype',
    rateControlName: string = 'newRate',
    vendorTypeControlName: string = 'luVendorTyp',
    vendorCodeControlName: string = 'luVendorCode'
  ) {
    const group = formArray.at(index);
    if (!vendorCode) return;

    if (group.value[vendorTypeControlName] === 'XX5' || group.value[vendorTypeControlName] === 'XX9') {
      const data = {
        loadUnloadType: loadUnloadType,
        vendorCode: vendorCode.toString(),
        typeModule: this.docketService.loginUserList.Type === "2" ? "P" : "D",
        chargeType: chargeType || '',
        brdc: this.docketService.loginUserList.LocationCode,
        loadingBy: group.value[vendorTypeControlName],
      };

      this.THCMasterService.getLoadingCharge(data).subscribe({
        next: (response: any) => {
          if (response) {
            if (response.isMonthly) {
              group.patchValue({
                [rateTypeControlName]: response.rateType,
                [rateControlName]: response.rate
              });
            } else if (response.rate !== undefined && response.rate > 0) {
              group.patchValue({
                [rateTypeControlName]: response.rateType,
                [rateControlName]: response.rate
              });
            }
          }
        },
        error: (err) => {
          console.error('Error fetching loading charge:', err);
        }
      });
    }
  }
}
