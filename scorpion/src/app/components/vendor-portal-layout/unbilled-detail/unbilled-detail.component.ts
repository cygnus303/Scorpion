import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-unbilled-detail',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './unbilled-detail.component.html',
  styleUrl: './unbilled-detail.component.scss'
})
export class UnbilledDetailComponent implements OnInit {
    private listSubscription?: Subscription;
    public source:string| undefined;
    public documentDetail:any;

    public selectedMonth: string = '0';
    public selectedYear: string = '2024';
    public selectedPreference: string = '1';
    
    public billingPeriods: any[] = [];
    public selectedPeriod: string | null = null;
  

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
    this.generateBillingPeriods();
  }

  generateBillingPeriods() {
    this.billingPeriods = [];
    this.selectedPeriod = null;

    const year = parseInt(this.selectedYear, 10);
    const month = parseInt(this.selectedMonth, 10);
    
    if (isNaN(year) || isNaN(month) || !this.selectedPreference) return;

    const lastDay = new Date(year, month + 1, 0).getDate();
    const format = (d: number, m: number, y: number) => {
      const dd = d < 10 ? '0' + d : d;
      const mm = (m + 1) < 10 ? '0' + (m + 1) : (m + 1);
      return `${dd}/${mm}/${y}`;
    };

    const formatPayload = (d: number, m: number, y: number) => {
      const datePipe = new DatePipe('en-US');
      return datePipe.transform(new Date(y, m, d), 'dd MMM yyyy') || '';
    };

    if (this.selectedPreference === '1') {
      this.billingPeriods.push({ label: `${format(1, month, year)} to ${format(8, month, year)}`, value: 'week1', fromDateStr: formatPayload(1, month, year), toDateStr: formatPayload(8, month, year) });
      this.billingPeriods.push({ label: `${format(9, month, year)} to ${format(16, month, year)}`, value: 'week2', fromDateStr: formatPayload(9, month, year), toDateStr: formatPayload(16, month, year) });
      this.billingPeriods.push({ label: `${format(17, month, year)} to ${format(24, month, year)}`, value: 'week3', fromDateStr: formatPayload(17, month, year), toDateStr: formatPayload(24, month, year) });
      this.billingPeriods.push({ label: `${format(25, month, year)} to ${format(lastDay, month, year)}`, value: 'week4', fromDateStr: formatPayload(25, month, year), toDateStr: formatPayload(lastDay, month, year) });
    } else if (this.selectedPreference === '2') {
      this.billingPeriods.push({ label: `${format(1, month, year)} to ${format(14, month, year)}`, value: 'fortnight1', fromDateStr: formatPayload(1, month, year), toDateStr: formatPayload(14, month, year) });
      this.billingPeriods.push({ label: `${format(15, month, year)} to ${format(lastDay, month, year)}`, value: 'fortnight2', fromDateStr: formatPayload(15, month, year), toDateStr: formatPayload(lastDay, month, year) });
    } else if (this.selectedPreference === '3') {
      this.billingPeriods.push({ label: `${format(1, month, year)} to ${format(lastDay, month, year)}`, value: 'month1', fromDateStr: formatPayload(1, month, year), toDateStr: formatPayload(lastDay, month, year) });
    }

    if (this.billingPeriods.length > 0) {
      this.selectedPeriod = this.billingPeriods[0].value;
      this.onPeriodSelect();
    }
  }

  onPeriodSelect() {
    const selected = this.billingPeriods.find(p => p.value === this.selectedPeriod);
    if (selected) {
      this.onGetUnbilledData(selected.fromDateStr, selected.toDateStr);
    }
  }

  backToDashboard() {
    if (this.source === 'invoice-generation') {
      this.router.navigate(['/Vendor/invoice-generation']);
    } else {
      // Emit close event instead of routing back, to keep dashboard state
      this.close.emit();
    }
  }

  showPopup(type: string,source?:string) {
    this.type = type;
    this.source= source;
    console.log('Unbilled Detail Loaded:', type);
    this.generateBillingPeriods();
  }

   onGetUnbilledData(fromDateStr: string, toDateStr: string ) {
    if (this.listSubscription) {
      this.listSubscription.unsubscribe();
    }
    
    const payload = {
      "FilterJson": {
        "ReportId":"06",
        "UserName":"CYGNUSTEAM",
        "Vendor": '',
        "FromDt": fromDateStr,
        "ToDt": toDateStr,
        "Type": this.type
      }
    }

    this.listSubscription = this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (res: any) => {
        if (res && res.Table1 && res.Table1.length > 0) {
          this.documentDetail=res.Table1;
        } else {
          console.log('API Success, No Data:', res);
        }
      },
      error: (err: any) => {
        console.error('API Error:', err);
      }
    });
  }
}
