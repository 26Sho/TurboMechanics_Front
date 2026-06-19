import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { SessionExpiredService } from './session.expired.service';

/**
 * Controla dos timers independientes:
 *
 * 1. REFRESH SILENCIOSO: cada REFRESH_INTERVAL_MS (8 min, antes de que el
 *    JWT de 10 min expire) pide un token nuevo en segundo plano, sin que
 *    el usuario note nada — siempre que la sesión esté activa.
 *
 * 2. INACTIVIDAD REAL: si pasan INACTIVITY_LIMIT_MS (30 min) SIN clicks
 *    ni peticiones HTTP al backend, se fuerza logout y se muestra el
 *    modal de "Sesión expirada", sin importar que el token se haya
 *    seguido refrescando.
 *
 * registerActivity() lo llama el interceptor (en cada petición HTTP) y
 * un listener global de 'click' registrado aquí mismo.
 */
@Injectable({ providedIn: 'root' })
export class InactivityService implements OnDestroy {

  private readonly REFRESH_INTERVAL_MS = 8 * 60 * 1000;   // 8 min
  private readonly INACTIVITY_LIMIT_MS = 30 * 60 * 1000;  // 30 min

  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  private clickListener = () => this.registerActivity();

  constructor(
    private authService: AuthService,
    private sessionExpiredService: SessionExpiredService,
    private zone: NgZone
  ) {
    // Reacciona a login/logout para arrancar o detener los timers
    this.authService.authChanged.subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.start();
      } else {
        this.stop();
      }
    });

    // Si la app se recarga con sesión ya activa
    if (this.authService.isLoggedIn()) {
      this.start();
    }
  }

  /** Arranca ambos timers y el listener de clicks. Se ejecuta fuera de Angular
   *  para no disparar change detection en cada click/tick. */
  start(): void {
    this.stop(); // evita timers duplicados

    this.zone.runOutsideAngular(() => {
      document.addEventListener('click', this.clickListener, { passive: true });

      this.refreshTimer = setInterval(() => {
        this.authService.refreshToken().subscribe({
          error: () => {
            // Si el refresh falla aquí, el interceptor maneja el 401
            // de la siguiente petición real; no hacemos nada más.
          }
        });
      }, this.REFRESH_INTERVAL_MS);

      this.resetInactivityTimer();
    });
  }

  /** Detiene todo (logout, voluntario o forzado). */
  stop(): void {
    document.removeEventListener('click', this.clickListener);

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /** Llamado por el interceptor en cada petición HTTP y por el listener de click. */
  registerActivity(): void {
    if (!this.authService.isLoggedIn()) return;
    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      this.zone.run(() => {
        this.stop();
        this.authService.logout();
        this.sessionExpiredService.show();
      });
    }, this.INACTIVITY_LIMIT_MS);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}