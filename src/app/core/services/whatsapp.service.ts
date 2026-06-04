import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WhatsAppSessionResponse {
  status: 'connecting' | 'qr_pending' | 'open' | 'closed' | 'not_found';
  qr?: string;
}

export interface WhatsAppIncoming {
  sessionId: string;
  from: string;
  messageType: string;
  body: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private base = 'http://localhost:9090/whatsapp';

  constructor(private http: HttpClient) {}

  startSession(sessionId: string): Observable<WhatsAppSessionResponse> {
    return this.http.post<WhatsAppSessionResponse>(
      `${this.base}/sessions/${sessionId}/start`, {}
    );
  }

  getQR(sessionId: string): Observable<WhatsAppSessionResponse> {
    return this.http.get<WhatsAppSessionResponse>(
      `${this.base}/sessions/${sessionId}/qr`
    );
  }

  getStatus(sessionId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(
      `${this.base}/sessions/${sessionId}/status`
    );
  }

  logout(sessionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/sessions/${sessionId}`
    );
  }

  sendText(sessionId: string, to: string, message: string): Observable<void> {
    return this.http.post<void>(`${this.base}/send/text`, {
      sessionId, to, message
    });
  }

  sendPDF(sessionId: string, to: string, file: File, caption?: string): Observable<void> {
    const form = new FormData();
    form.append('sessionId', sessionId);
    form.append('to', to);
    form.append('file', file);
    if (caption) form.append('caption', caption);
    return this.http.post<void>(`${this.base}/send/pdf`, form);
  }

  sendExcel(sessionId: string, to: string, file: File, caption?: string): Observable<void> {
    const form = new FormData();
    form.append('sessionId', sessionId);
    form.append('to', to);
    form.append('file', file);
    if (caption) form.append('caption', caption);
    return this.http.post<void>(`${this.base}/send/excel`, form);
  }
}