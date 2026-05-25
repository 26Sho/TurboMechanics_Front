import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SessionExpiredService } from '../services/session.expired.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const sessionExpiredService = inject(SessionExpiredService);

  const token = sessionStorage.getItem('token');

  const clonedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Si no es 401 o es la misma petición de refresh, dejamos pasar el error
      if (error.status !== 401 || req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      // Intentamos renovar el token
      return authService.refreshToken().pipe(
        switchMap(res => {
          if (res?.jwt) {
            // Token renovado: repetir la petición original con el nuevo token
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.jwt}` }
            });
            return next(retryReq);
          }
          // No llegó token nuevo → sesión expirada
          authService.logout();
          sessionExpiredService.show();
          return throwError(() => error);
        }),
        catchError(() => {
          // El refresh también falló → sesión expirada
          authService.logout();
          sessionExpiredService.show();
          return throwError(() => error);
        })
      );
    })
  );
};