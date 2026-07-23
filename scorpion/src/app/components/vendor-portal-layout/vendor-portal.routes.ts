import { Routes } from '@angular/router';
import { VendorPortalLayoutComponent } from './vendor-portal-layout.component';

export const VendorRoutes: Routes = [
    {
        path: '',
        component: VendorPortalLayoutComponent,
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./vendor-dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent),
            },
            {
                path: 'invoice-generation',
                loadComponent: () => import('./vendor-invoice-generation/vendor-invoice-generation.component').then(m => m.VendorInvoiceGenerationComponent),
            },
            {
                path: 'reports',
                loadComponent: () => import('./vendor-reports/vendor-reports.component').then(m => m.VendorReportsComponent),
            },
            {
                path: 'unbilled-detail',
                loadComponent: () => import('./unbilled-detail/unbilled-detail.component').then(m => m.UnbilledDetailComponent),
            },
            {
                path: 'provisional-bills',
                loadComponent: () => import('./provisional-bills/provisional-bills.component').then(m => m.ProvisionalBillsComponent),
            },
            {
                path: 'query-response',
                loadComponent: () => import('./query-response/query-response.component').then(m => m.QueryResponseComponent),
            },
            {
                path: 'payment-followup',
                loadComponent: () => import('./payment-followup/payment-followup.component').then(m => m.PaymentFollowupComponent),
            },
            {
                path: 'invoice-tracker',
                loadComponent: () => import('./invoice-tracker/invoice-tracker.component').then(m => m.InvoiceTrackerComponent),
            }
        ]
    }
];
