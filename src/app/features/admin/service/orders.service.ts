import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  // URL de backend 
  private apiUrl = `${environment.apiUrl}/workorder`; 

  constructor(private http: HttpClient) { }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}