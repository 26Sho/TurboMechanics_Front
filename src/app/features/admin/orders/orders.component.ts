import { Component, OnInit, signal } from '@angular/core';
import { OrdersService } from './orders.service'; 

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  search = '';
  filterStatus = '';
  
  // Usamos un signal vacío que se llenará con la BD
  orders = signal<any[]>([]);

  constructor(private _ordersService: OrdersService) {}

  ngOnInit(): void {
    this.cargarOrdersDesdeBD();
  }

  cargarOrdersDesdeBD() {
    // Llamada al método del servicio que conecta con el Back y BD
    this._ordersService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data); // Llena con los datos reales de la BD
        console.log('Órdenes cargadas desde la BD:', data);
      },
      error: (err) => {
        console.error('Error al cargar órdenes de la BD', err);
      }
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.search = target.value;
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterStatus = target.value;
  }

  get filteredOrders() {
    return this.orders().filter(o => {
      const q = this.search.toLowerCase();
      // Ajustar segun la base de datosssss
      const matchSearch = !q || 
                          o.client?.toLowerCase().includes(q) || 
                          o.vehicle?.toLowerCase().includes(q) || 
                          o.id?.toString().includes(q);
      
      const matchStatus = !this.filterStatus || o.status === this.filterStatus;
      return matchSearch && matchStatus;
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

  // BOTONES FUNCIONALES
  nuevaOrden() {
    console.log("Abriendo formulario de nueva orden...");
  }

  verDetalle(orden: any) {
    console.log("Viendo detalle de la orden ID:", orden.id);
  }
}