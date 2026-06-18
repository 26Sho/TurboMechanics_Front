import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LoginRequest, LoginResponse, MessageResponse, RefreshTokenResponse,
  RegisterRequest, ForgotPasswordRequest, ValidateResetTokenRequest, ResetPasswordRequest
} from '../models/auth';
import { SessionExpiredService } from './session.expired.service';

/**
 * Tiempo máximo de INACTIVIDAD antes de mostrar el modal de sesión expirada.
 * Si el usuario sigue navegando (clicks, teclado, scroll) el token se renueva
 * silenciosamente y nunca ve el modal.
 * 30 minutos = 30 * 60 * 1000 ms
 */
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Cada cuánto tiempo se revisa si el token está próximo a vencer.
 * 4 minutos → se renueva cuando queden ~5 min (si el token dura 60 min).
 */
const PROACTIVE_REFRESH_INTERVAL_MS = 4 * 60 * 1000;

/**
 * Cuántos milisegundos antes del vencimiento del token se renueva proactivamente.
 * 5 minutos → si el token vence en menos de 5 min, se pide uno nuevo.
 */
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {

  private apiUrl = 'http://localhost:9090/auth';

  private authState$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  authChanged = this.authState$.asObservable();

  /** Marca si el logout fue voluntario (clic en "Cerrar sesión"). */
  private _intentionalLogout = false;
  get intentionalLogout(): boolean { return this._intentionalLogout; }

  // ─── Inactividad ────────────────────────────────────────────────────────────
  private lastActivityTime = Date.now();
  private inactivityCheckInterval: ReturnType<typeof setInterval> | null = null;
  private proactiveRefreshInterval: ReturnType<typeof setInterval> | null = null;
  private boundActivityHandler = () => this.onUserActivity();

  constructor(
    private http: HttpClient,
    private sessionExpiredService: SessionExpiredService,
    private ngZone: NgZone
  ) {
    // Si ya hay sesión activa al arrancar, iniciar los timers
    if (this.isLoggedIn()) {
      this.startActivityTracking();
    }
  }

  // ─── Registro / Login ────────────────────────────────────────────────────────

  register(data: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        if (res.jwt) {
          this._intentionalLogout = false;
          sessionStorage.setItem('token', res.jwt);
          sessionStorage.setItem('email', data.email);
          try {
            const base64 = res.jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
              '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')));
            sessionStorage.setItem('username', payload.sub || data.email);
          } catch { sessionStorage.setItem('username', data.email); }
          sessionStorage.setItem('rolId', String(res.rolId));
          this.authState$.next(true);
          this.startActivityTracking();
        }
      })
    );
  }

  getUsername(): string { return sessionStorage.getItem('username') || ''; }
  getEmail(): string    { return sessionStorage.getItem('email') || ''; }
  getRolId(): number    { return Number(sessionStorage.getItem('rolId')); }

  // ─── Refresh token ───────────────────────────────────────────────────────────

  refreshToken(): Observable<RefreshTokenResponse> {
    return this.http.get<RefreshTokenResponse>(`${this.apiUrl}/refresh`).pipe(
      tap(res => { if (res.jwt) sessionStorage.setItem('token', res.jwt); })
    );
  }

  getToken(): string | null { return sessionStorage.getItem('token'); }
  isLoggedIn(): boolean     { return !!this.getToken(); }

  /** Cierre de sesión voluntario — limpia todo sin mostrar modal de expiración. */
  logout(): void {
    this._intentionalLogout = true;
    this.stopActivityTracking();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('rolId');
    this.authState$.next(false);
  }

  // ─── Password Reset ──────────────────────────────────────────────────────────

  forgotPassword(data: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, data);
  }

  validateResetToken(data: ValidateResetTokenRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/validate-code`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, data);
  }

  // ─── Tracking de actividad e inactividad ────────────────────────────────────

  private startActivityTracking(): void {
    this.lastActivityTime = Date.now();

    // Escuchar eventos de actividad del usuario
    ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'].forEach(evt =>
      window.addEventListener(evt, this.boundActivityHandler, { passive: true })
    );

    // Correr fuera de la zona de Angular para no disparar change detection cada tick
    this.ngZone.runOutsideAngular(() => {

      // 1️⃣ Verificar inactividad cada minuto
      this.inactivityCheckInterval = setInterval(() => {
        const idle = Date.now() - this.lastActivityTime;
        if (idle >= INACTIVITY_TIMEOUT_MS && this.isLoggedIn()) {
          this.ngZone.run(() => {
            this.logout();
            this.sessionExpiredService.show();
          });
        }
      }, 60_000);

      // 2️⃣ Refresh proactivo: cada N minutos, si el token está próximo a vencer
      this.proactiveRefreshInterval = setInterval(() => {
        if (!this.isLoggedIn() || this._intentionalLogout) return;

        const token = this.getToken();
        if (!token) return;

        try {
          const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          ).join('')));

          const expiresAt = payload.exp * 1000; // exp viene en segundos
          const timeLeft  = expiresAt - Date.now();

          // Si quedan menos de REFRESH_THRESHOLD_MS → renovar silenciosamente
          if (timeLeft > 0 && timeLeft < REFRESH_THRESHOLD_MS) {
            this.ngZone.run(() => {
              this.refreshToken().subscribe({
                error: () => {
                  // Si falla el proactivo, el interceptor se encargará cuando
                  // la siguiente petición real devuelva 401
                }
              });
            });
          }
        } catch {
          // No se pudo leer el token — dejar que el interceptor maneje el 401
        }
      }, PROACTIVE_REFRESH_INTERVAL_MS);
    });
  }

  private stopActivityTracking(): void {
    ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'].forEach(evt =>
      window.removeEventListener(evt, this.boundActivityHandler)
    );
    if (this.inactivityCheckInterval)  { clearInterval(this.inactivityCheckInterval);  this.inactivityCheckInterval  = null; }
    if (this.proactiveRefreshInterval) { clearInterval(this.proactiveRefreshInterval); this.proactiveRefreshInterval = null; }
  }

  private onUserActivity(): void {
    this.lastActivityTime = Date.now();
  }

  ngOnDestroy(): void {
    this.stopActivityTracking();
  }
}