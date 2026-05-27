import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiagnosisRequest, DiagnosisResponse } from '../../../core/models/diagnosis.model';
import { WorkOrderResponse } from '../../../core/models/work-order';

@Injectable({ providedIn: 'root' })
export class DiagnosisService {

  private readonly apiUrl = 'http://localhost:9090/diagnosis';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  create(data: DiagnosisRequest): Observable<DiagnosisResponse> {
    return this.http.post<DiagnosisResponse>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  update(id: number, data: DiagnosisRequest): Observable<DiagnosisResponse> {
    return this.http.put<DiagnosisResponse>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<DiagnosisResponse> {
    return this.http.get<DiagnosisResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  listByWorkOrder(workOrderId: number): Observable<DiagnosisResponse[]> {
    return this.http.get<DiagnosisResponse[]>(`${this.apiUrl}/order/${workOrderId}`, { headers: this.getHeaders() });
  }

  generateWorkOrder(id: number, createdBy?: string): Observable<{ message: string; order: WorkOrderResponse }> {
    return this.http.post<{ message: string; order: WorkOrderResponse }>(
      `${this.apiUrl}/${id}/generate-order`,
      createdBy ? { createdBy } : {},
      { headers: this.getHeaders() }
    );
  }
}