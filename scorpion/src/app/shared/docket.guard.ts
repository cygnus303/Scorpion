import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { DocketService } from 'app/shared/services/docket.service';
import { DecryptService } from './services/decryptservice ';

@Injectable({ providedIn: 'root' })
export class DocketGuard implements CanActivate {

  constructor(
    private decryptService: DecryptService,
    private docketService: DocketService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const encrypted = route.queryParams['data'];
    const key = 'WebX';

    if (!encrypted) {
      this.router.navigate(['/error']);
      return false;
    }

    try {
      const decrypted = this.decryptService.decrypt(encrypted, key);
      const parsedData = JSON.parse(decrypted);

      const currentRoute = route.routeConfig?.path ?? '';
      if (currentRoute.includes("docketFinancialEdit")) {
        return this.handleFinancialEdit(parsedData);
      } 
      // else if (currentRoute.includes("ChallanList")) {
      //   return this.handleChallan(parsedData);
      // } 
      else if (currentRoute.includes("UpdateDRS")) {
        return this.handleUpdateDRS(parsedData);
      } 
      else if (currentRoute.includes("LoadingSheet")) {
        return this.handleLoadingSheet(parsedData);
      } 
       else if (currentRoute.includes("Challan") || currentRoute.includes("ChallanList")) {
        return this.handleChallanfilter(parsedData);
      } 
      else if (currentRoute.includes("docketEditCretria") || currentRoute.includes("docket") || currentRoute.includes("delivery-agent")) {
        return this.handleNormalDocket(parsedData);
      } 
      else {
        this.router.navigate(['/error']);
        return false;
      }
    } catch (err) {
      console.error("Decryption/Parsing failed", err);
      this.router.navigate(['/error']);
      return false;
    }
  }

  private handleNormalDocket(parsedData: any): boolean {
    const requiredKeys = [
      "FinYear", "LocationCode", "LocationName",
      "UserImage", "UserId", "BaseUserName", "Companycode"
    ];
    if (requiredKeys.every(key => parsedData.hasOwnProperty(key))) {
      // this.docketService.loginUserList = parsedData;
      this.docketService.Location = parsedData.LocationCode;
      this.docketService.BaseUserCode = parsedData.UserId;
      this.docketService.baseUsername = parsedData.BaseUserName;
      localStorage.setItem("loginUserList", JSON.stringify(parsedData));
      console.log("👉 Normal docket / EditCretria flow loaded");
      return true;
    }
    this.router.navigate(['/error']);
    return false;
  }

  private handleFinancialEdit(parsedData: any): boolean {
    const requiredKeys = [
      "FinYear", "LocationCode", "LocationName",
      "UserImage", "UserId", "BaseUserName", "Companycode",
      "DocketNo","IsFromBillGeneration","Type"
    ];
    if (requiredKeys.every(key => parsedData.hasOwnProperty(key))) {
      // this.docketService.loginUserList = parsedData;
      this.docketService.Location = parsedData.LocationCode;
      this.docketService.BaseUserCode = parsedData.UserId;
      this.docketService.baseUsername = parsedData.BaseUserName;
      localStorage.setItem("loginUserList", JSON.stringify(parsedData));
      this.docketService.isComplition = true;
      // 👇 parsedData save so component can later call getCompletionData
      return true;
    }
    this.router.navigate(['/error']);
    return false;
  }

    private handleChallan(parsedData: any): boolean {
      const requiredKeys = [
        "fromdt","todt", "dttyp","paybas", "trnMod", "bustyp", "docketList", "loadingBy","chrgType", "odaType",
        "flag","LocationCode","BookedByType","BookedBy"
      ];
    if (requiredKeys.every(key => parsedData.hasOwnProperty(key))) {
      // this.docketService.loginUserList = parsedData;
      this.docketService.Location = parsedData.LocationCode;
      this.docketService.BaseUserCode = parsedData.UserId;
      this.docketService.baseUsername = parsedData.BaseUserName;
      localStorage.setItem("loginUserList", JSON.stringify(parsedData));
      this.docketService.isComplition = true;
      // 👇 parsedData save so component can later call getCompletionData
      return true;
    }
    this.router.navigate(['/error']);
    return false;
  }

      private handleChallanfilter(parsedData: any): boolean {
      const requiredKeys = [
        "FinYear", "LocationCode", "LocationName",
      "UserImage", "UserId", "BaseUserName", "Companycode"
      ];
    if (requiredKeys.every(key => parsedData.hasOwnProperty(key))) {
      // this.docketService.loginUserList = parsedData;
      this.docketService.Location = parsedData.LocationCode;
      this.docketService.BaseUserCode = parsedData.UserId;
      this.docketService.baseUsername = parsedData.BaseUserName;
      localStorage.setItem("loginUserList", JSON.stringify(parsedData));
      this.docketService.isComplition = true;
      // 👇 parsedData save so component can later call getCompletionData
      return true;
    }
    this.router.navigate(['/error']);
    return false;
  }

    private handleLoadingSheet(parsedData: any): boolean {
    const requiredKeys = [
      "FinYear", "LocationCode", "LocationName",
      "UserImage", "UserId", "BaseUserName", "Companycode" , "Type"
    ];
    if (requiredKeys.every(key => parsedData.hasOwnProperty(key))) {
      // this.docketService.loginUserList = parsedData;
      this.docketService.Location = parsedData.LocationCode;
      this.docketService.BaseUserCode = parsedData.UserId;
      this.docketService.baseUsername = parsedData.BaseUserName;
      localStorage.setItem("loginUserList", JSON.stringify(parsedData));
      this.docketService.isComplition = true;
      // 👇 parsedData save so component can later call getCompletionData
      return true;
    }
    this.router.navigate(['/error']);
    return false;
  }

    private handleUpdateDRS(parsedData: any): boolean {
    const requiredKeys = [
      "FinYear", "LocationCode", "LocationName",
      "UserImage", "UserId", "BaseUserName", "Companycode","loadBy" ,"chargeType","drsId"
    ];
    if (requiredKeys.every(key => parsedData.hasOwnProperty(key))) {
      // this.docketService.loginUserList = parsedData;
      this.docketService.Location = parsedData.LocationCode;
      this.docketService.BaseUserCode = parsedData.UserId;
      this.docketService.baseUsername = parsedData.BaseUserName;
      localStorage.setItem("loginUserList", JSON.stringify(parsedData));
      this.docketService.isComplition = true;
      // 👇 parsedData save so component can later call getCompletionData
      return true;
    }
    this.router.navigate(['/error']);
    return false;
  }

}  

