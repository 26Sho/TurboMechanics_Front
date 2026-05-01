import { Component, OnInit, signal } from '@angular/core';
import { OrdersService } from '../orders/orders.service'; // Ajusta según tu ruta

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  Math = Math;
  
  // Usamos signals para que el dashboard sea reactivo
  orders = signal<any[]>([]);
  
  stats: any[] = [];
  alerts: any[] = [];
  topServices: any[] = [];

  constructor(private _ordersService: OrdersService) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    // 1. Cargar órdenes reales desde la base de datos
    this._ordersService.getOrders().subscribe({
      next: (data) => {
        // Tomamos solo las últimas 5 para el dashboard
        this.orders.set(data.slice(0, 5));
      },
      error: (err) => console.error('Error en Dashboard:', err)
    });

    // 2. Datos estáticos de soporte (puedes crear un DashboardService después)
    this.stats = [
      { label: 'Ingresos del Mes', value: '$14.820.000', sub: 'vs mes anterior', change: 12.4, accent: '#F45D01', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>` },
      { label: 'Órdenes Activas', value: '23', sub: 'en proceso hoy', change: 5.2, accent: '#FFD60A', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>` },
      { label: 'Clientes Nuevos', value: '48', sub: 'este mes', change: 8.1, accent: '#2ECC71', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` },
      { label: 'Satisfacción', value: '96%', sub: 'promedio reseñas', change: -1.3, accent: '#FF8C00', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
    ];

    this.alerts = [
      { title: 'Stock bajo: Filtros de aire', desc: 'Quedan 4 unidades', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` },
      { title: 'Orden vencida', desc: 'Llevan 3 días sin retirar', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>` }
    ];

    this.topServices = [
      { name: 'Cambio de aceite y filtros', count: 87, pct: 100, color: '#F45D01' },
      { name: 'Alineación y balanceo', count: 64, pct: 74, color: '#FF8C00' },
      { name: 'Mantenimiento preventivo', count: 58, pct: 67, color: '#FFD60A' }
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