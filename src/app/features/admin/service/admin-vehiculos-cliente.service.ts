import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehiculoClienteResponse } from 'src/app/core/models/vehiculo-cliente';

@Injectable({ providedIn: 'root' })
export class AdminVehiculosClienteService {

  private apiUrl = 'http://localhost:9090/cliente/vehiculos';

  constructor(private http: HttpClient) {}

  /** GET /cliente/vehiculos/admin/all — todos los vehiculos */
  listAll(): Observable<VehiculoClienteResponse[]> {
    return this.http.get<VehiculoClienteResponse[]>(`${this.apiUrl}/admin/all`);
  }

  /** GET /cliente/vehiculos/admin/usuario/:id — vehiculos por usuario */
  listByUsuario(usuarioId: number): Observable<VehiculoClienteResponse[]> {
    return this.http.get<VehiculoClienteResponse[]>(`${this.apiUrl}/admin/usuario/${usuarioId}`);
  }
}