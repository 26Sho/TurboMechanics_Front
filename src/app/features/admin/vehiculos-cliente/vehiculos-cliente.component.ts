import { Component, OnInit } from '@angular/core';
import { AdminVehiculosClienteService } from '../service/admin-vehiculos-cliente.service';
import { VehiculoClienteResponse } from 'src/app/core/models/vehiculo-cliente';

@Component({
  standalone: false,
  selector: 'app-admin-vehiculos-cliente',
  templateUrl: './vehiculos-cliente.component.html',
  styleUrls: ['./vehiculos-cliente.component.scss']
})
export class AdminVehiculosClienteComponent implements OnInit {

  vehiculos: VehiculoClienteResponse[] = [];
  loading = false;

  // ── Filtros ──────────────────────────────────────────────────
  filterPlaca   = '';
  filterMarca   = '';
  filterCliente = '';

  // ── Detalle modal ────────────────────────────────────────────
  showDetail = false;
  detailVehiculo: VehiculoClienteResponse | null = null;

  constructor(private adminVehiculosService: AdminVehiculosClienteService) {}

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos(): void {
    this.loading = true;
    this.adminVehiculosService.listAll().subscribe({
      next: (data) => { this.vehiculos = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get vehiculosFiltrados(): VehiculoClienteResponse[] {
    return this.vehiculos.filter(v => {
      const placa   = v.placa.toLowerCase().includes(this.filterPlaca.toLowerCase());
      const marca   = v.marca.toLowerCase().includes(this.filterMarca.toLowerCase());
      const cliente = this.filterCliente
        ? (v.nombreUsuario || '').toLowerCase().includes(this.filterCliente.toLowerCase())
        : true;
      return placa && marca && cliente;
    });
  }

  openDetail(v: VehiculoClienteResponse): void {
    this.detailVehiculo = v;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detailVehiculo = null;
  }
}