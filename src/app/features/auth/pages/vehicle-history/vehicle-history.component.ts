import { Component, OnInit } from '@angular/core';
import { WorkOrderService } from 'src/app/core/services/work-order.service';
import { VehicleService } from 'src/app/core/services/vehicle.service';
import { WorkOrderResponse, StateOrder, Priority } from 'src/app/core/models/work-order';
import { VehicleResponse } from 'src/app/core/models/vehicle';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-vehicle-history',
  templateUrl: './vehicle-history.component.html',
  styleUrl: './vehicle-history.component.scss',
})
export class VehicleHistoryComponent implements OnInit {

  // ── Búsqueda ───────────────────────────────────────────────────────────────
  searchPlate = '';
  vehicle: VehicleResponse | null = null;
  orders: WorkOrderResponse[] = [];

  // ── Estado ─────────────────────────────────────────────────────────────────
  isLoading = false;
  hasSearched = false;
  vehicleNotFound = false;
  noOrders = false;

  // ── Filtro / ordenamiento ──────────────────────────────────────────────────
  filterState: StateOrder | '' = '';
  sortAsc = false; // por defecto: más reciente primero

  // ── Detalle de orden ───────────────────────────────────────────────────────
  selectedOrder: WorkOrderResponse | null = null;
  showDetail = false;

  constructor(
    private workOrderService: WorkOrderService,
    private vehicleService: VehicleService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {}

  // ── Buscar historial ───────────────────────────────────────────────────────
  search(): void {
    const plate = this.searchPlate.trim().toUpperCase();
    if (!plate) {
      this.toastService.warning('Ingresa una placa para buscar');
      return;
    }

    this.isLoading = true;
    this.hasSearched = false;
    this.vehicle = null;
    this.orders = [];
    this.vehicleNotFound = false;
    this.noOrders = false;
    this.filterState = '';

    // 1. Buscar datos del vehículo
    this.vehicleService.getByPlate(plate).subscribe({
      next: (v) => {
        this.vehicle = v;

        // 2. Buscar órdenes del vehículo
        this.workOrderService.listByPlate(plate).subscribe({
          next: (orders) => {
            this.isLoading = false;
            this.hasSearched = true;
            this.orders = orders;
            this.noOrders = orders.length === 0;
          },
          error: () => {
            this.isLoading = false;
            this.hasSearched = true;
            this.noOrders = true;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.hasSearched = true;
        this.vehicleNotFound = true;
      }
    });
  }

  clearSearch(): void {
    this.searchPlate = '';
    this.vehicle = null;
    this.orders = [];
    this.hasSearched = false;
    this.vehicleNotFound = false;
    this.noOrders = false;
    this.filterState = '';
    this.selectedOrder = null;
    this.showDetail = false;
  }

  // ── Órdenes filtradas y ordenadas ──────────────────────────────────────────
  get filteredOrders(): WorkOrderResponse[] {
    let result = [...this.orders];

    if (this.filterState) {
      result = result.filter(o => o.stateorder === this.filterState);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.dateentry).getTime();
      const dateB = new Date(b.dateentry).getTime();
      return this.sortAsc ? dateA - dateB : dateB - dateA;
    });

    return result;
  }

  toggleSort(): void {
    this.sortAsc = !this.sortAsc;
  }

  // ── Etiquetas visuales ─────────────────────────────────────────────────────
  getStateLabel(state: StateOrder): string {
    const map: Record<StateOrder, string> = {
      RECIBIDO:       'Recibido',
      EN_DIAGNOSTICO: 'En diagnóstico',
      EN_REPARACION:  'En reparación',
      LISTO:          'Listo',
      ENTREGADO:      'Entregado',
      CANCELADO:      'Cancelado',
    };
    return map[state] ?? state;
  }

  getStateClass(state: StateOrder): string {
    const map: Record<StateOrder, string> = {
      RECIBIDO:       'state--received',
      EN_DIAGNOSTICO: 'state--diagnosing',
      EN_REPARACION:  'state--repairing',
      LISTO:          'state--ready',
      ENTREGADO:      'state--delivered',
      CANCELADO:      'state--cancelled',
    };
    return map[state] ?? '';
  }

  getPriorityLabel(p: Priority): string {
    const map: Record<Priority, string> = {
      BAJA:    'Baja',
      NORMAL:  'Normal',
      ALTA:    'Alta',
      URGENTE: 'Urgente',
    };
    return map[p] ?? p;
  }

  getPriorityClass(p: Priority): string {
    const map: Record<Priority, string> = {
      BAJA:    'priority--low',
      NORMAL:  'priority--normal',
      ALTA:    'priority--high',
      URGENTE: 'priority--urgent',
    };
    return map[p] ?? '';
  }

  // ── Estados disponibles para filtro ───────────────────────────────────────
  get availableStates(): StateOrder[] {
    const seen = new Set<StateOrder>();
    this.orders.forEach(o => seen.add(o.stateorder));
    return Array.from(seen);
  }

  // ── Modal de detalle ───────────────────────────────────────────────────────
  openDetail(order: WorkOrderResponse): void {
    this.selectedOrder = order;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedOrder = null;
  }
}