import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliveryRoutes } from './delivery-agent.routes';
import { DeliveryAgentListComponent } from './delivery-agent-list.component';
import { DeliveryAgentModalComponent } from './delivery-agent-modal/delivery-agent-modal.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [DeliveryAgentListComponent,DeliveryAgentModalComponent],
  imports: [
    CommonModule,
    BsDatepickerModule,
    RouterModule.forChild(DeliveryRoutes),
    FormsModule,
    ReactiveFormsModule
],
   exports: [ RouterModule ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryAgentModule { }
