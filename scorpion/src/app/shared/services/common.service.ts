import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DocketService } from './docket.service';
import { CommonDateService } from './common-date.service';
import { THCMasterService } from 'app/shared/services/thc-master.service';
import { GeneralMasterService } from './general-master.service';
interface IRange {
  value: Date[];
  label: string;
}
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  loading = new BehaviorSubject(false);
  isLoading = this.loading.asObservable();
  activeNavigationUrl = new Subject<string>()
  activemenuRoleList = new BehaviorSubject<any>(null);
  minDate: Date | undefined;
  maxDate: Date | undefined;

  constructor(
    public docketService: DocketService,
    public commonDateService: CommonDateService, private THCMasterService: THCMasterService, public generalMasterService: GeneralMasterService,
  ) { }

  updateLoader(isLoading: boolean) {
    this.loading.next(isLoading);
  }

  ranges: IRange[] = [
    {
      value: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
      label: 'Last 7 Days',
    },
    {
      value: [new Date(), new Date()],
      label: 'Today',
    },
    {
      value: [
        new Date(new Date().setDate(new Date().getDate() - 1)),
        new Date(new Date().setDate(new Date().getDate() - 1)),
      ],
      label: 'Yesterday',
    },
    {
      value: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
      label: 'Last 30 Days',
    },
    {
      value: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(),
      ],
      label: 'This Month',
    },
    {
      value: [
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      ],
      label: 'Last Month',
    },
    {
      value: [
        new Date(new Date().getFullYear(), 0, 1), // First day of the year
        new Date(new Date().getFullYear(), 11, 31), // Last day of the year
      ],
      label: 'This Year',
    },
  ];

  dateAccess(moduleCode: string) {
    const payload = {
      moduleCode: moduleCode,
      baseUserName: this.docketService.baseUsername
    };

    this.commonDateService.userDateSelection(payload).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          const rule = res[0];

          // API min_Date
          this.minDate = new Date(rule.min_Date);

          // BackDate days logic
          if (rule.backDate_Days && rule.backDate_Days > 0) {
            const today = new Date();
            this.minDate = new Date(today.setDate(today.getDate() - rule.backDate_Days));
          }

          // Max date = today
          this.maxDate = new Date();
        }
      }
    });
  }

  getVendorType(documentType: string) {
    this.THCMasterService.getVendorType(this.docketService.loginUserList.LocationCode).subscribe({
      next: (response) => {
        if (response && response.data) {
          const mTypeRow = response.data.find((x: any) => x.documentType === documentType);//documentType = P,M,D
          if (mTypeRow) {
            const vendorTypes = mTypeRow.loading_VendorType.split(',');
            this.generalMasterService.getLoadingByDetail(vendorTypes);
          }
        }
      }
    });
  }

  formatDateToISO(dateVal: any): string | null {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    const year = d.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    const day = ('0' + d.getDate()).slice(-2);
    return `${day} ${month} ${year}`;
  }
}
