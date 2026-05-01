import { Component, OnInit, signal, computed } from '@angular/core';
import { VehiclesService } from './vehicles.service'; 

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  search = '';
  
  // Signal para los datos de la BD
  vehicles = signal<any[]>([]);

  constructor(private _vehiclesService: VehiclesService) {}

  ngOnInit(): void {
    this.obtenerVehiculos();
  }

  obtenerVehiculos() {
    this._vehiclesService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
      },
      error: (err) => console.error('Error al cargar vehículos:', err)
    });
  }

  // Lógica de filtrado optimizada
  get filteredVehicles() {
    const q = this.search.trim().toLowerCase();
    return !q ? this.vehicles() : this.vehicles().filter(v =>
      v.plate.toLowerCase().includes(q) || 
      v.brand.toLowerCase().includes(q) || 
      v.owner.toLowerCase().includes(q)
    );
  }

  nuevoVehiculo() {
    console.log('Abriendo modal de nuevo vehículo...');
  }

  verHistorial(v: any) {
    console.log('Viendo historial de placa:', v.plate);
  }
}
