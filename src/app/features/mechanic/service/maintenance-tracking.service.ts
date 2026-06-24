import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Enums ─────────────────────────────────────────────────────────────────────
export type StateOrder =
  | 'RECIBIDO'
  | 'EN_DIAGNOSTICO'
  | 'EN_REPARACION'
  | 'LISTO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type NotificationChannel = 'Email' | 'Whatsapp' | 'Both';

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface MaintenanceStatusResponse {
  workOrderId:           number;       // ← nuevo
  numberOrder:           string;
  stateOrder:            StateOrder;
  assignedMechanicName:  string;
  serviceDescription:    string;
  dateEntry:             string;
  estimatedDelivery:     string | null;
  vehicleBrand:          string;
  vehicleModel:          string;
  vehiclePlate:          string;
}

export interface Issue {
  id:          number;
  description: string;
  status:      'Open' | 'Closed';
  reportedAt:  string;
  closedAt:    string | null;
  reportedBy:  string;
}

export interface MaintenanceProgress {
  id:           number;
  description:  string;
  registeredAt: string;
  registeredBy: string;
}

export interface NotificationConsent {
  id:         number;
  authorized: boolean;
  channel:    NotificationChannel | null;
}

export interface UpdateTimeRequest {
  workOrderId:       number;
  estimatedDelivery: string;
}

export interface ReportIssueRequest {
  workOrderId:  number;
  description:  string;
  reportedBy:   string;
}

export interface RegisterProgressRequest {
  workOrderId:   number;
  description:   string;
  registeredBy:  string;
}

export interface NotificationConsentRequest {
  identification: number;
  authorized:     boolean;
  channel:        NotificationChannel | null;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceTrackingService {

  private readonly apiUrl = 'http://localhost:9090/maintenance';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Cliente ───────────────────────────────────────────────────────────────

  getStatusByPlate(plate: string): Observable<MaintenanceStatusResponse> {
    const params = new HttpParams().set('plate', plate);
    return this.http.get<MaintenanceStatusResponse>(`${this.apiUrl}/status`, { headers: this.getHeaders(), params });
  }

  getConsent(identification: number): Observable<NotificationConsent> {
    const params = new HttpParams().set('identification', identification);
    return this.http.get<NotificationConsent>(`${this.apiUrl}/consent`, { headers: this.getHeaders(), params });
  }

  saveConsent(data: NotificationConsentRequest): Observable<NotificationConsent> {
    return this.http.post<NotificationConsent>(`${this.apiUrl}/consent`, data, { headers: this.getHeaders() });
  }

  // ── Mecánico ──────────────────────────────────────────────────────────────

  getStatusById(workOrderId: number): Observable<MaintenanceStatusResponse> {
    return this.http.get<MaintenanceStatusResponse>(`${this.apiUrl}/status/${workOrderId}`, { headers: this.getHeaders() });
  }

  updateTime(data: UpdateTimeRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/time`, data, { headers: this.getHeaders() });
  }

  notifyStateChange(workOrderId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${workOrderId}/notify`, {}, { headers: this.getHeaders() });
  }

  reportIssue(data: ReportIssueRequest): Observable<Issue> {
    return this.http.post<Issue>(`${this.apiUrl}/issues`, data, { headers: this.getHeaders() });
  }

  closeIssue(issueId: number): Observable<Issue> {
    return this.http.patch<Issue>(`${this.apiUrl}/issues/${issueId}/close`, {}, { headers: this.getHeaders() });
  }

  getIssues(workOrderId: number): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.apiUrl}/${workOrderId}/issues`, { headers: this.getHeaders() });
  }

  registerProgress(data: RegisterProgressRequest): Observable<MaintenanceProgress> {
    return this.http.post<MaintenanceProgress>(`${this.apiUrl}/progress`, data, { headers: this.getHeaders() });
  }

  getProgress(workOrderId: number): Observable<MaintenanceProgress[]> {
    return this.http.get<MaintenanceProgress[]>(`${this.apiUrl}/${workOrderId}/progress`, { headers: this.getHeaders() });
  }
}