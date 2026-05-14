import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StateOrder, WorkOrderRequest, WorkOrderResponse, WorkOrderUpdateRequest } from '../models/work-order';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {

  private readonly apiUrl = 'http://localhost:9090/orders';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  create(data: WorkOrderRequest): Observable<WorkOrderResponse> {
    console.log('🚀 WorkOrderService.create llamado', data);  // ← AGREGAR

    return this.http.post<WorkOrderResponse>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  list(): Observable<WorkOrderResponse[]> {
    return this.http.get<WorkOrderResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<WorkOrderResponse> {
    return this.http.get<WorkOrderResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
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
    return this.http.patch<{ message: string; order: WorkOrderResponse }>(`${this.apiUrl}/${id}/cancel`,{ cancellationreason },{ headers: this.getHeaders() });
  }
}
