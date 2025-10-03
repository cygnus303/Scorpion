import { Component, ViewChild } from '@angular/core';
import { DeliveryAgentModalComponent } from './delivery-agent-modal/delivery-agent-modal.component';
import { DeliveryAgentViewComponent } from './delivery-agent-view/delivery-agent-view.component';
import { DeliveryAgentService } from 'app/shared/services/delivery-agent.service';

@Component({
  selector: 'app-delivery-agent-list',
  standalone: false,
  templateUrl: './delivery-agent-list.component.html',
  styleUrl: './delivery-agent-list.component.scss'
})
export class DeliveryAgentListComponent {
  @ViewChild('deliveryAgentPopup') deliveryAgentPopup!: DeliveryAgentModalComponent;
  @ViewChild('deliveryAgentViewPopup') deliveryAgentViewPopup!: DeliveryAgentViewComponent;
  public deliveryAgentsList:any[]=[]

  constructor(
    private deliveryAgentService:DeliveryAgentService
  ){}

  ngOnInit(){
    this.getDeliveryAgentList();
  }

getDeliveryAgentList(){
  this.deliveryAgentService.getDeliveryAgent().subscribe({
      next: (response) => {
          if (response) {
            this.deliveryAgentsList=response.data;
          }
        },
  })
}

  openDeliveryAgentsPopup(item?:any){
     this.deliveryAgentPopup.showPopup(item)
  }
   opendeliveryAgentViewPopup(item:any){
     this.deliveryAgentViewPopup.showPopup(item)
  }
}
