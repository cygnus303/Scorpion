import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-approval.component.html',
  styleUrl: './document-approval.component.scss'
})
export class DocumentApprovalComponent implements OnInit {
  daModuleFilter = 'All';
  daStatusFilter = 'Pending';
  
  daModules = [
    { id: 'PRS', name: 'PRS', countPending: 12, countApproved: 45 },
    { id: 'THC', name: 'THC', countPending: 5,  countApproved: 18 },
    { id: 'HCC', name: 'HCC', countPending: 3,  countApproved: 10 },
    { id: 'DRS', name: 'DRS', countPending: 8,  countApproved: 22 }
  ];

  daRecords = [
    { docNo: 'PRS/24-25/001', module: 'PRS', date: '12 Oct 2024', vendor: 'Market Vendor A', amt: '45,000', status: 'Pending' },
    { docNo: 'PRS/24-25/002', module: 'PRS', date: '13 Oct 2024', vendor: 'ABC Logistics', amt: '12,500', status: 'Pending' },
    { docNo: 'THC/24-25/089', module: 'THC', date: '14 Oct 2024', vendor: 'Highway Transporters', amt: '1,20,000', status: 'Pending' },
    { docNo: 'HCC/24-25/012', module: 'HCC', date: '14 Oct 2024', vendor: 'Safe Handling Co.', amt: '8,500', status: 'Pending' },
    { docNo: 'DRS/24-25/044', module: 'DRS', date: '15 Oct 2024', vendor: 'Local Delivery Hub', amt: '22,400', status: 'Pending' },
    { docNo: 'PRS/24-25/000', module: 'PRS', date: '10 Oct 2024', vendor: 'Market Vendor B', amt: '32,000', status: 'Approved' },
  ];

  activeModule = 'All';

  ngOnInit() {
  }

  getFilteredRecords() {
    return this.daRecords.filter(r => {
      const matchMod = this.daModuleFilter === 'All' || r.module === this.daModuleFilter;
      const matchStat = this.daStatusFilter === 'All' || r.status === this.daStatusFilter;
      const matchCard = this.activeModule === 'All' || r.module === this.activeModule;
      return matchMod && matchStat && matchCard;
    });
  }

  setActiveModule(modId: string) {
    this.activeModule = this.activeModule === modId ? 'All' : modId;
    this.daModuleFilter = this.activeModule;
  }

  approveRecord(record: any) {
    record.status = 'Approved';
  }

  rejectRecord(record: any) {
    record.status = 'Rejected';
  }

  approveAllPending() {
    this.getFilteredRecords()
      .filter(r => r.status === 'Pending')
      .forEach(r => r.status = 'Approved');
  }

  getPendingCount(modId: string = 'All') {
    if (modId === 'All') {
      return this.daRecords.filter(r => r.status === 'Pending').length;
    }
    return this.daRecords.filter(r => r.status === 'Pending' && r.module === modId).length;
  }
}
