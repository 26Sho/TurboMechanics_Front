import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LoginRequest, LoginResponse, MessageResponse, RefreshTokenResponse,
  RegisterRequest, ForgotPasswordRequest, ValidateResetTokenRequest, ResetPasswordRequest
} from '../models/auth';

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
          localStorage.setItem('rolId', String(res.rolId));
          this.authState$.next(true);
        }
      })
    );
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getRolId(): number {
    return Number(localStorage.getItem('rolId'));
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
    localStorage.removeItem('rolId');
    this.authState$.next(false);
  }

  // ─── Password Reset ─────────────────────────────────────────────────────────

  forgotPassword(data: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, data);
  }

  validateResetToken(data: ValidateResetTokenRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/validate-code`, data); // ← URL corregida
  }

  resetPassword(data: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, data);
  }
}