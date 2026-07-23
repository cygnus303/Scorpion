import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-unbilled-detail',
  standalone: true,
  imports: [],
  templateUrl: './unbilled-detail.component.html',
  styleUrl: './unbilled-detail.component.scss'
})
export class UnbilledDetailComponent implements OnInit {
  
  type: string = 'THC';
  source: string = 'dashboard';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.type = params['type'];
      }
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
}
