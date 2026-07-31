import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-prq-track',
  standalone: true,
  imports: [CommonModule,NgSelectModule,ReactiveFormsModule],
  templateUrl: './prq-track.component.html',
  styleUrl: './prq-track.component.scss'
})
export class PrqTrackComponent {
   @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
    public modalRef!: BsModalRef;
  public prqData: any;
  public mapUrl!: SafeResourceUrl;
  public mapLoaded: boolean = false;

  constructor(
    private modalService: BsModalService,
    private sanitizer: DomSanitizer
  ){}

  showPopup(data:any){
    this.mapLoaded = false;
    this.prqData = data;
    const origin = data?.FromCity || '';
    const dest = data?.ToCity || '';
    
    // Fallback if cities are missing
    const qOrigin = origin ? encodeURIComponent(origin) : 'India';
    const qDest = dest ? encodeURIComponent(dest) : 'India';
    
    // Simple direct route URL that works reliably in classic embed
    const rawUrl = `https://maps.google.com/maps?saddr=${qOrigin}&daddr=${qDest}&output=embed`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);

    this.modalRef = this.modalService.show(this.Templatepod, {
      backdrop: 'static',
      class: 'modal-lg modal-dialog-centered'
    });
  }

  onMapLoad() {
    setTimeout(() => {
      this.mapLoaded = true;
    });
  }

  closeDATracking() {
    this.modalRef?.hide();
  }
}
