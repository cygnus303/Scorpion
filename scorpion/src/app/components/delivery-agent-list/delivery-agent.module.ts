import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliveryRoutes } from './delivery-agent.routes';
import { DeliveryAgentListComponent } from './delivery-agent-list.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { DeliveryAgentModalComponent } from './delivery-agent-modal/delivery-agent-modal.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DeliveryAgentViewComponent } from './delivery-agent-view/delivery-agent-view.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [DeliveryAgentListComponent,DeliveryAgentModalComponent,DeliveryAgentViewComponent],
  imports: [
    CommonModule,
    BsDatepickerModule,
    RouterModule.forChild(DeliveryRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule
],
   exports: [ RouterModule ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryAgentModule { }
