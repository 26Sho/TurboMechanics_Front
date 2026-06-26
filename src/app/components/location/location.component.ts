import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';
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
// Debe tener "Maps JavaScript API" Y "Geocoding API" habilitadas para el proyecto.
const GOOGLE_MAPS_API_KEY = 'AIzaSyCRNfERJjshgPygGis2vchgLSebEWLsrwY';

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

  // Esta página es pública: el mapa, la sede y los talleres de la franquicia
  // se muestran tanto a visitantes anónimos como a clientes logueados.
  nearbyWorkshops: Workshop[] = [];
  loadingWorkshops = false;
  locationDenied   = false;
  locationAsked    = false;
  mapError         = false;

  private map: any;
  private geocoder: any;
  private markers: any[] = [];
  private mapReady = false;
  private readonly BASE = `${environment.apiUrl}`;

  // Coordenadas del taller principal (Armenia, Quindío)
  private readonly MAIN_LAT = 4.5339;
  private readonly MAIN_LNG = -75.6814;

  // Coordenadas del visitante (si las acepta), para mostrar su pin "Tu ubicación"
  private visitorLat: number | null = null;
  private visitorLng: number | null = null;
  private visitorMarker: any;

  // Taller más cercano calculado, usado por el botón "Cómo llegar"
  nearestWorkshop: Workshop | null = null;

  // Cache de direcciones ya geocodificadas, para no repetir llamadas a la API
  private addressCache: Map<string, string> = new Map();

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly`;
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

    this.geocoder = new google.maps.Geocoder();

    this.mapReady = true;

    // Si ya tenemos la ubicación del visitante (llegó antes de que el mapa cargara)
    if (this.visitorLat != null && this.visitorLng != null) {
      this.renderVisitorMarker();
    }

    if (this.nearbyWorkshops.length > 0) {
      this.renderWorkshopMarkers();
    } else {
      // Aunque no haya talleres todavía, centramos según lo que tengamos
      this.fitMapToVisible();
    }
  }

  // ── Pin de "Tu ubicación" (visitante, logueado o no) ──────────────────────
  private renderVisitorMarker(): void {
    if (!this.mapReady || !this.map || this.visitorLat == null || this.visitorLng == null) return;

    if (this.visitorMarker) {
      this.visitorMarker.setMap(null);
    }

    this.visitorMarker = new google.maps.Marker({
      position: { lat: this.visitorLat, lng: this.visitorLng },
      map: this.map,
      title: 'Tu ubicación',
      icon: this.pinIcon('#3B82F6', 30),
      zIndex: 999
    });

    const info = new google.maps.InfoWindow({ content: this.loadingInfoHtml('Tu ubicación') });
    this.visitorMarker.addListener('click', () => {
      info.open(this.map, this.visitorMarker);
      this.fillInfoWithAddress(info, this.visitorLat as number, this.visitorLng as number, 'Tu ubicación');
    });

    this.fitMapToVisible();
  }

  // ── Pinta los pines de los talleres registrados por el administrador ─────
  private renderWorkshopMarkers(): void {
    if (!this.mapReady || !this.map) return;

    this.markers.forEach(m => m.setMap(null));
    this.markers = [];

    this.nearbyWorkshops.forEach(w => {
      const marker = new google.maps.Marker({
        position: { lat: w.latitude, lng: w.longitude },
        map: this.map,
        title: w.name,
        icon: this.pinIcon('#F45D01', 30)
      });

      const content = this.wrapInfo(`
        <strong style="color:#1a1a1a; font-size:14px;">${this.escapeHtml(w.name)}</strong><br>
        <span style="color:#3a3a3a;">${this.escapeHtml(w.address)}</span><br>
        <span style="color:#3a3a3a;">${this.escapeHtml(w.city)}${w.state ? ', ' + this.escapeHtml(w.state) : ''}</span><br>
        <span style="color:#3a3a3a;">Colombia</span>
        ${w.phone ? `<br><span style="color:#3a3a3a;">${this.escapeHtml(w.phone)}</span>` : ''}
        ${w.schedule ? `<br><span style="color:#3a3a3a;">${this.escapeHtml(w.schedule)}</span>` : ''}
      `);

      const info = new google.maps.InfoWindow({ content });
      marker.addListener('click', () => info.open(this.map, marker));

      this.markers.push(marker);
    });

    this.fitMapToVisible();
  }

  /** Ajusta el zoom/centro para que se vean: talleres + visitante (los que existan) */
  private fitMapToVisible(): void {
    if (!this.map) return;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    this.nearbyWorkshops.forEach(w => {
      bounds.extend({ lat: w.latitude, lng: w.longitude });
      hasPoints = true;
    });

    if (this.visitorLat != null && this.visitorLng != null) {
      bounds.extend({ lat: this.visitorLat, lng: this.visitorLng });
      hasPoints = true;
    }

    if (hasPoints) {
      this.map.fitBounds(bounds, 60);
    } else {
      // Sin talleres ni ubicación del visitante: centramos en Armenia por defecto
      this.map.setCenter({ lat: this.MAIN_LAT, lng: this.MAIN_LNG });
      this.map.setZoom(13);
    }
  }

  // ── Geocodificación inversa (solo para el pin de "Tu ubicación") ─────────
  private reverseGeocode(lat: number, lng: number): Promise<string | null> {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (this.addressCache.has(key)) {
      return Promise.resolve(this.addressCache.get(key) as string);
    }
    if (!this.geocoder) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      this.geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const neighborhoodResult = results.find((r: any) =>
            r.types?.includes('sublocality') || r.types?.includes('neighborhood')
          );
          const formatted = (neighborhoodResult || results[0]).formatted_address as string;
          this.addressCache.set(key, formatted);
          resolve(formatted);
        } else {
          // Log para diagnóstico: revisa la consola si esto sigue fallando.
          // Causas comunes: la API de Geocoding tardó en propagarse tras habilitarla
          // (puede tardar hasta 5 min), o la facturación aún no terminó de activarse.
          console.warn('Geocoding falló con status:', status);
          resolve(null);
        }
      });
    });
  }

  private loadingInfoHtml(title: string): string {
    return this.wrapInfo(`<strong style="color:#1a1a1a;">${this.escapeHtml(title)}</strong><br><span style="color:#6E6E6E;">Buscando dirección...</span>`);
  }

  private wrapInfo(innerHtml: string): string {
    return `<div style="font-family: sans-serif; max-width: 230px; font-size: 13px; line-height: 1.5; color: #1a1a1a;">${innerHtml}</div>`;
  }

  /** Actualiza el popup de "Tu ubicación" con la dirección geocodificada (o la oculta si falla) */
  private fillInfoWithAddress(info: any, lat: number, lng: number, title: string): void {
    this.reverseGeocode(lat, lng).then((address) => {
      const addressLine = address
        ? `<span style="color:#3a3a3a;">${this.escapeHtml(address)}</span>`
        : `<span style="color:#9a9a9a; font-size:11px;">Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</span>`;
      info.setContent(this.wrapInfo(`<strong style="color:#1a1a1a; font-size:14px;">${this.escapeHtml(title)}</strong><br>${addressLine}`));
    });
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

  // ── Geolocalización del visitante (funciona logueado o no, es navegador) ─
  requestLocation(): void {
    if (!navigator.geolocation) {
      this.loadAllWorkshops();
      return;
    }
    this.locationAsked = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.visitorLat = pos.coords.latitude;
        this.visitorLng = pos.coords.longitude;
        this.locationDenied = false;
        if (this.mapReady) {
          this.renderVisitorMarker();
        }
        this.loadNearbyWorkshops(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        this.locationDenied = true;
        this.visitorLat = null;
        this.visitorLng = null;
        this.loadAllWorkshops();
      }
    );
  }

  private loadNearbyWorkshops(lat: number, lng: number): void {
    this.loadingWorkshops = true;
    const params = new HttpParams().set('lat', lat).set('lng', lng).set('radio', 200);
    this.http.get<Workshop[]>(`${this.BASE}/talleres/cercanos`, { params }).subscribe({
      next: (data) => {
        // El backend ya los devuelve ordenados por distancia, así que el primero es el más cercano.
        this.nearbyWorkshops = data ?? [];
        this.loadingWorkshops = false;
        this.updateNearestWorkshop();
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
        this.updateNearestWorkshop();
        this.renderWorkshopMarkers();
      },
      error: () => { this.loadingWorkshops = false; }
    });
  }

  /** Calcula cuál taller está más cerca del visitante (si tenemos su ubicación) */
  private updateNearestWorkshop(): void {
    if (this.nearbyWorkshops.length === 0) {
      this.nearestWorkshop = null;
      return;
    }

    if (this.visitorLat == null || this.visitorLng == null) {
      // Sin ubicación del visitante: usamos el primero de la lista (o el que ya
      // venga ordenado por distancia si vino de /cercanos).
      this.nearestWorkshop = this.nearbyWorkshops[0];
      return;
    }

    let closest = this.nearbyWorkshops[0];
    let closestDist = this.haversineKm(this.visitorLat, this.visitorLng, closest.latitude, closest.longitude);

    for (const w of this.nearbyWorkshops) {
      const dist = this.haversineKm(this.visitorLat, this.visitorLng, w.latitude, w.longitude);
      if (dist < closestDist) {
        closest = w;
        closestDist = dist;
      }
    }

    this.nearestWorkshop = closest;
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /** URL para el botón "Cómo llegar": traza ruta real al taller más cercano si lo tenemos */
  getDirectionsUrl(): string {
    if (!this.nearestWorkshop) {
      // Sin talleres registrados todavía: fallback genérico a Armenia, Quindío
      return 'https://maps.google.com/?q=Armenia,Quindio,Colombia';
    }

    const destination = `${this.nearestWorkshop.latitude},${this.nearestWorkshop.longitude}`;
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

    if (this.visitorLat != null && this.visitorLng != null) {
      // Si tenemos la ubicación del visitante, fijamos el origen exacto para
      // que la ruta se calcule de inmediato sin pedirle permiso de nuevo a Google Maps.
      url += `&origin=${this.visitorLat},${this.visitorLng}`;
    }

    return url;
  }

  /** Texto de ayuda bajo el botón, mostrando a qué taller te lleva */
  get nearestWorkshopLabel(): string | null {
    if (!this.nearestWorkshop) return null;
    if (this.nearestWorkshop.distanceKm != null) {
      return `${this.nearestWorkshop.name} · ${this.nearestWorkshop.distanceKm.toFixed(1)} km`;
    }
    return this.nearestWorkshop.name;
  }
}