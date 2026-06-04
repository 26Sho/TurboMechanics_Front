import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bill, GenerateBillRequest } from '../../../core/models/billing.model';

@Injectable({ providedIn: 'root' })
export class BillingService {

  private readonly apiUrl = 'http://localhost:9090/facturas';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  generate(data: GenerateBillRequest): Observable<Bill> {
    return this.http.post<Bill>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  assign(id: number, identification: number, plate: string): Observable<Bill> {
    const params = new HttpParams()
      .set('identfication', identification)
      .set('plate', plate);
    return this.http.patch<Bill>(`${this.apiUrl}/${id}/asignar`, {}, { headers: this.getHeaders(), params });
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  sendProof(id: number, canal: string): Observable<void> {
    const params = new HttpParams().set('canal', canal);
    return this.http.post<void>(`${this.apiUrl}/${id}/comprobante`, {}, { headers: this.getHeaders(), params });
  }

  history(identification: number, plate?: string): Observable<Bill[]> {
    let params = new HttpParams().set('identification', identification);
    if (plate) params = params.set('plate', plate);
    return this.http.get<Bill[]>(`${this.apiUrl}/historial`, { headers: this.getHeaders(), params });
  }

  report(start: string, end: string): Observable<Bill[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<Bill[]>(`${this.apiUrl}/reporte`, { headers: this.getHeaders(), params });
  }

  cashier(start: string, end: string): Observable<any> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get(`${this.apiUrl}/caja`, { headers: this.getHeaders(), params });
  }

  saveBlobAsPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportCashier(start: string, end: string): Observable<Blob> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get(`${this.apiUrl}/caja/export`, {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }
}