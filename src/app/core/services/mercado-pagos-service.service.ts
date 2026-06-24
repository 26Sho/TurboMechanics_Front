import { Injectable } from "@angular/core";
import { CreatePaymentRequest, CreatePaymentResponse, Payment } from "../models/billing.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class MercadoPagoService {

  private readonly apiUrl = 'http://localhost:9090/payments';

  constructor(private http: HttpClient) {}

  createPreference(req: CreatePaymentRequest): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(this.apiUrl, req);
  }

  getByBill(billId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/bill/${billId}`);
  }

  checkStatus(paymentId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/${paymentId}/check`, { responseType: 'text' });
  }
}