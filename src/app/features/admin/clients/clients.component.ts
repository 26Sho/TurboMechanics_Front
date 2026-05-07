import { Component, OnInit } from '@angular/core';
import { AdminService, UserResponse, UserRequest, WorkOrderResponse } from '../admin.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
statusClass(arg0: string): string|string[]|Set<string>|{ [klass: string]: any; }|null|undefined {
throw new Error('Method not implemented.');
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
    if (!confirm(`¿Eliminar a ${client.username}? Esta acción no se puede deshacer.`)) return;
    this.adminService.deleteClient(client.identification).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c.identification !== client.identification);
        this.toast.success('Cliente eliminado correctamente');
      },
      error: () => this.toast.error('Error al eliminar el cliente')
    });
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rolId === 3;
  }

  cerrarModales(): void {
    this.showHistory = false;
    this.showEdit = false;
  }
}