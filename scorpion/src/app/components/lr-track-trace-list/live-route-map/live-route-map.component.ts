import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LrService } from 'app/shared/services/lr.service';

@Component({
  selector: 'app-live-route-map',
  standalone: true,
  imports: [CommonModule],
  providers: [BsModalService],
  templateUrl: './live-route-map.component.html',
  styleUrl: './live-route-map.component.scss'
})
export class LiveRouteMapComponent {
  public modalRef?: BsModalRef;
  @ViewChild('TemplateMapRef', { static: true }) TemplateMapRef!: TemplateRef<any>;
  @Output() viewLifecycle = new EventEmitter<any>();

  public lrData: any = null;
  public lrNumber: string = '';
  public origin: string = '';
  public destination: string = '';
  public currentLocation: string = '';
  public edd: string = '';

  public totalDistance: number | null = null;
  public distanceCovered: number | null = null;
  public remainingDistance: number | null = null;
  public progressPercent: number = 0;

  // Live GPS Telemetry Fields
  public isLoadingGps: boolean = false;
  public vehicleNo: string = '';
  public vehicleLat: number | null = null;
  public vehicleLong: number | null = null;
  public vehicleSpeed: string = '0.00';
  public vehicleIgnition: string = 'OFF';
  public reportingTime: string = '';
  public gpsAddress: string = '';

  constructor(
    private modalService: BsModalService,
    private lrService: LrService
  ) { }

  showPopup(lr: any) {
    debugger
    if (!lr) return;
    this.lrData = lr;
    this.lrNumber = lr.LrNumber;
    this.origin = lr.from_loc;
    this.destination = lr.to_loc;
    this.currentLocation = lr.OP_StockType;
    this.vehicleNo = lr.VehicleNo;
    this.edd = lr.EddDate;

    if (lr.totalDistance !== undefined && lr.totalDistance !== null && !isNaN(lr.totalDistance)) {
      this.totalDistance = Number(lr.totalDistance);
      this.distanceCovered = lr.distanceCovered !== undefined && lr.distanceCovered !== null ? Number(lr.distanceCovered) : 0;
      this.remainingDistance = Math.max(0, this.totalDistance - this.distanceCovered);
      this.progressPercent = this.totalDistance > 0 ? Math.min(100, Math.round((this.distanceCovered / this.totalDistance) * 100)) : 0;
    } else {
      this.totalDistance = null;
      this.distanceCovered = null;
      this.remainingDistance = null;
      this.progressPercent = 0;
    }

    // Fetch live vehicle GPS tracking data
    this.fetchGpsTracking(this.vehicleNo);

    this.modalRef = this.modalService.show(this.TemplateMapRef, {
      class: 'modal-xl modal-dialog-centered custom-live-map-modal',
      backdrop: true
    });
  }

  fetchGpsTracking(vehNo: string) {
    this.resetGpsData(vehNo);
    if (!vehNo) return;
    this.isLoadingGps = true;
    this.lrService.trackVehicleOnGoogleMap(vehNo).subscribe({
      next: (res: any) => {
        this.isLoadingGps = false;
        if (res && res.success && res.data) {
          const d = res.data;
          this.vehicleNo = d.vehno || vehNo;
          this.vehicleLat = d.vehicleLat !== undefined ? Number(d.vehicleLat) : null;
          this.vehicleLong = d.vehicleLong !== undefined ? Number(d.vehicleLong) : null;
          this.parseDescription(d.description || '');
          if (this.gpsAddress && this.gpsAddress !== 'N/A') {
            this.currentLocation = this.gpsAddress;
          }
        }
      },
      error: (err) => {
        this.isLoadingGps = false;
        console.error('Error fetching GPS tracking data:', err);
      }
    });
  }

  resetGpsData(vehNo?: string) {
    if (vehNo !== undefined) this.vehicleNo = vehNo;
    this.vehicleLat = null;
    this.vehicleLong = null;
    this.vehicleSpeed = '0.00';
    this.vehicleIgnition = 'N/A';
    this.reportingTime = '';
    this.gpsAddress = '';
  }

  parseDescription(desc: string) {
    if (!desc) return;
    const addrMatch = desc.match(/Address:-\s*(.*?)\s*(?:,?\s*Speed:-|$)/i);
    if (addrMatch) this.gpsAddress = addrMatch[1].trim();

    const speedMatch = desc.match(/Speed:-\s*([\d\.]+)/i);
    if (speedMatch) this.vehicleSpeed = speedMatch[1].trim();

    const ignMatch = desc.match(/Ignition:-\s*([A-Za-z]+)/i);
    if (ignMatch) this.vehicleIgnition = ignMatch[1].trim().toUpperCase();

    const timeMatch = desc.match(/Reporting Time:-\s*(.*)$/i);
    if (timeMatch) {
      let rawTime = timeMatch[1].trim();
      const dtMatch = rawTime.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})(.*)$/);
      if (dtMatch) {
        this.reportingTime = `${dtMatch[3]}-${dtMatch[2]}-${dtMatch[1]}${dtMatch[4]}`;
      } else {
        this.reportingTime = rawTime;
      }
    }
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  onViewFullLifecycle() {
    this.closePopup();
    this.viewLifecycle.emit(this.lrData);
  }
}
