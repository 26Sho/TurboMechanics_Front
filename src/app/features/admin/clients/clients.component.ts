import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/services/toast.service';
import { AdminService, UserRequest, UserResponse, WorkOrderResponse } from '../service/admin.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  statusClass(estado: string): string {
    switch (estado) {
      case 'RECIBIDO':
        return 'badge badge--info';
      case 'EN_DIAGNOSTICO':
      case 'EN_REPARACION':
        return 'badge badge--warning';
      case 'LISTO':
        return 'badge badge--success';
      case 'ENTREGADO':
        return 'badge badge--info';
      case 'CANCELADO':
        return 'badge badge--danger';
      default:
        return 'badge badge--neutral';
    }
  }

  verDetalles(_t23: UserResponse) {
    throw new Error('Method not implemented.');
  }
  nuevoCliente() {
    throw new Error('Method not implemented.');
  }

  search = '';
  clients: UserResponse[] = [];
  isLoading = false;

  // Modal historial
  showHistory = false;
  historyClient: UserResponse | null = null;
  history: WorkOrderResponse[] = [];
  loadingHistory = false;

  // Modal edición
  showEdit = false;
  editForm: UserRequest = { username: '', identification: 0, phone: '', email: '' };
  savingEdit = false;

  // Modal eliminar
  showDeleteModal = false;
  clientToDelete: UserResponse | null = null;
  deleting = false;

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

  eliminarCliente(client: UserResponse, event: Event): void {
    event.stopPropagation();
    this.clientToDelete = client;
    this.showDeleteModal = true;
  }

  confirmarEliminar(): void {
    if (!this.clientToDelete) return;
    this.deleting = true;
    this.adminService.deleteClient(this.clientToDelete.identification).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c.identification !== this.clientToDelete!.identification);
        this.toast.success('Cliente eliminado correctamente');
        this.showDeleteModal = false;
        this.clientToDelete = null;
        this.deleting = false;
      },
      error: () => {
        this.toast.error('Error al eliminar el cliente');
        this.deleting = false;
      }
    });
  }

  cancelarEliminar(): void {
    this.showDeleteModal = false;
    this.clientToDelete = null;
  }

  get esAdmin(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Number(payload.rolId) === 3;
    } catch {
      return false;
    }
  }

  cerrarModales(): void {
    this.showHistory = false;
    this.showEdit = false;
    this.showDeleteModal = false;
  }
}