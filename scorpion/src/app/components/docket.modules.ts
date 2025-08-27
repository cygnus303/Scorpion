import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocketRoutes } from './docket.routes';
import { DocketListComponent } from './docket-list/docket-list.component';
import { BasicDetailsComponent } from './docket-list/basic-details/basic-details.component';
import { ConsignorDetailComponent } from './docket-list/consignor-detail/consignor-detail.component';
import { FreightDetailsComponent } from './docket-list/freight-details/freight-details.component';
import { InvoiceDetailsComponent } from './docket-list/invoice-details/invoice-details.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { HeaderComponent } from '../layouts/header/header.component';
import { DocketService } from '../shared/services/docket.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@NgModule({
    declarations: [
        DocketListComponent,
        BasicDetailsComponent,
        ConsignorDetailComponent,
        FreightDetailsComponent,
        InvoiceDetailsComponent,
        HeaderComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(DocketRoutes),
        ReactiveFormsModule,
        FormsModule,
        NgSelectModule,
        BsDatepickerModule,
    ],
    providers: [DatePipe,DocketService],
    exports: [ RouterModule ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocketModule { }
