import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssignMechanicRequest, MechanicAvailabilityDTO, StateOrder, WorkOrderRequest, WorkOrderResponse, WorkOrderUpdateRequest } from '../models/work-order';

import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class WorkOrderService {

  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  create(data: WorkOrderRequest): Observable<WorkOrderResponse> {
    return this.http.post<WorkOrderResponse>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  list(): Observable<WorkOrderResponse[]> {
    return this.http.get<WorkOrderResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<WorkOrderResponse> {
    return this.http.get<WorkOrderResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Verifica si el cliente tiene órdenes previas — 200 si existe, 404 si no
  clientExists(identification: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/client/exists/${identification}`,{ headers: this.getHeaders() });
  }

  getByNumber(numberorder: string): Observable<WorkOrderResponse> {
    return this.http.get<WorkOrderResponse>(`${this.apiUrl}/number/${numberorder}`, { headers: this.getHeaders() });
  }

  listByPlate(plate: string): Observable<WorkOrderResponse[]> {
    return this.http.get<WorkOrderResponse[]>(`${this.apiUrl}/plate/${plate}`, { headers: this.getHeaders() });
  }

  listByClient(identification: string): Observable<WorkOrderResponse[]> {
    return this.http.get<WorkOrderResponse[]>(`${this.apiUrl}/client/${identification}`, { headers: this.getHeaders() });
  }

  listByState(state: StateOrder): Observable<WorkOrderResponse[]> {
    return this.http.get<WorkOrderResponse[]>(`${this.apiUrl}/state/${state}`, { headers: this.getHeaders() });
  }

  update(id: number, data: WorkOrderUpdateRequest): Observable<{ message: string; order: WorkOrderResponse }> {
    return this.http.put<{ message: string; order: WorkOrderResponse }>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  cancel(id: number, cancellationreason: string): Observable<{ message: string; order: WorkOrderResponse }> {
    return this.http.patch<{ message: string; order: WorkOrderResponse }>(`${this.apiUrl}/${id}/cancel`, { cancellationreason }, { headers: this.getHeaders() });
  }

  changeState(id: number, state: StateOrder): Observable<{ message: string; order: WorkOrderResponse }> {
    return this.http.patch<{ message: string; order: WorkOrderResponse }>(
      `${this.apiUrl}/${id}/state`,
      { state },
      { headers: this.getHeaders() }
    );
  }

  getMechanicAvailability(): Observable<MechanicAvailabilityDTO[]> {
    return this.http.get<MechanicAvailabilityDTO[]>(
      `${environment.apiUrl}/mecanicos/disponibilidad`,
      { headers: this.getHeaders() }
    );
  }

  assignMechanic(orderId: number, mechanicDocument: number): Observable<WorkOrderResponse> {
    const body: AssignMechanicRequest = { mechanicDocument };
    return this.http.post<WorkOrderResponse>(
      `${environment.apiUrl}/mecanicos/ordenes/${orderId}/asignar`,
      body,
      { headers: this.getHeaders() }
    );
  }

  unassignMechanic(orderId: number): Observable<WorkOrderResponse> {
    return this.http.delete<WorkOrderResponse>(
      `${environment.apiUrl}/mecanicos/ordenes/${orderId}/desasignar`,
      { headers: this.getHeaders() }
    );
  }
}