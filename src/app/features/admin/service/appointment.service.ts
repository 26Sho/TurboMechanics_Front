import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
export interface Appointment {
  id: number;
  users: { id: number; username: string; identification: number };
  vehicle: { plate: string };
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Reprogrammed' | 'Cancelled' | 'Completed';
  createdBy: string;
}

export interface AvailabilityResponse {
  availableSlots: string[];
  occupiedSlots: string[];
}

export interface CreateAppointmentRequest {
  identification: number;
  plate: string;
  date: string;
  time: string;
  reason: string;
  createdBy: string;
}

export interface RescheduleRequest {
  newDate: string;
  newTime: string;
}

export interface SendReminderRequest {
  appointmentId: number;
  canal: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  create(data: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  daily(date: string): Observable<Appointment[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Appointment[]>(`${this.apiUrl}/agenda/daily`, { headers: this.getHeaders(), params });
  }

  weekly(start: string, end: string): Observable<Appointment[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<Appointment[]>(`${this.apiUrl}/agenda/weekly`, { headers: this.getHeaders(), params });
  }

  reschedule(id: number, data: RescheduleRequest): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/reschedule`, data, { headers: this.getHeaders() });
  }

  // ← Cambiado: recibe reason en lugar de adminEmail y mecanicoEmail
  cancel(id: number, reason: string): Observable<Appointment> {
    const params = new HttpParams().set('reason', reason);
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders(), params });
  }

  availability(date: string): Observable<AvailabilityResponse> {
    const params = new HttpParams().set('date', date);
    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/availability`, { headers: this.getHeaders(), params });
  }

  sendReminder(data: SendReminderRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reminder`, data, { headers: this.getHeaders() });
  }

  byCustomer(identification: number): Observable<Appointment[]> {
    const params = new HttpParams().set('identification', identification);
    return this.http.get<Appointment[]>(`${this.apiUrl}/customer`, { headers: this.getHeaders(), params });
  }
}