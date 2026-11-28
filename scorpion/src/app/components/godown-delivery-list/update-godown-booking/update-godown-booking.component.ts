import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocketService } from 'app/shared/services/docket.service';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { DynamicDataService } from 'app/shared/services/dynamic-data.service';

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
    public sweetAlertService: SweetAlertService,
    public dynamicDataService: DynamicDataService
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
    const docNoList = this.selectedDockets
      .map(row => (row.LRNumber || row.dockno || '').toString().trim())
      .filter(Boolean)
      .join(',');

    const payload = {
      FilterJson: {
        ReportId: '397',
        DocNo: docNoList,
        BRCD: this.docketService.loginUserList?.LocationCode,
        REMARKS: this.remarks || '',
        CompanyCode:this.docketService.loginUserList.Companycode,
        UserID:this.docketService.loginUserList?.UserId
      }
    };

    this.isSubmitting = true;

    this.dynamicDataService.getDynamicData(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.closeModal();
        this.sweetAlertService.success(`${response.Table1[0].GBNo}:${response.Table1[0].Msg}`);
        this.bookingUpdated.emit(response);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Error submitting Godown Booking:', err);
        const errMsg = err?.error?.message || err?.error?.Message || err?.message || 'Error occurred while updating Godown Booking.';
        this.sweetAlertService.error(errMsg);
      }
    });
  }
}
