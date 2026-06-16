import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repuesto {
  id:          number;
  name:        string;
  reference:   string;
  stock:       number;
  stockMin:    number;
  price:       number;
  category:    string;
  statusStock: string;
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

  private base = 'http://localhost:9090';

  constructor(private http: HttpClient) {}

  getRepuestos(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(`${this.base}/tienda/repuestos`);
  }

  comprarRepuesto(body: CompraRepuestoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.base}/tienda/comprar`, body);
  }
}
