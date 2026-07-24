import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-unbilled-detail',
  standalone: true,
  imports: [CommonModule,NgSelectModule],
  templateUrl: './unbilled-detail.component.html',
  styleUrl: './unbilled-detail.component.scss'
})
export class UnbilledDetailComponent implements OnInit {
    private listSubscription?: Subscription;
    public source:string| undefined;
  

  type: string = 'THC';
  @Output() close = new EventEmitter<void>();
  public monthList=[
    {text:'January',value:'0'},
    {text:'February',value:'1'},
    {text:'March',value:'2'},
    {text:'April',value:'3'},
    {text:'May',value:'4'},
    {text:'June',value:'5'},
    {text:'July',value:'6'},
    {text:'August',value:'7'},
    {text:'September',value:'8'},
    {text:'October',value:'9'},
    {text:'November',value:'10'},
    {text:'December',value:'11'}
  ];

  public billingPreference=[
    {text:'Weekly',value:'1'},
    {text:'Fortnightly',value:'2'},
    {text:'Monthly',value:'3'},
  ]

  constructor(private router: Router, private route: ActivatedRoute,private dynamicDataService:DynamicDataService) { }

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
      // Emit close event instead of routing back, to keep dashboard state
      this.close.emit();
    }
  }

  showPopup(filterData: any, type: string,source?:string) {
    this.type = type;
    this.source= source;
    console.log('Unbilled Detail Loaded:', type, filterData);
    this.onGetUnbilledData(filterData,type)
  }

   onGetUnbilledData(filterData: any, type: string ) {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    
    const datePipe = new DatePipe('en-US');
    const formattedFromDt = filterData.fromDateStr ? datePipe.transform(filterData.fromDateStr, 'dd MMM yyyy') : '';
    const formattedToDt = filterData.toDateStr ? datePipe.transform(filterData.toDateStr, 'dd MMM yyyy') : '';

    const payload = {
      "FilterJson": {
        "ReportId":"06",
        "UserName":"CYGNUSTEAM",
        "Vendor":filterData.Vendor || '',
        "FromDt": formattedFromDt,
        "ToDt": formattedToDt,
        "Type":type
      }
    }

    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        if (res && res.Table1 && res.Table1.length > 0) {
          
        } else {
          
        }
      },
      error: (err: any) => {
      }
    });
  }
}
