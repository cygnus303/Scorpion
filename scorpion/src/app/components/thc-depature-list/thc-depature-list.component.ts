import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-thc-depature-list',
  standalone: true,
  imports: [NgSelectModule,CommonModule,BsDatepickerModule,FormsModule,PaginationComponent],
  templateUrl: './thc-depature-list.component.html',
  styleUrl: './thc-depature-list.component.scss'
})
export class ThcDepatureListComponent {
  public isCSVLoading : boolean=false;
  public isLoading : boolean =false;
  public summaryData:any;
  // public thcData: any[] = [];
    public statusList = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending for departure', value: 'pendingforQuickCompletion' },
    { label: 'Departed', value: 'booking' },
  ];
  public modeList=[
     { label: 'All', value: 'All' },
    { label: 'Road', value: 'Road' },
    { label: 'Air', value: 'Air' },
    { label: 'Rail', value: 'Rail' },

  ]
  public thcData = [
  { id:1, thcNo:'VH/BWH/2627/001001', thcDate:'01 Jul 2026', branch:'Mumbai HO',    mode:'Road', service:'PTL',     route:'Mumbai → Pune → Nashik',                 arrival:'03 Jul 2026', status:'Departed',              departedBy:'Rajan Mehta',       departedDate:'03 Jul 2026', vendor:'ATTACHED',  vendorName:'V0729:MAHALINGA GAUDA',  vehicle:'MH43U8868', driver:'RAHUL',    license:'6802',    mobile:'9648505720', fleet:'19 FEET', engine:'E483CDBB522428', chassis:'MC233HRCOBB050477', cewb:'8395307326', cap:'74.00%', fleetCap:'7.00 MT', contract:'2,250.00', advance:'0.00', total:'2,250.00', balance:'2,250', advLoc:'BWH', balLoc:'BWH', hops:['Mumbai','Pune','Nashik'] },
  { id:2, thcNo:'VH/DEL/2627/004002', thcDate:'02 Jul 2026', branch:'Delhi HO',     mode:'Road', service:'FTL',     route:'Delhi → Agra → Lucknow',                 arrival:'05 Jul 2026', status:'Pending for Departure', departedBy:'',                 departedDate:'',            vendor:'OWN',       vendorName:'V0102:SCORPION FLEET',   vehicle:'DL09CF2233',driver:'VIKRAM',  license:'4421',    mobile:'9910234567', fleet:'32 FEET', engine:'F921AABB334455', chassis:'MC444HRCOBC123456', cewb:'7234512341', cap:'88.00%', fleetCap:'10.00 MT',contract:'3,500.00', advance:'500.00',total:'3,500.00', balance:'3,000', advLoc:'DEL', balLoc:'LKO', hops:['Delhi','Agra','Lucknow'] },
  { id:3, thcNo:'VH/CHN/2627/007003', thcDate:'02 Jul 2026', branch:'Chennai HO',   mode:'Air',  service:'Express', route:'Chennai → Hyderabad → Bangalore',         arrival:'04 Jul 2026', status:'Departed',              departedBy:'Anita Sharma',     departedDate:'04 Jul 2026', vendor:'ATTACHED',  vendorName:'V0441:AIR LINK EXPRESS', vehicle:'N/A (AIR)', driver:'N/A',     license:'N/A',     mobile:'9840112233', fleet:'AIR CARGO',engine:'—',             chassis:'—',                 cewb:'AIR-8812',   cap:'65.00%', fleetCap:'2.00 MT', contract:'8,200.00', advance:'2,000.00',total:'8,200.00', balance:'6,200', advLoc:'CHN', balLoc:'BLR', hops:['Chennai','Hyderabad','Bangalore'] },
  { id:4, thcNo:'VH/PUN/2627/009004', thcDate:'03 Jul 2026', branch:'Pune HO',      mode:'Road', service:'PTL',     route:'Pune → Nashik → Aurangabad',              arrival:'06 Jul 2026', status:'Pending for Departure', departedBy:'',                 departedDate:'',            vendor:'OWN',       vendorName:'V0205:SCORPION FLEET',   vehicle:'MH12AB9876',driver:'SURESH',  license:'5503',    mobile:'9823456789', fleet:'20 FEET', engine:'G112CCDD556677', chassis:'MC555HRCOBD234567', cewb:'6123423451', cap:'70.00%', fleetCap:'7.00 MT', contract:'1,800.00', advance:'0.00', total:'1,800.00', balance:'1,800', advLoc:'PUN', balLoc:'AUR', hops:['Pune','Nashik','Aurangabad'] },
  { id:5, thcNo:'VH/HYD/2627/012005', thcDate:'04 Jul 2026', branch:'Hyderabad HO', mode:'Road', service:'FTL',     route:'Hyderabad → Vijayawada → Visakhapatnam', arrival:'07 Jul 2026', status:'Pending for Departure', departedBy:'',                 departedDate:'',            vendor:'ATTACHED',  vendorName:'V0318:SOUTH STAR CARGO', vehicle:'TS09GH7744',driver:'RAVI',    license:'7712',    mobile:'9912345678', fleet:'24 FEET', engine:'H333EEFF778899', chassis:'MC666HRCOBC345678', cewb:'5234534561', cap:'95.00%', fleetCap:'9.00 MT', contract:'4,200.00', advance:'1,000.00',total:'4,200.00', balance:'3,200', advLoc:'HYD', balLoc:'VZG', hops:['Hyderabad','Vijayawada','Visakhapatnam'] },
  { id:6, thcNo:'VH/KOL/2627/015006', thcDate:'05 Jul 2026', branch:'Kolkata HO',   mode:'Rail', service:'PTL',     route:'Kolkata → Bhubaneswar → Visakhapatnam',  arrival:'08 Jul 2026', status:'Pending for Departure', departedBy:'',                 departedDate:'',            vendor:'ATTACHED',  vendorName:'V0522:EASTERN RAIL FRT', vehicle:'RAIL-WAGON', driver:'N/A',    license:'N/A',     mobile:'9830012345', fleet:'RAIL',    engine:'—',             chassis:'—',                 cewb:'RLY-2291',   cap:'82.00%', fleetCap:'15.00 MT',contract:'5,600.00', advance:'1,500.00',total:'5,600.00', balance:'4,100', advLoc:'KOL', balLoc:'VZG', hops:['Kolkata','Bhubaneswar','Visakhapatnam'] },
];
   public config = {
    fromDateStr: new Date(),
    toDateStr: new Date(),
    statusFilter: 'All',
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
    searchText: ''
  };

fetchData(){
  
}

onSearchChange(){

}

setPage(event:any){

}

  filterByStatus(status: string) {
    this.config.statusFilter = status;
    this.fetchData();
  }
}
