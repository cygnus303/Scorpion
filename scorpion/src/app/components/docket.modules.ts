import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocketRoutes } from './docket.routes';
import { DocketListComponent } from './docket-list/docket-list.component';
import { BasicDetailsComponent } from './docket-list/basic-details/basic-details.component';
import { ConsignorDetailComponent } from './docket-list/consignor-detail/consignor-detail.component';
import { FreightDetailsComponent } from './docket-list/freight-details/freight-details.component';
import { InvoiceDetailsComponent } from './docket-list/invoice-details/invoice-details.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
    declarations: [
        DocketListComponent,
        BasicDetailsComponent,
        ConsignorDetailComponent,
        FreightDetailsComponent,
        InvoiceDetailsComponent
    ],
    imports: [
        RouterModule.forChild(DocketRoutes),
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        NgSelectModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocketModule { }
