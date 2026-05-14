import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovementPay, RegisterMovementRequest } from '../../../core/models/billing.model';

@Injectable({ providedIn: 'root' })
export class MovementService {

  private readonly apiUrl = 'http://localhost:9090/movimientos';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  register(data: RegisterMovementRequest): Observable<MovementPay> {
    return this.http.post<MovementPay>(this.apiUrl, data, { headers: this.getHeaders() });
  }
}