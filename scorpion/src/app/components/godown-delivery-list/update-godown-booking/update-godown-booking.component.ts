import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';

@Component({
  selector: 'app-update-godown-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-godown-booking.component.html',
  styleUrl: './update-godown-booking.component.scss'
})
export class UpdateGodownBookingComponent implements OnInit, OnDestroy {
  @Output() bookingUpdated = new EventEmitter<any>();

  public showModal: boolean = false;
  public selectedDockets: any[] = [];
  public remarks: string = '';
  public isSubmitting: boolean = false;

  constructor(
    public docketService: DocketService,
    public sweetAlertService: SweetAlertService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  showPopup(dockets: any[]) {
    this.selectedDockets = JSON.parse(JSON.stringify(dockets || []));
    this.remarks = '';
    this.isSubmitting = false;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    document.body.style.overflow = '';
  }

  get bookingBranch(): string {
    return this.docketService.loginUserList?.LocationCode || this.docketService.Location || 'PIM';
  }

  get finYear(): string {
    const fy = String(this.docketService.loginUserList?.FinYear || this.docketService.FinYear || '2627');
    if (fy.includes('-')) {
      const parts = fy.split('-');
      if (parts.length === 2) {
        return parts[0].slice(-2) + parts[1].slice(-2);
      }
    }
    return fy;
  }

  get deliveryType(): string {
    if (this.selectedDockets.length === 0) return 'Godown-Door';
    return this.selectedDockets[0].PkpDelType || 'Godown-Door';
  }

  get previewGbNo(): string {
    const nextSeq = '000014';
    return `GHB/${this.bookingBranch}/${this.finYear}/${nextSeq} (on submit)`;
  }

  get bookingDateFormatted(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }

  get totalPkgs(): number {
    return this.selectedDockets.reduce((sum, row) => {
      const p = Number(row.Pkgs !== undefined ? row.Pkgs : (row.pkgsno || 0));
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
  }

  get totalWt(): number {
    return this.selectedDockets.reduce((sum, row) => {
      const w = Number(row.ActualWt !== undefined ? row.ActualWt : (row.actuwt !== undefined ? row.actuwt : (row.weight || 0)));
      return sum + (isNaN(w) ? 0 : w);
    }, 0);
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  submitGodownBooking() {
    if (this.selectedDockets.length === 0) return;

    this.isSubmitting = true;
    const gbSeq = String(Math.floor(100000 + Math.random() * 900000));
    const generatedGBNo = `GHB/${this.bookingBranch}/${this.finYear}/${gbSeq}`;

    const payload = {
      GBNo: generatedGBNo,
      BookingDate: new Date().toISOString(),
      BookingBranch: this.bookingBranch,
      Remarks: this.remarks || '',
      Dockets: this.selectedDockets.map(row => ({
        dockno: row.LRNumber || row.dockno,
        pkgs: row.Pkgs || row.pkgsno || 0,
        weight: row.ActualWt || row.actuwt || row.weight || 0,
        org: row.OrgCode || row.orgncd,
        dest: row.DestCode || row.destcd,
        reassignedLocation: row.ReassignedLocation || row.DestCode || ''
      }))
    };

    // Update local dockets with the new GBNo so parent grid reflects instantly
    this.selectedDockets.forEach(d => {
      d.GBNo = generatedGBNo;
      d.gbNo = generatedGBNo;
    });

    this.sweetAlertService.success(`
      <div style="text-align:center;">
        <div class="fw-bold fs-3 mb-2" style="color: #2e7d32;">Godown Booking Updated</div>
        <p class="fs-5 mb-1"><strong>GB No:</strong> ${generatedGBNo}</p>
        <p class="text-muted" style="font-size: 12px; margin-top: 6px;">GB HCC (Unloading) is now enabled for ${this.selectedDockets.length} docket(s).</p>
      </div>
    `);

    this.bookingUpdated.emit({
      gbNo: generatedGBNo,
      payload,
      selectedDockets: this.selectedDockets
    });

    this.isSubmitting = false;
    this.closeModal();
  }
}
