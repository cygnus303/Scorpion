import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddCustomerComponent } from "./add-customer/add-customer.component";
import { BilingInformationComponent } from "./biling-information/biling-information.component";
import { KamDetailsComponent } from "./kam-details/kam-details.component";
import { GstDetailsComponent } from './gst-details/gst-details.component';
type Step = { id: number; label: string };
@Component({
  selector: 'app-customer-master-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AddCustomerComponent, BilingInformationComponent, KamDetailsComponent,GstDetailsComponent],
  templateUrl: './customer-master-layout.component.html',
  styleUrl: './customer-master-layout.component.scss'
})
export class CustomerMasterLayoutComponent {
 selectedTab: string = 'customer';
  selectTab(tab: string) {
    this.selectedTab = tab;
    this.updateActiveStepForTab(tab);
  }

    @Input() title = 'Customer Master';

  steps: Step[] = [
    { id: 1, label: 'Customer Master' },
    { id: 2, label: 'Customer Billing Information' },
    { id: 3, label: 'Customer wise KAM Details' },
    { id: 4, label: 'GST Details' },
    { id: 5, label: 'Settings' },
  ];

  /** 1-based active step */
  @Input() activeStep = 1;

  setActive(stepId: number) {
    this.activeStep = stepId;
  }

  isActive(stepId: number) {
    return this.activeStep === stepId;
  }

  updateActiveStepForTab(tab: string) {
    switch(tab) {
      case 'customer':
        this.activeStep = 1;
        this.title = 'Customer Master';
        break;
      case 'billingInformation':
        this.activeStep = 2;
        this.title = 'Customer Billing Information';
        break;
      case 'kamDetails':
        this.activeStep = 3;
        this.title = 'Customer wise KAM Details';
        break;
      case 'gstDetails':
        this.activeStep = 4;
        this.title = 'GST Details';
        break;
      case 'settings':
        this.activeStep = 5;
        this.title = 'Settings';
        break;
      default:
        this.activeStep = 1;
        this.title = 'Customer Master';
    }
  }
}
