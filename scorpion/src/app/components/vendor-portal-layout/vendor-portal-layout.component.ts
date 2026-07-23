import { Component, ViewEncapsulation } from '@angular/core';

import { RouterModule } from '@angular/router';
import { VendorHeaderComponent } from './vendor-header/vendor-header.component';
import { VendorSidebarComponent } from './vendor-sidebar/vendor-sidebar.component';

@Component({
  selector: 'app-vendor-portal-layout',
  standalone: true,
  imports: [RouterModule, VendorHeaderComponent, VendorSidebarComponent],
  templateUrl: './vendor-portal-layout.component.html',
  styleUrl: './vendor-portal-layout.component.scss',
})
export class VendorPortalLayoutComponent {

}
