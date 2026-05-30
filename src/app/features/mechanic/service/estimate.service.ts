import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Estimate {
  id: number;
  workOrder: { id: number; numberorder: string };
  users: { id: number; username: string; identification: number };
  vehicle: { plate: string };
  detailJson: string;
  totalEstimate: number;
  statusEstimate: 'SENT' | 'APPROVED' | 'REJECTED';
  dateSent: string;
  dateResponse?: string;
}

export interface SentEstimateRequest {
  workOrderId: number;
  identification: number;
  plate: string;
  detailJson: string;
  totalEstimate: number;
  canal: string;
}

@Injectable({ providedIn: 'root' })
export class EstimateService {

  private readonly apiUrl = 'http://localhost:9090/presupuestos';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  send(data: SentEstimateRequest): Observable<Estimate> {
    return this.http.post<Estimate>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  response(id: number, approved: boolean): Observable<Estimate> {
    const params = new HttpParams().set('approved', approved);
    return this.http.patch<Estimate>(`${this.apiUrl}/${id}/respuesta`, {}, { headers: this.getHeaders(), params });
  }

  list(identification: number, plate?: string): Observable<Estimate[]> {
    let params = new HttpParams().set('identification', identification);
    if (plate) params = params.set('plate', plate);
    return this.http.get<Estimate[]>(this.apiUrl, { headers: this.getHeaders(), params });
  }
}