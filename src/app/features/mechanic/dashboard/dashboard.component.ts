import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { environment } from '../../../../environments/environment';
@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  Math = Math;

  orders  = signal<any[]>([]);

  totalOrdenes  = 0;
  totalCitas    = 0;
  totalClientes = 0;
  loadingStats  = true;

  stats: any[] = [];

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    const hoy = new Date().toISOString().split('T')[0];
    forkJoin({
      ordenes:  this.http.get<any[]>(`${this.apiUrl}/orders`),
      citas:    this.http.get<any[]>(`${this.apiUrl}/appointments/agenda/daily?date=${hoy}`),
      clientes: this.http.get<any[]>(`${this.apiUrl}/admin/users`)
    }).subscribe({
      next: ({ ordenes, citas, clientes }) => {
        this.totalOrdenes  = ordenes.length;
        this.totalCitas    = citas.length;
        this.totalClientes = clientes.length;
        this.orders.set(ordenes.slice(-5).reverse());
        this.loadingStats = false;
        this.construirStats();
      },
      error: (err) => {
        console.error('Error cargando dashboard mecánico:', err);
        this.loadingStats = false;
      }
    });
  }

  construirStats(): void {
    this.stats = [
      {
        label: 'Clientes',
        value: this.totalClientes,
        sub: 'registrados',
        accent: '#F45D01',
        icon: `fas fa-users`
      },
      {
        label: 'Órdenes de Trabajo',
        value: this.totalOrdenes,
        sub: 'en total',
        accent: '#FFD60A',
        icon: `fas fa-tools`
      },
      {
        label: 'Citas',
        value: this.totalCitas,
        sub: 'hoy',
        accent: '#F45D01',
        icon: `fas fa-calendar-check`
      },
    ];
  }

  stateLabel(status: string): string {
    const map: Record<string, string> = {
      RECIBIDO: 'Recibido', EN_DIAGNOSTICO: 'En diagnóstico',
      EN_REPARACION: 'En reparación', LISTO: 'Listo',
      ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
    };
    return map[status] ?? status;
  }

  statusClass(status: string) {
    if (!status) return 'badge--neutral';
    const s = status.toUpperCase().replace(/_/g, '');
    if (s === 'RECIBIDO')       return 'badge--recibido';
    if (s === 'ENDIAGNOSTICO')  return 'badge--diagnostico';
    if (s === 'ENREPARACION')   return 'badge--reparacion';
    if (s === 'LISTO')          return 'badge--listo';
    if (s === 'ENTREGADO')      return 'badge--entregado';
    if (s === 'CANCELADO')      return 'badge--cancelado';
    return 'badge--neutral';
  }
}