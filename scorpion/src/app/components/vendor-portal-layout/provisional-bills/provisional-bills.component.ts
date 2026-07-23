import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-provisional-bills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provisional-bills.component.html',
  styleUrl: './provisional-bills.component.scss'
})
export class ProvisionalBillsComponent implements OnInit {
  isSuccessPageVisible = false;
  source: string = 'dashboard';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['source']) {
        this.source = params['source'];
      }
    });
  }

  backToDashboard() {
    if (this.source === 'invoice-generation') {
      this.router.navigate(['/Vendor/invoice-generation']);
    } else {
      this.router.navigate(['/Vendor/dashboard']);
    }
  }

  submitBill() {
    this.isSuccessPageVisible = true;
  }

  backToProvisionalBillsTable() {
    this.isSuccessPageVisible = false;
  }
}
