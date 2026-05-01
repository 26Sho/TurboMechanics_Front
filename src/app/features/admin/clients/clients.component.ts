import { Component } from '@angular/core';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {
eliminar(_t23: any) {
throw new Error('Method not implemented.');
}
editar(_t23: any) {
throw new Error('Method not implemented.');
}
  search = '';
  clients: any[] = [];

  get filteredClients() {
    const q = this.search.trim();
    return !q ? this.clients : this.clients.filter(c => c.documento.includes(q));
  }

  editClient(client: any) {
    console.log('Editar cliente:', client);
    // Aquí luego puedes abrir un modal o formulario
  }

  deleteClient(client: any) {
    const confirmDelete = confirm(`¿Eliminar a ${client.name}?`);
    if (confirmDelete) {
      this.clients = this.clients.filter(c => c !== client);
    }
  }
  verDetalles(client: any) {
    alert(`Detalles de ${client.name}:\nDocumento: ${client.documento}\nEmail: ${client.email}`);
  }

  // Funciones para que los botones respondan
  nuevoCliente() {
    alert('Abriendo formulario para nuevo cliente...');
  }
}
