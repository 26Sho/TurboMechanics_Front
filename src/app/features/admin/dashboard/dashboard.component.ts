import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../service/admin.service';
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

  orders = signal<any[]>([]);

  totalClientes    = 0;
  totalOrdenes     = 0;
  totalMecanicos   = 0;
  stockCritico: any[] = [];
  loadingStats     = true;

  stats: any[] = [];

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private _adminService: AdminService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    forkJoin({
      clientes:     this.http.get<any[]>(`${this.apiUrl}/admin/users`),
      ordenes:      this.http.get<any[]>(`${this.apiUrl}/orders`),
      mecanicos:    this.http.get<any[]>(`${this.apiUrl}/mecanicos`),
      stockCritico: this.http.get<any[]>(`${this.apiUrl}/admin/inventario/reportes/stock-critico`)
    }).subscribe({
      next: ({ clientes, ordenes, mecanicos, stockCritico }) => {
        this.totalClientes  = clientes.length;
        this.totalOrdenes   = ordenes.length;
        this.totalMecanicos = mecanicos.filter((m: any) => m.laborStatus === 'ACTIVO').length;
        this.stockCritico   = stockCritico;
        this.orders.set(ordenes.slice(-5).reverse());
        this.loadingStats   = false;
        this.construirStats();
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
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
        icon: 'fas fa-users'
      },
      {
        label: 'Órdenes de Trabajo',
        value: this.totalOrdenes,
        sub: 'en total',
        accent: '#FFD60A',
        icon: 'fas fa-tools'
      },
      {
        label: 'Stock Crítico',
        value: this.stockCritico.length,
        sub: this.stockCritico.length > 0 ? 'repuestos en alerta' : 'todo en orden',
        accent: this.stockCritico.length > 0 ? '#DC2626' : '#22C55E',
        icon: 'fas fa-boxes'
      },
      {
        label: 'Mecánicos',
        value: this.totalMecanicos,
        sub: 'activos',
        accent: '#22C55E',
        icon: 'fas fa-user-cog'
      },
    ];
  }

  stateLabel(status: string): string {
    const map: Record<string, string> = {
      RECIBIDO: 'Recibido',
      EN_DIAGNOSTICO: 'En diagnóstico',
      EN_REPARACION: 'En reparación',
      LISTO: 'Listo',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    if (!status) return 'badge--neutral';
    const s = status.toUpperCase().replace(/_/g, '');
    if (s === 'RECIBIDO')      return 'badge--recibido';
    if (s === 'ENDIAGNOSTICO') return 'badge--diagnostico';
    if (s === 'ENREPARACION')  return 'badge--reparacion';
    if (s === 'LISTO')         return 'badge--listo';
    if (s === 'ENTREGADO')     return 'badge--entregado';
    if (s === 'CANCELADO')     return 'badge--cancelado';
    return 'badge--neutral';
  }
}