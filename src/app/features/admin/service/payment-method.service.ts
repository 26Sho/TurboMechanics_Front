import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PayMethod } from '../../../core/models/billing.model';

import { environment } from '../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class PaymentMethodService {

  private readonly apiUrl = `${environment.apiUrl}/metodos-pago`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  list(): Observable<PayMethod[]> {
    return this.http.get<PayMethod[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  create(data: Omit<PayMethod, 'id'>): Observable<PayMethod> {
    return this.http.post<PayMethod>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  update(id: number, data: Partial<PayMethod>): Observable<PayMethod> {
    return this.http.put<PayMethod>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }
}