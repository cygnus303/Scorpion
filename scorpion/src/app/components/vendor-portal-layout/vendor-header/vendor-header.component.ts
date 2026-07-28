import { Component, ViewChild, HostListener, ElementRef } from '@angular/core';
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
  
  constructor(private layoutService: VendorLayoutService, private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleVendorDrawer() {
    this.layoutService.toggleSidebar();
  }

  logout() {
    this.isUserMenuOpen = false;
    console.log('Logout clicked');
  }

  openProfile(){
    this.isUserMenuOpen = false;
    this.vendorProfileComponent.showPopup();
  }
}
