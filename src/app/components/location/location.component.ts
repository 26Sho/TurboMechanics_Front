import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface LocationDetail {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-location',
  standalone: false,
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {
  mapUrl: SafeResourceUrl;

  details: LocationDetail[] = [
    { icon: 'fas fa-map-pin',    label: 'Dirección', value: 'Armenia, Quindío, Colombia' },
    { icon: 'fas fa-clock',      label: 'Horario',   value: 'Lun – Sáb: 7:00 AM – 6:00 PM' },
    { icon: 'fas fa-phone',      label: 'Teléfono',  value: '+57 321 213 9466' },
    { icon: 'fab fa-whatsapp',   label: 'WhatsApp',  value: '+57 321 213 9466' }
  ];

  constructor(private sanitizer: DomSanitizer) {
    // Mapa centrado en Armenia, Quindío
    const src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63704.24!2d-75.6814!3d4.5339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38849a1d2e6b77%3A0xb47d4a69f2eb0c48!2sArmenia%2C%20Quind%C3%ADo!5e0!3m2!1ses!2sco!4v1690000000000!5m2!1ses!2sco';
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }
}
