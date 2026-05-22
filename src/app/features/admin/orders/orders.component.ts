import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from 'src/app/shared/services/toast.service';

export interface WorkOrderDTO {
  id: number;
  numberorder: string;
  clientname: string;
  clientidentification: string;
  clientphone: string;
  vehicleplate: string;
  vehiclebrand: string;
  vehiclemodel: string;
  vehicleyear: number;
  vehiclecolor: string;
  failuresreported: string;
  dateentry: string;
  dateestimateddelivery: string;
  stateorder: string;
  priority: string;
  createdBy: string;
  datecreation: string;
  assignedMechanicId: number;
  assignedMechanicName: string;
  assignedAt: string;
  assignedBy: string;
}

export interface MechanicDTO {
  id: number;
  name: string;
  document: number;
  position: string;
  laborStatus: string;
  maxOrderCapacity: number;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  private ordersUrl   = 'http://localhost:9090/workorder';
  private mecanicosUrl = 'http://localhost:9090/mecanicos';

  search       = '';
  filterStatus = '';
  cargando     = false;

  orders = signal<WorkOrderDTO[]>([]);

  // Modal asignar mecánico
  modalAsignar      = false;
  ordenSeleccionada: WorkOrderDTO | null = null;
  mecanicos: MechanicDTO[] = [];
  cargandoMecanicos = false;
  mecanicoDocumento: number | null = null;
  asignando         = false;

  constructor(
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // ─── Carga órdenes ────────────────────────────────────────

  cargarOrdenes(): void {
    this.cargando = true;
    this.http.get<WorkOrderDTO[]>(this.ordersUrl, this.getHeaders()).subscribe({
      next: (data) => { this.orders.set(data); this.cargando = false; },
      error: (err) => {
        console.error('Error al cargar órdenes', err);
        this.toast.error('Error al cargar las órdenes.');
        this.cargando = false;
      }
    });
  }

  // ─── Filtros ──────────────────────────────────────────────

  onSearchChange(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
  }

  onStatusChange(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value;
  }

  get filteredOrders(): WorkOrderDTO[] {
    return this.orders().filter(o => {
      const q = this.search.toLowerCase();
      const matchSearch = !q ||
        o.clientname?.toLowerCase().includes(q) ||
        o.vehicleplate?.toLowerCase().includes(q) ||
        o.numberorder?.toLowerCase().includes(q) ||
        o.clientidentification?.includes(q);
      const matchStatus = !this.filterStatus || o.stateorder === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  // ─── Modal Asignar mecánico (HU 6.7) ─────────────────────

  abrirAsignar(orden: WorkOrderDTO): void {
    this.ordenSeleccionada = orden;
    this.mecanicoDocumento = orden.assignedMechanicId ? null : null;
    this.mecanicos = [];
    this.cargandoMecanicos = true;
    this.modalAsignar = true;

    // Cargar solo mecánicos ACTIVOS
    this.http.get<MechanicDTO[]>(
      `${this.mecanicosUrl}?estado=ACTIVO`, this.getHeaders()
    ).subscribe({
      next: (data) => { this.mecanicos = data; this.cargandoMecanicos = false; },
      error: () => { this.toast.error('Error al cargar mecánicos.'); this.cargandoMecanicos = false; }
    });
  }

  confirmarAsignacion(): void {
    if (!this.mecanicoDocumento || !this.ordenSeleccionada) {
      this.toast.warning('Selecciona un mecánico para asignar.');
      return;
    }
    this.asignando = true;
    const payload = { mechanicDocument: this.mecanicoDocumento };

    this.http.post<WorkOrderDTO>(
      `${this.mecanicosUrl}/ordenes/${this.ordenSeleccionada.id}/asignar`,
      payload,
      this.getHeaders()
    ).subscribe({
      next: (updated) => {
        // Actualizar la orden en el signal
        this.orders.update(list =>
          list.map(o => o.id === updated.id ? updated : o)
        );
        this.toast.success('Orden asignada correctamente.');
        this.modalAsignar = false;
        this.asignando = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'No se pudo asignar la orden.');
        this.asignando = false;
      }
    });
  }

  // ─── Nueva orden ──────────────────────────────────────────

  nuevaOrden(): void {
    console.log('Abriendo formulario de nueva orden...');
  }

  verDetalle(orden: WorkOrderDTO): void {
    console.log('Ver detalle orden:', orden.numberorder);
  }

  // ─── Helpers ──────────────────────────────────────────────

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'RECIBIDO':       'badge--warning',
      'EN_DIAGNOSTICO': 'badge--accent',
      'EN_REPARACION':  'badge--accent',
      'LISTO':          'badge--success',
      'ENTREGADO':      'badge--neutral',
      'CANCELADO':      'badge--danger',
    };
    return map[status] ?? 'badge--neutral';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'RECIBIDO':       'Recibido',
      'EN_DIAGNOSTICO': 'En diagnóstico',
      'EN_REPARACION':  'En reparación',
      'LISTO':          'Listo',
      'ENTREGADO':      'Entregado',
      'CANCELADO':      'Cancelado',
    };
    return map[status] ?? status;
  }

  priorityClass(p: string): string {
    const map: Record<string, string> = {
      URGENTE: 'badge--danger',
      ALTA:    'badge--warning',
      NORMAL:  'badge--accent',
      BAJA:    'badge--neutral'
    };
    return map[p] ?? 'badge--neutral';
  }

  formatFecha(f: string): string {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  puedeAsignar(o: WorkOrderDTO): boolean {
    return ['RECIBIDO', 'EN_DIAGNOSTICO', 'EN_REPARACION'].includes(o.stateorder);
  }
}