import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
export interface Repuesto {
  id:          number;
  name:        string;
  reference:   string;
  stock:       number;
  stockMin:    number;
  price:       number;
  category:    string;
  statusStock: string;
  imageUrl?:   string;
}

export interface CompraRepuestoRequest {
  sparePartId:    number;
  payerEmail:     string;
  payerFirstName?: string;
  payerLastName?:  string;
}

export interface PagoResponse {
  paymentId:         number;
  externalReference: string;
  initPoint:         string;
  preferenceId:      string;
  status:            string;
  publicKey:         string;
}

@Injectable({ providedIn: 'root' })
export class TiendaService {

  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getRepuestos(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(`${this.base}/tienda/repuestos`);
  }

  comprarRepuesto(body: CompraRepuestoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.base}/tienda/comprar`, body);
  }
}