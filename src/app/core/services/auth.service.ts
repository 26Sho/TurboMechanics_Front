import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, MessageResponse, RefreshTokenResponse, RegisterRequest } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:9090/auth';

  private authState$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  authChanged = this.authState$.asObservable();

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        if (res.jwt) {
          localStorage.setItem('token', res.jwt);
          localStorage.setItem('username', data.email);
          this.authState$.next(true);
        }
      })
    );
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    return this.http.get<RefreshTokenResponse>(`${this.apiUrl}/refreshToken`).pipe(
      tap(res => { if (res.jwt) localStorage.setItem('token', res.jwt); })
    );
  }

  getToken(): string | null { return localStorage.getItem('token'); }
  isLoggedIn(): boolean { return !!this.getToken(); }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.authState$.next(false);
  }
}