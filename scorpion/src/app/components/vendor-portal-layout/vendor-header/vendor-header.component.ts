import { Component, ViewChild, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorLayoutService } from '../vendor-layout.service';
import { VendorProfileComponent } from '../vendor-profile/vendor-profile.component';

@Component({
  selector: 'app-vendor-header',
  standalone: true,
  imports: [CommonModule,VendorProfileComponent],
  templateUrl: './vendor-header.component.html',
  styleUrl: './vendor-header.component.scss'
})
export class VendorHeaderComponent {
  isUserMenuOpen = false;
   @ViewChild(VendorProfileComponent) vendorProfileComponent!: VendorProfileComponent;
  

  constructor(private layoutService: VendorLayoutService) {}

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleVendorDrawer() {
    this.layoutService.toggleSidebar();
  }

  logout() {
    console.log('Logout clicked');
  }

  openProfile(){
    this.vendorProfileComponent.showPopup();

  }
}
