import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehiculoClienteRequest, VehiculoClienteResponse } from '../models/vehiculo-cliente';

@Injectable({ providedIn: 'root' })
export class ClienteVehicleService {

  private apiUrl = 'http://localhost:9090/cliente/vehiculos';

  constructor(private http: HttpClient) {}

  /** POST /cliente/vehiculos — registra un vehiculo */
  register(data: VehiculoClienteRequest): Observable<VehiculoClienteResponse> {
    return this.http.post<VehiculoClienteResponse>(this.apiUrl, data);
  }

  /** GET /cliente/vehiculos — lista los vehiculos del cliente */
  list(): Observable<VehiculoClienteResponse[]> {
    return this.http.get<VehiculoClienteResponse[]>(this.apiUrl);
  }

  /** PUT /cliente/vehiculos/:id — actualiza un vehiculo */
  update(id: number, data: VehiculoClienteRequest): Observable<VehiculoClienteResponse> {
    return this.http.put<VehiculoClienteResponse>(`${this.apiUrl}/${id}`, data);
  }

  /** DELETE /cliente/vehiculos/:id — elimina un vehiculo */
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}