import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssociateOwnerRequest, UserResponse, VehicleRequest, VehicleResponse } from '../models/vehicle';

@Injectable({ providedIn: 'root' })
export class VehicleService {

  private readonly apiUrl = 'http://localhost:9090/vehicles';
  private readonly adminUrl = 'http://localhost:9090/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  create(data: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  list(): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getByPlate(plate: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/plate/${plate}`, { headers: this.getHeaders() });
  }

  listByOwner(ownerId: number): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(`${this.apiUrl}/owner/${ownerId}`, { headers: this.getHeaders() });
  }

  listByOwnerIdentification(identification: number): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(`${this.apiUrl}/owner/identification/${identification}`, { headers: this.getHeaders() });
  }

  updateOwner(vehicleId: number, data: AssociateOwnerRequest): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.apiUrl}/${vehicleId}/owner`, data, { headers: this.getHeaders() });
  }

  // Admin: get all users
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.adminUrl}/users`, { headers: this.getHeaders() });
  }
}
