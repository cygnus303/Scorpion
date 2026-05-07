import { Component, ViewChild } from '@angular/core';
import { DeliveryAgentModalComponent } from './delivery-agent-modal/delivery-agent-modal.component';
import { DeliveryAgentViewComponent } from './delivery-agent-view/delivery-agent-view.component';
import { DeliveryAgentService } from 'app/shared/services/delivery-agent.service';
import { DeliveryAgentByCodeResponse, DeliveryAgentsListRepsonse } from 'app/shared/models/delivery-agent.model';
import { finalize } from 'rxjs';
import saveAs from 'file-saver';
import lottie from 'lottie-web';
import { defineElement } from 'lord-icon-element';
import { CommonService } from 'app/shared/services/common.service';
import { Modal } from 'bootstrap';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-delivery-agent-list',
  standalone: false,
  templateUrl: './delivery-agent-list.component.html',
  styleUrl: './delivery-agent-list.component.scss'
})
export class DeliveryAgentListComponent {
  public totalItems!: number;
  public pageNumber: number = 1;
  public pageSize: number = 15;
  public deliveryAgentsList: DeliveryAgentsListRepsonse[] = []
  public deliveryAgentByCodeList!: DeliveryAgentByCodeResponse;
  public loading: boolean = false;
  public selectedDeliveryAgent: string = '';
  public generatedPassword: string = '';
  modalInstance!: Modal;
  public filters: { [key: string]: string } = {}; // Dynamic filter object
  @ViewChild('deliveryAgentPopup') deliveryAgentPopup!: DeliveryAgentModalComponent;
  @ViewChild('deliveryAgentViewPopup') deliveryAgentViewPopup!: DeliveryAgentViewComponent;

  constructor(
    private deliveryAgentService: DeliveryAgentService,
    private commonService: CommonService,
    public docketService: DocketService,
    public sweetAlertService: SweetAlertService
  ) {
    defineElement(lottie.loadAnimation);
  }

  ngOnInit() {
    const saved = localStorage.getItem("loginUserList");
    if (saved) {
      this.docketService.loginUserList = JSON.parse(saved);
      this.docketService.Location = this.docketService.loginUserList.LocationCode;
      // this.docketService.Location = 'KOL';
      this.docketService.isComplition = false;
      this.docketService.BaseUserCode = this.docketService.loginUserList.UserId;
      this.docketService.baseUsername = this.docketService.loginUserList.BaseUserName;
    }
    this.commonService.loading.subscribe((state: boolean) => {
      this.loading = state;
    });
    this.getDeliveryAgentList();
  }

  getDeliveryAgentList(pageNumber: number = 1, pageSize: number = this.pageSize) {
    this.filters = Object.fromEntries(
      Object.entries(this.filters).filter(([key, value]) => value !== null)
    );
    const data = {
      ...this.filters,
      PageNumber: pageNumber,
      PageSize: pageSize,
      LocCode: this.docketService.loginUserList.LocationCode
    }
    this.commonService.updateLoader(true);
    this.deliveryAgentService.getDeliveryAgent(data).subscribe({
      next: (response) => {
        if (response) {
          this.deliveryAgentsList = response.data;
          this.totalItems = response.totalRecords;
          this.commonService.updateLoader(false);
        }
      },
    })
  }

  getDeliveryAgentByCodeList(code: string, callback?: (data: any) => void) {
    this.deliveryAgentService.getDeliveryAgentByCodeList(code).pipe(finalize(() => {
      if (callback) { callback(this.deliveryAgentByCodeList); }
    })).subscribe({
      next: (response) => {
        if (response) {
          this.deliveryAgentByCodeList = response.data;
        }
      },
      error: (err) => {
        this.deliveryAgentByCodeList = {} as any; // fallback empty object
      }
    });
  }

  deliveryAgentExport() {
    this.deliveryAgentService.deliveryAgentExport().subscribe({
      next: (blob: Blob) => {
        saveAs(blob, 'DA_Master.xlsx');
      },
      error: (err) => console.error('Excel export failed', err)
    });
  }

  openDeliveryAgentsPopup(code?: any) {
    if (code) {
      this.getDeliveryAgentByCodeList(code, (item) => {
        this.deliveryAgentPopup.showPopup(item);
      });
    } else {
      this.deliveryAgentPopup.showPopup();
    }
  }

  opendeliveryAgentViewPopup(code?: any) {
    if (code) {
      this.getDeliveryAgentByCodeList(code, (item) => {
        this.deliveryAgentViewPopup.showPopup(item)
      });
    }
  }

  closePopup() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  generateRandomPassword(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars.charAt(randomIndex);
    }
    return password;
  }

  openResetPasswordPopup(event: Event, code?: any) {
    event.preventDefault(); // Prevent default anchor behavior
    this.selectedDeliveryAgent = code || '';
    this.generatedPassword = this.generateRandomPassword(6);

    const modalElement = document.getElementById('showPasswordModal');
    if (modalElement) {
      this.modalInstance = new Modal(modalElement); // 👈 store instance
      this.modalInstance.show();
    }
  }

  onSubmitPassword() {
    const payload = {
      id: this.selectedDeliveryAgent,
      newPassword: this.generatedPassword,
      type: 1
    }
    this.deliveryAgentService.onResetPassword(payload).subscribe({
      next: (response: any) => {
        if (response === true) {
          this.sweetAlertService.success('Password reset successfully!!');
          this.closePopup();
        }
      },
    })

  }

  onshowPassword(code: any) {
    this.deliveryAgentService.showDAPassword(code).subscribe({
      next: (response: any) => {
        if (response) {
          this.sweetAlertService.info(` Password for <b>${code}</b> is:
  <br><br>
  <span style="font-size:900px; font-weight:bold; color:green;">
    ${response}
  </span>`);
        }
      },
    })
  }
}
