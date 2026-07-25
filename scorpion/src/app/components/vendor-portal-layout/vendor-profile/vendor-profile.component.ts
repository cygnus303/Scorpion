import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule],
  providers:[BsModalService],
  templateUrl: './vendor-profile.component.html',
  styleUrl: './vendor-profile.component.scss'
})
export class VendorProfileComponent {
  private listSubscription?: Subscription;
  
    public vendorProfile: any = null;
    public vendorContracts: any[] = [];
  

  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  public activeTab: string = 'profile';

  constructor(
    private modalService: BsModalService,
    private dynamicDataService: DynamicDataService
  ){}

  showPopup(){
    this.activeTab = 'profile';
    this.getUserProfileData();
    this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-lg modal-dialog-centered', backdrop: true });
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  getUserProfileData(type: string = '1') {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }

    const payload = {
      FilterJson: {
        "ReportId": "07",
        "UserName": "V08309",
      }
    };

    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        if (res) {
          if (res.Table1 && res.Table1.length > 0) {
            this.vendorProfile = res.Table1[0];
          }
          if (res.Table2) {
            this.vendorContracts = res.Table2;
          }
        }
      },
      error: (err: any) => {
        console.error('API Error:', err);
      }
    });
  }
}
