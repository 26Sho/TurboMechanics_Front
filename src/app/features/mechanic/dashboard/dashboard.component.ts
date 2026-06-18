import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  Math = Math;

  orders = signal<any[]>([]);

  totalOrdenes    = 0;
  totalClientes   = 0;
  stockCritico: any[] = [];
  loadingStats    = true;

  stats: any[] = [];

  private apiUrl = 'http://localhost:9090';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    forkJoin({
      ordenes:      this.http.get<any[]>(`${this.apiUrl}/orders`),
      clientes:     this.http.get<any[]>(`${this.apiUrl}/admin/users`),
      stockCritico: this.http.get<any[]>(`${this.apiUrl}/admin/inventario/reportes/stock-critico`)
    }).subscribe({
      next: ({ ordenes, clientes, stockCritico }) => {
        this.totalOrdenes  = ordenes.length;
        this.totalClientes = clientes.length;
        this.stockCritico  = stockCritico;
        this.orders.set(ordenes.slice(-5).reverse());
        this.loadingStats  = false;
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
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`
      },
      {
        label: 'Órdenes de Trabajo',
        value: this.totalOrdenes,
        sub: 'en total',
        accent: '#FFD60A',
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`
      },
      {
        label: 'Stock Crítico',
        value: this.stockCritico.length,
        sub: this.stockCritico.length > 0 ? 'repuestos en alerta' : 'todo en orden',
        accent: this.stockCritico.length > 0 ? '#DC2626' : '#22C55E',
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`
      },
    ];
  }

  statusClass(status: string) {
    const map: Record<string, string> = {
      'En proceso': 'badge--accent',
      'Pendiente':  'badge--warning',
      'Listo':      'badge--success',
      'Entregado':  'badge--neutral',
    };
    return map[status] ?? 'badge--neutral';
  }
}