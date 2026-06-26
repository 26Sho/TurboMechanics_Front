import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
export interface UserResponse {
  id: number;
  username: string;
  identification: number;
  phone: string;
  email: string;
  rolId: number;
}

export interface UserRequest {
  username: string;
  identification: number;
  phone: string;
  email: string;
}

export interface WorkOrderResponse {
  id: number;
  numberorder: string;
  clientname: string;
  clientidentification: string;
  clientphone: string;
  vehicleplate: string;
  vehiclebrand: string;
  vehiclemodel: string;
  vehicleyear: number;
  vehiclecolor: string;
  failuresreported: string;
  dateentry: string;
  dateestimateddelivery: string;
  levelfuel: string;
  statescratches: string;
  statedents: string;
  accessoriesobservations: string;
  stateorder: string;
  priority: string;
  createdBy: string;
  datecreation: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // GET /admin/users
  getAllClients(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`);
  }

  // GET /admin/users/{identification}
  getClientByIdentification(identification: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users/${identification}`);
  }

  // GET /admin/users/{identification}/history
  getServiceHistory(identification: number): Observable<WorkOrderResponse[]> {
    return this.http.get<WorkOrderResponse[]>(`${this.apiUrl}/users/${identification}/history`);
  }

  // PUT /admin/users/{identification}
  updateClient(identification: number, data: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${identification}`, data);
  }

  // DELETE /admin/users/{identification}
  deleteClient(identification: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${identification}`);
  }
}