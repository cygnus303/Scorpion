import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DocketService } from 'app/shared/services/docket.service';

@Component({
  selector: 'app-invoice-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-tracker.component.html',
  styleUrl: './invoice-tracker.component.scss'
})
export class InvoiceTrackerComponent {
  public billDetail: any;
  public voucherDetails: any[] = [];
  public debitnoteDetails: any[] = [];
  public supportingDocDetails: any[] = [];
  public PaymentDetails: any[] = [];
  public billNo: string = '';
  public activeTab: string = '1';
  public isBillNoInvalid: boolean = false;
  public isLoading: boolean = false;
  public hasSearched: boolean = false;
  private listSubscription?: Subscription;
  public env = environment;

  constructor(private dynamicDataService: DynamicDataService,
    private sweetAlertService: SweetAlertService,
    private docketService:DocketService
  ) { }

   ngOnInit() {
      const saved = localStorage.getItem("loginUserList");
      if (saved) {
        this.docketService.loginUserList = JSON.parse(saved);
        this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
      }
    }

  onGetInvoiceData(type: string = '1') {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    if (!this.billNo) {
      this.isBillNoInvalid = true;
      setTimeout(() => this.isBillNoInvalid = false, 600); // Remove animation class after it plays
      return;
    }

    this.isBillNoInvalid = false;
    this.activeTab = type;
    this.isLoading = true;
    this.hasSearched = true;

    if (type === '1') {
      this.voucherDetails = [];
      this.debitnoteDetails = [];
      this.supportingDocDetails = [];
      this.PaymentDetails = [];
    }

    const payload = {
      FilterJson: {
        "ReportId": "03",
        "UserName": this.docketService.loginUserList.BaseUserName,
        "BillNo": this.billNo,
        "Type": type
      }
    };

    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.Table1 && res.Table1.length > 0) {
          if (type === '1') {
            this.billDetail = res.Table1[0];
          } else if (type === '2') {
            this.voucherDetails = res.Table1;
          } else if (type === '3') {
            this.debitnoteDetails = res.Table1;
          } else if (type === '4') {
            this.supportingDocDetails = res.Table1;
          } else if (type === '5') {
            this.PaymentDetails = res.Table1;
          }
        } else {
          if (type === '1') this.billDetail = null;
          if (type === '2') this.voucherDetails = [];
          if (type === '3') this.debitnoteDetails = [];
          if (type === '4') this.supportingDocDetails = [];
          if (type === '5') this.PaymentDetails = [];
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.sweetAlertService.error(err.error?.Error?.Message || 'Failed to fetch data');
      }
    });
  }

  openViewPrint(Billurl: string) {
    const url = `${this.env.liveUrl}${Billurl}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );

    if (popup) {
      popup.location.href = url;
    }
  }

}
