import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule],
  providers:[BsModalService],
  templateUrl: './vendor-profile.component.html',
  styleUrl: './vendor-profile.component.scss'
})
export class VendorProfileComponent {

  public modalRef!: BsModalRef;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  public activeTab: string = 'profile';

  constructor(private modalService: BsModalService){}

  showPopup(){
    this.activeTab = 'profile';
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
}
