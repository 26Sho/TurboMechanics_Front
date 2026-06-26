import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

declare const google: any;

export interface LocationDetail {
  icon: string;
  label: string;
  value: string;
}

export interface Workshop {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  schedule: string;
  active: boolean;
  distanceKm?: number;
}

// ⚠️ API key de Google Maps pegada directo en el código (decisión del equipo).
// Generada en Google Cloud Console > APIs & Services > Credentials.
// Debe tener "Maps JavaScript API" habilitada para el proyecto.
const GOOGLE_MAPS_API_KEY = '';

@Component({
  selector: 'app-location',
  standalone: false,
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, AfterViewInit {

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  details: LocationDetail[] = [
    { icon: 'fas fa-map-pin',  label: 'Dirección', value: 'Armenia, Quindío, Colombia' },
    { icon: 'fas fa-clock',    label: 'Horario',   value: 'Lun – Sáb: 7:00 AM – 6:00 PM' },
    { icon: 'fas fa-phone',    label: 'Teléfono',  value: '+57 321 213 9466' },
    { icon: 'fab fa-whatsapp', label: 'WhatsApp',  value: '+57 321 213 9466' }
  ];

  nearbyWorkshops: Workshop[] = [];
  loadingWorkshops = false;
  locationDenied   = false;
  locationAsked    = false;
  mapError         = false;

  private map: any;
  private markers: any[] = [];
  private mapReady = false;
  private readonly BASE = 'http://localhost:9090';

  // Coordenadas del taller principal (Armenia, Quindío) — tomadas del embed
  // de Google Maps que ya existía en el componente original.
  private readonly MAIN_LAT = 4.5339;
  private readonly MAIN_LNG = -75.6814;

  private static googleMapsLoadingPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.requestLocation();
  }

  ngAfterViewInit(): void {
    this.loadGoogleMaps()
      .then(() => this.initMap())
      .catch((err) => {
        console.error('No se pudo cargar Google Maps:', err);
        this.mapError = true;
      });
  }

  // ── Carga el script de Google Maps JS API dinámicamente, sin tocar index.html ──
  private loadGoogleMaps(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return Promise.resolve();
    }

    if (LocationComponent.googleMapsLoadingPromise) {
      return LocationComponent.googleMapsLoadingPromise;
    }

    LocationComponent.googleMapsLoadingPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
      if (existingScript) {
        if (typeof google !== 'undefined' && google.maps) {
          resolve();
        } else {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load')));
        }
        return;
      }

      const script = document.createElement('script');
      script.src = ``;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-maps', 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Maps script failed to load'));
      document.head.appendChild(script);
    });

    return LocationComponent.googleMapsLoadingPromise;
  }

  // ── Mapa con Google Maps JS API ───────────────────────────────────────────
  private initMap(): void {
    if (typeof google === 'undefined' || !google.maps) {
      this.mapError = true;
      return;
    }

    const el = this.mapContainer.nativeElement;

    this.map = new google.maps.Map(el, {
      center: { lat: this.MAIN_LAT, lng: this.MAIN_LNG },
      zoom: 13,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      styles: this.darkMapStyle()
    });

    // Marcador del taller principal (sede)
    const mainMarker = new google.maps.Marker({
      position: { lat: this.MAIN_LAT, lng: this.MAIN_LNG },
      map: this.map,
      title: 'TurboMechanics - Sede principal',
      icon: this.pinIcon('#D62828', 34)
    });

    const mainInfo = new google.maps.InfoWindow({
      content: '<strong>TurboMechanics</strong><br>Armenia, Quindío (sede principal)'
    });
    mainMarker.addListener('click', () => mainInfo.open(this.map, mainMarker));

    this.mapReady = true;

    if (this.nearbyWorkshops.length > 0) {
      this.renderWorkshopMarkers();
    }
  }

  // ── Pinta los pines de los talleres dentro del MISMO mapa ────────────────
  private renderWorkshopMarkers(): void {
    if (!this.mapReady || !this.map) return;

    // Limpiar marcadores anteriores antes de redibujar
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: this.MAIN_LAT, lng: this.MAIN_LNG });

    this.nearbyWorkshops.forEach(w => {
      const marker = new google.maps.Marker({
        position: { lat: w.latitude, lng: w.longitude },
        map: this.map,
        title: w.name,
        icon: this.pinIcon('#F45D01', 30)
      });

      const info = new google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; max-width: 220px;">
            <strong>${this.escapeHtml(w.name)}</strong><br>
            ${this.escapeHtml(w.address)}, ${this.escapeHtml(w.city)}${w.state ? ', ' + this.escapeHtml(w.state) : ''}<br>
            ${w.phone ? this.escapeHtml(w.phone) + '<br>' : ''}
            ${w.schedule ? this.escapeHtml(w.schedule) : ''}
          </div>
        `
      });
      marker.addListener('click', () => info.open(this.map, marker));

      this.markers.push(marker);
      bounds.extend({ lat: w.latitude, lng: w.longitude });
    });

    if (this.nearbyWorkshops.length > 0) {
      this.map.fitBounds(bounds, 60);
    }
  }

  // ── Ícono de pin simple en SVG, sin depender de imágenes externas ────────
  private pinIcon(color: string, size: number): any {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
        <path fill="${color}" stroke="#ffffff" stroke-width="1.2"
          d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"/>
        <circle cx="12" cy="10" r="3" fill="#ffffff"/>
      </svg>`;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size)
    };
  }

  // ── Estilo oscuro para que el mapa combine con el diseño de la página ────
  private darkMapStyle(): any[] {
    return [
      { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#cfcfcf' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b2b2b' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#242424' }] },
      { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] }
    ];
  }

  private escapeHtml(value: string): string {
    if (!value) { return ''; }
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  requestLocation(): void {
    if (!navigator.geolocation) {
      this.loadAllWorkshops();
      return;
    }
    this.locationAsked = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.loadNearbyWorkshops(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        this.locationDenied = true;
        this.loadAllWorkshops();
      }
    );
  }

  private loadNearbyWorkshops(lat: number, lng: number): void {
    this.loadingWorkshops = true;
    const params = new HttpParams().set('lat', lat).set('lng', lng).set('radio', 200);
    this.http.get<Workshop[]>(`${this.BASE}/talleres/cercanos`, { params }).subscribe({
      next: (data) => {
        this.nearbyWorkshops = data ?? [];
        this.loadingWorkshops = false;
        this.renderWorkshopMarkers();
      },
      error: () => { this.loadAllWorkshops(); }
    });
  }

  private loadAllWorkshops(): void {
    this.loadingWorkshops = true;
    this.http.get<Workshop[]>(`${this.BASE}/talleres`).subscribe({
      next: (data) => {
        this.nearbyWorkshops = (data ?? []).filter(w => w.active);
        this.loadingWorkshops = false;
        this.renderWorkshopMarkers();
      },
      error: () => { this.loadingWorkshops = false; }
    });
  }
}