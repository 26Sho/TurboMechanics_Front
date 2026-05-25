import { Component, OnInit, signal } from '@angular/core';
import { OrdersService } from '../service/orders.service';

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
