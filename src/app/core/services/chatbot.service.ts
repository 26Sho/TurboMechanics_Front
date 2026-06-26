import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface ChatbotResponse {
  reply: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {

  private apiUrl = `${environment.apiUrl}/chatbot/message`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(this.apiUrl, { message });
  }
}
