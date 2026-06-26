import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ReceptionVoucherService {

  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  downloadVoucherById(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/voucher`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  saveBlobAsPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}