import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgSelectModule } from "@ng-select/ng-select";
import { AddPfmPopupComponent } from './add-pfm-popup/add-pfm-popup.component';

@Component({
  selector: 'app-pfm-list',
  standalone: true,
  imports: [CommonModule, NgSelectModule, AddPfmPopupComponent],
  templateUrl: './pfm-list.component.html',
  styleUrl: './pfm-list.component.scss',
})
export class PFMListComponent {
   @ViewChild('AddPfmPopupComponent') AddPfmPopupComponent!: AddPfmPopupComponent;
  statusList = [
  { value: 'all', label: 'All Status', color: 'all', bg: 'var(--muted)', count: 12 },
  { value: 'pending', label: 'Pending', color: 'pending', bg: 'var(--orange)', count: 3 },
  { value: 'generated', label: 'Generated', color: 'generated', bg: 'var(--teal)', count: 3 },
  { value: 'forwarded', label: 'Forwarded', color: 'forwarded', bg: 'var(--accent-hover)', count: 3 },
  { value: 'acknowledged', label: 'Acknowledged', color: 'acknowledged', bg: 'var(--green)', count: 3 }
];

rows: any[] = [];
filteredRows: any[] = [];
statusMap: any = {
  pending: ['s-pending','● Pending'],
  generated: ['s-generated','◈ Generated'],
  forwarded: ['s-forwarded','↗ Forwarded'],
  acknowledged: ['s-ack','✓ Acknowledged']
};

ngOnInit() {
  this.rows = [
    { lrNo: 'LR001', origin: 'Surat', dest: 'Mumbai', billingParty: 'ABC', status: 'pending', lrDate: '2026-03-10' },
    { lrNo: 'LR002', origin: 'Rajkot', dest: 'Delhi', billingParty: 'XYZ', status: 'generated', lrDate: '2026-03-12' },
      { lrNo: 'LR003', origin: 'Rajkot', dest: 'Delhi', billingParty: 'XYZ', status: 'forwarded', lrDate: '2026-03-12' }
  ];

  this.filteredRows = [...this.rows];
}

getDays(row: any): number | string {
  if (!row.lrDate) return '—';

  const d1 = new Date(row.lrDate);
  const d2 = new Date();

  const diff = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

openAddPFM() {
   this.AddPfmPopupComponent.showPopup();
  }

}