import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/services/toast.service';
import { AdminService, UserRequest, UserResponse, WorkOrderResponse } from '../../admin/service/admin.service';

@Component({
  standalone: false,
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  search = '';
  clients: UserResponse[] = [];
  isLoading = false;

  // Modal historial (RF 2.2)
  showHistory = false;
  historyClient: UserResponse | null = null;
  history: WorkOrderResponse[] = [];
  loadingHistory = false;

  // Modal edición (RF 2.4)
  showEdit = false;
  editForm: UserRequest = { username: '', identification: 0, phone: '', email: '' };
  savingEdit = false;

  private emailPattern = /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/;

  get isEditEmailValid(): boolean {
    return this.emailPattern.test((this.editForm.email || '').trim());
  }

  constructor(
    private adminService: AdminService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.adminService.getAllClients().subscribe({
      next: (data) => { this.clients = data; this.isLoading = false; },
      error: () => { this.toast.error('Error al cargar clientes'); this.isLoading = false; }
    });
  }

  get filteredClients(): UserResponse[] {
    const q = this.search.trim().toLowerCase();
    return !q ? this.clients : this.clients.filter(c =>
      String(c.identification).includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }

  // ── RF 2.2 — Historial de servicios por cliente ───────────────────────────
  verHistorial(client: UserResponse): void {
    this.historyClient = client;
    this.history = [];
    this.showHistory = true;
    this.loadingHistory = true;
    this.adminService.getServiceHistory(client.identification).subscribe({
      next: (data) => { this.history = data; this.loadingHistory = false; },
      error: () => { this.toast.error('Este cliente no tiene historial'); this.loadingHistory = false; }
    });
  }

  // ── RF 2.4 — Actualizar información del cliente ───────────────────────────
  abrirEditar(client: UserResponse, event: Event): void {
    event.stopPropagation();
    this.editForm = {
      username: client.username,
      identification: client.identification,
      phone: client.phone,
      email: client.email
    };
    this.showEdit = true;
  }

  guardarEdicion(): void {
    if (!this.isEditEmailValid) {
      this.toast.error('El correo no tiene un formato válido (ej: nombre@dominio.com)');
      return;
    }
    this.savingEdit = true;
    this.adminService.updateClient(this.editForm.identification, this.editForm).subscribe({
      next: (updated) => {
        const idx = this.clients.findIndex(c => c.identification === updated.identification);
        if (idx > -1) this.clients[idx] = updated;
        this.toast.success('Cliente actualizado correctamente');
        this.showEdit = false;
        this.savingEdit = false;
      },
      error: () => { this.toast.error('Error al actualizar'); this.savingEdit = false; }
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      RECIBIDO: 'badge--recibido', EN_DIAGNOSTICO: 'badge--diagnostico',
      EN_REPARACION: 'badge--reparacion', LISTO: 'badge--listo',
      ENTREGADO: 'badge--entregado', CANCELADO: 'badge--cancelado'
    };
    return map[status] ?? '';
  }

  cerrarModales(): void {
    this.showHistory = false;
    this.showEdit = false;
  }
}