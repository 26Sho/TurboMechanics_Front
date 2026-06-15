import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

export interface ServiceResponseDTO {
  id:          number;
  name:        string;
  description: string;
  price:       number;
  active:      boolean;
}

const ICON_MAP: { keywords: string[]; icon: string }[] = [
  { keywords: ['aceite'],                      icon: 'fas fa-oil-can' },
  { keywords: ['freno', 'frenos'],             icon: 'fas fa-circle-notch' },
  { keywords: ['suspension', 'suspensión'],    icon: 'fas fa-car' },
  { keywords: ['electri'],                     icon: 'fas fa-bolt' },
  { keywords: ['sincroniz'],                   icon: 'fas fa-tachometer-alt' },
  { keywords: ['preventivo', 'mantenimiento'], icon: 'fas fa-cog' },
  { keywords: ['llanta', 'neumatico'],         icon: 'fas fa-circle' },
  { keywords: ['aire', 'acondicionado'],       icon: 'fas fa-wind' },
  { keywords: ['lavado', 'limpieza'],          icon: 'fas fa-tint' },
  { keywords: ['diagnostico', 'diagnóstico'],  icon: 'fas fa-search' },
];

function getIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const entry of ICON_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.icon;
  }
  return 'fas fa-wrench';
}

@Component({
  selector: 'app-services',
  standalone: false,
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {

  services: ServiceResponseDTO[] = [];
  loading = false;

  private readonly apiUrl = 'http://localhost:9090/admin/catalogo/public/servicios';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.loading = true;
    this.http.get<ServiceResponseDTO[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.services = (data ?? []).filter(s => s.active);
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  getIcon(name: string): string {
    return getIcon(name);
  }

  getNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  getWaText(name: string): string {
    return encodeURIComponent(`Quiero cotizar ${name}`);
  }
}