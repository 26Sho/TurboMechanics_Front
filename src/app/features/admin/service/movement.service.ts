import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovementPay, RegisterMovementRequest } from '../../../core/models/billing.model';

import { environment } from '../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class MovementService {

  private readonly apiUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  list(): Observable<MovementPay[]> {
    return this.http.get<MovementPay[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  register(data: RegisterMovementRequest): Observable<MovementPay> {
    return this.http.post<MovementPay>(this.apiUrl, data, { headers: this.getHeaders() });
  }
}