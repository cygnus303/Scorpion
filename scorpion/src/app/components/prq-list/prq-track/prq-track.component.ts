import { Component, TemplateRef, ViewChild, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

declare const L: any; // Leaflet

@Component({
  selector: 'app-prq-track',
  standalone: true,
  imports: [CommonModule, NgSelectModule, ReactiveFormsModule],
  templateUrl: './prq-track.component.html',
  styleUrl: './prq-track.component.scss'
})
export class PrqTrackComponent {
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  public modalRef!: BsModalRef;
  public prqData: any;
  public mapLoaded: boolean = false;
  private map: any;

  constructor(
    private modalService: BsModalService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  showPopup(data: any) {
    this.mapLoaded = false;
    this.prqData = data;
    
    this.modalRef = this.modalService.show(this.Templatepod, {
      backdrop: 'static',
      class: 'modal-lg modal-dialog-centered'
    });

    this.loadLeaflet().then(() => {
      this.initLeafletMap(data);
    });
  }

  private loadLeaflet(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).L) {
        resolve();
        return;
      }
      
      const css = this.renderer.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      this.renderer.appendChild(this.document.head, css);

      const script = this.renderer.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      this.renderer.appendChild(this.document.head, script);
    });
  }

  private initLeafletMap(data: any) {
    setTimeout(async () => {
      const origin = data?.FromCity || 'India';
      const dest = data?.ToCity || 'India';
      const currentLoc = (data?.CurrentLocation && data.CurrentLocation.trim() !== '') ? data.CurrentLocation : origin;

      const mapContainer = this.document.getElementById('da-leaflet-map');
      if (!mapContainer) return;
      
      if (this.map) {
        this.map.remove();
      }

      this.map = L.map(mapContainer).setView([22.5, 72.5], 5);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO'
      }).addTo(this.map);

      // Geocode cities
      const [originCoord, destCoord, currentCoord] = await Promise.all([
        this.geocode(origin),
        this.geocode(dest),
        this.geocode(currentLoc)
      ]);

      if (originCoord && destCoord) {
        // Fetch Route
        const routeData = await this.getRoute(originCoord, destCoord);
        if (routeData && routeData.routes && routeData.routes.length > 0) {
          const coordinates = routeData.routes[0].geometry.coordinates;
          const latLngs = coordinates.map((c: any) => [c[1], c[0]]);
          
          const polyline = L.polyline(latLngs, { color: '#3b82f6', weight: 4 }).addTo(this.map);
          this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

          // Add Truck Marker on route (snap to closest)
          const targetCoord = currentCoord || originCoord;
          const closest = this.getClosestPoint(targetCoord, latLngs);
          
          const truckIconHtml = `
            <div style="width:36px;height:36px;border-radius:50%;background:#ffb800;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);">
              <i class="fa fa-truck" style="color:#000;font-size:16px;"></i>
            </div>
          `;
          const truckIcon = L.divIcon({
            html: truckIconHtml,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          
          L.marker(closest, { icon: truckIcon }).addTo(this.map);
        }
      }
      this.mapLoaded = true;
    }, 300);
  }

  private async geocode(city: string): Promise<any> {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (e) {
      console.error('Geocode error', e);
    }
    return null;
  }

  private async getRoute(start: number[], end: number[]): Promise<any> {
    try {
      // OSRM expects lon,lat
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
      return await res.json();
    } catch (e) {
      console.error('Routing error', e);
    }
    return null;
  }

  private getClosestPoint(point: number[], path: number[][]): number[] {
    let minDist = Infinity;
    let closest = path[0];
    for (const p of path) {
      const dist = Math.sqrt(Math.pow(p[0] - point[0], 2) + Math.pow(p[1] - point[1], 2));
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }
    return closest;
  }

  closeDATracking() {
    this.modalRef?.hide();
  }
}
