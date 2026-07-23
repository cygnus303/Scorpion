import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorLayoutService } from '../vendor-layout.service';

@Component({
  selector: 'app-vendor-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-header.component.html',
  styleUrl: './vendor-header.component.scss'
})
export class VendorHeaderComponent {
  isUserMenuOpen = false;

  constructor(private layoutService: VendorLayoutService) {}

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleVendorDrawer() {
    this.layoutService.toggleSidebar();
  }

  openModal(modalId: string) {
    console.log('Open modal:', modalId);
  }

  logout() {
    console.log('Logout clicked');
  }
}
