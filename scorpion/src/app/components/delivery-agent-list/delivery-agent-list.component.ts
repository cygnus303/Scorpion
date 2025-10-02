import { Component, ViewChild } from '@angular/core';
import { DeliveryAgentModalComponent } from './delivery-agent-modal/delivery-agent-modal.component';
import { DeliveryAgentViewComponent } from './delivery-agent-view/delivery-agent-view.component';

@Component({
  selector: 'app-delivery-agent-list',
  standalone: false,
  templateUrl: './delivery-agent-list.component.html',
  styleUrl: './delivery-agent-list.component.scss'
})
export class DeliveryAgentListComponent {
  @ViewChild('deliveryAgentPopup') deliveryAgentPopup!: DeliveryAgentModalComponent;
  @ViewChild('deliveryAgentViewPopup') deliveryAgentViewPopup!: DeliveryAgentViewComponent;
  deliveryAgentsList = [
  {
    id: 1,
    agentCode: "D0001",
    agentName: "GOPAL SINGH",
    branch: "MHP",
    vehicleInfo: "V0723: Madhukar Sonawane",
    status: true,   // active / inactive
  },
  {
    id: 2,
    agentCode: "D0002",
    agentName: "GOPAL SINGH",
    branch: "MHP",
    vehicleInfo: "V0723: Madhukar Sonawane",
    status: true,
  },
  {
    id: 3,
    agentCode: "D0003",
    agentName: "GOPAL SINGH",
    branch: "MHP",
    vehicleInfo: "V0723: Madhukar Sonawane",
    status: false,
  },
  {
    id: 4,
    agentCode: "D0004",
    agentName: "GOPAL SINGH",
    branch: "MHP",
    vehicleInfo: "V0723: Madhukar Sonawane",
    status: true,
  },
  {
    id: 5,
    agentCode: "D0005",
    agentName: "GOPAL SINGH",
    branch: "MHP",
    vehicleInfo: "V0723: Madhukar Sonawane",
    status: false,
  }
];

  openDeliveryAgentsPopup(item?:any){
     this.deliveryAgentPopup.showPopup(item)
  }
   opendeliveryAgentViewPopup(item:any){
     this.deliveryAgentViewPopup.showPopup(item)
  }
}
