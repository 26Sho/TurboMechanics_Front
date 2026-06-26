import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
export interface Estimate {
  id: number;
  workOrder: { id: number; numberorder: string };
  users: { id: number; username: string; identification: number };
  vehicle: { plate: string };
  description: string;
  totalEstimate: number;
  statusEstimate: 'SENT' | 'APPROVED' | 'REJECTED';
  dateSent: string;
  dateResponse?: string;
}

export interface SentEstimateRequest {
  workOrderId: number;
  identification: number;
  plate: string;
  description: string;
  totalEstimate: number;
  canal: string;
}

@Injectable({ providedIn: 'root' })
export class EstimateService {

  private readonly apiUrl = `${environment.apiUrl}/presupuestos`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  send(data: SentEstimateRequest): Observable<Estimate> {
    return this.http.post<Estimate>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  response(id: number, approved: boolean): Observable<Estimate> {
    const params = new HttpParams().set('approved', approved);
    return this.http.patch<Estimate>(`${this.apiUrl}/${id}/response`, {}, { headers: this.getHeaders(), params });
  }

  list(identification: number, plate?: string): Observable<Estimate[]> {
    let params = new HttpParams().set('identification', identification);
    if (plate) params = params.set('plate', plate);
    return this.http.get<Estimate[]>(this.apiUrl, { headers: this.getHeaders(), params });
  }

  responseByToken(token: string, approved: boolean) {

  return this.http.put(
    `${this.apiUrl}/estimates/response/${token}?approved=${approved}`,
    {}
  );
}
}