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

      // Initialize map without Leaflet zoom controls, so our custom fake controls look real
      this.map = L.map(mapContainer, { zoomControl: false, attributionControl: false }).setView([22.5, 72.5], 5);
      
      this.setMapType('roadmap');

      // Geocode cities
      let originCoord = await this.geocode(origin);
      let destCoord = (dest === origin) ? originCoord : await this.geocode(dest);
      let currentCoord = (currentLoc === origin) ? originCoord : 
                         (currentLoc === dest) ? destCoord : 
                         await this.geocode(currentLoc);

      // Fallbacks if geocode fails
      if (!originCoord) originCoord = [19.0760, 72.8777]; // Default to Mumbai
      if (!destCoord) destCoord = [28.7041, 77.1025];   // Default to Delhi
      if (!currentCoord) currentCoord = originCoord;

      if (originCoord && destCoord) {
        // Fetch Route
        const routeData = await this.getRoute(originCoord, destCoord);
        if (routeData && routeData.routes && routeData.routes.length > 0) {
          const coordinates = routeData.routes[0].geometry.coordinates;
          const latLngs = coordinates.map((c: any) => [c[1], c[0]]);
          
          const polyline = L.polyline(latLngs, { color: '#3b82f6', weight: 4 }).addTo(this.map);
          this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

          // Place truck at the progress percentage along the route
          const progressPct = data?.PRQStatus === 'Generated' ? 0.10 : 0.66;
          const targetIndex = Math.floor(latLngs.length * progressPct);
          const closest = latLngs[targetIndex] || latLngs[0];
          
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
        } else {
           // Fallback: draw straight line if routing fails
           const latLngs = [originCoord, destCoord];
           const polyline = L.polyline(latLngs, { color: '#3b82f6', weight: 4, dashArray: '10, 10' }).addTo(this.map);
           this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

           const truckIcon = L.divIcon({
            html: `<div style="width:36px;height:36px;border-radius:50%;background:#ffb800;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);"><i class="fa fa-truck" style="color:#000;font-size:16px;"></i></div>`,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          L.marker(originCoord, { icon: truckIcon }).addTo(this.map);
        }
      }
      this.mapLoaded = true;
      // Force Leaflet to recalculate size after the loader disappears and modal is fully open
      setTimeout(() => {
        if (this.map) {
           this.map.invalidateSize();
        }
      }, 100);
    }, 10); // Reduced timeout significantly
  }

  private geocodeCache: { [city: string]: number[] } = {};

  private async geocode(city: string): Promise<any> {
    const cityName = city.toLowerCase().trim();
    
    if (this.geocodeCache[cityName]) {
      return this.geocodeCache[cityName];
    }

    try {
      // Append India to get better local results, or fallback to generic search if it's already "India"
      const query = city.toLowerCase() === 'india' ? 'India' : `${city}, India`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const coord = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        this.geocodeCache[cityName] = coord;
        return coord;
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

  // --- Map Controls ---
  public mapType: 'roadmap' | 'satellite' = 'roadmap';
  private tileLayer: any;

  setMapType(type: 'roadmap' | 'satellite') {
    this.mapType = type;
    if (!this.map) return;
    
    // Remove old layer
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }
    
    let url = 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // roadmap
    if (type === 'satellite') {
      url = 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'; // hybrid satellite
    }

    this.tileLayer = L.tileLayer(url, {
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(this.map);
  }

  zoomIn() {
    if (this.map) this.map.zoomIn();
  }

  zoomOut() {
    if (this.map) this.map.zoomOut();
  }

  toggleFullscreen() {
    const container = this.document.querySelector('.track-map-wrapper');
    if (!container) return;

    if (!this.document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if ((this.document as any).webkitExitFullscreen) {
        (this.document as any).webkitExitFullscreen();
      } else if ((this.document as any).msExitFullscreen) {
        (this.document as any).msExitFullscreen();
      }
    }
  }

  openStreetView() {
    if (!this.map) return;
    const center = this.map.getCenter();
    window.open(`https://www.google.com/maps?layer=c&cbll=${center.lat},${center.lng}`, '_blank');
  }

  closeDATracking() {
    this.modalRef?.hide();
  }
}
