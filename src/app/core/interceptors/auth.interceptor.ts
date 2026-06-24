import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SessionExpiredService } from '../services/session.expired.service';
import { InactivityService } from '../services/inactivity.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const sessionExpiredService = inject(SessionExpiredService);
  const inactivityService = inject(InactivityService);

  const token = sessionStorage.getItem('token');

  // Cualquier petición real al backend cuenta como actividad del usuario,
  // así que reseteamos el contador de inactividad de 30 min.
  if (token && !req.url.includes('/auth/refresh')) {
    inactivityService.registerActivity();
  }

  const clonedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // No es 401 o es el mismo endpoint de refresh → propagar sin más
      if (error.status !== 401 || req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      // El usuario cerró sesión voluntariamente → NO mostrar modal
      if (authService.intentionalLogout) {
        return throwError(() => error);
      }

      // No hay token en sesión (usuario no logueado) → no mostrar modal
      if (!sessionStorage.getItem('token')) {
        return throwError(() => error);
      }

      // Hay token activo → intentar renovarlo
      return authService.refreshToken().pipe(
        switchMap(res => {
          if (res?.jwt) {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.jwt}` }
            });
            return next(retryReq);
          }
          // Refresh no devolvió token → sesión realmente expirada
          authService.logout();
          sessionExpiredService.show();
          return throwError(() => error);
        }),
        catchError(() => {
          // Refresh falló → mostrar modal solo si fue expiración real
          if (!authService.intentionalLogout) {
            authService.logout();
            sessionExpiredService.show();
          }
          return throwError(() => error);
        })
      );
    })
  );
};