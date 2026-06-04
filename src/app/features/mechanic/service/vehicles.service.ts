import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
    // URL de backend
    private apiUrl = '';

  constructor(private http: HttpClient) { }

  getVehicles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}