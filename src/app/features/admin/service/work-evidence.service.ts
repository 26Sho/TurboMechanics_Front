import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
export interface WorkEvidenceResponse {
  id: number;
  workOrderId: number;
  workOrderNumber: string;
  fileName: string;
  evidenceType: 'IMAGEN' | 'VIDEO' | 'DOCUMENTO';
  mimeType: string;
  filePath: string;
  fileUrl: string;
  fileSizeBytes: number;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WorkEvidenceService {

  private readonly baseUrl = `${environment.apiUrl}/evidencias`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getEvidences(workOrderId: number, tipo?: string): Observable<WorkEvidenceResponse[]> {
    let params = new HttpParams().set('ordenId', workOrderId.toString());
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<WorkEvidenceResponse[]>(this.baseUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  uploadEvidence(
    workOrderId: number,
    file: File,
    description?: string
  ): Observable<WorkEvidenceResponse> {
    const formData = new FormData();
    formData.append('ordenId', workOrderId.toString());
    formData.append('file', file);
    if (description) formData.append('descripcion', description);
    return this.http.post<WorkEvidenceResponse>(this.baseUrl, formData, {
      headers: this.getHeaders()
    });
  }

  deleteEvidence(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
