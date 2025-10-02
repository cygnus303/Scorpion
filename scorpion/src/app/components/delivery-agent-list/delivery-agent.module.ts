import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliveryRoutes } from './delivery-agent.routes';
import { DeliveryAgentListComponent } from './delivery-agent-list.component';
import { DeliveryAgentModalComponent } from './delivery-agent-modal/delivery-agent-modal.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DeliveryAgentViewComponent } from './delivery-agent-view/delivery-agent-view.component';

@NgModule({
  declarations: [DeliveryAgentListComponent,DeliveryAgentModalComponent,DeliveryAgentViewComponent],
  imports: [
    CommonModule,
    BsDatepickerModule,
    RouterModule.forChild(DeliveryRoutes)
  ],
   exports: [ RouterModule ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryAgentModule { }
