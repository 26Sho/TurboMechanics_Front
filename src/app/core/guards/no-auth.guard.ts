import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Si ya está autenticado, redirige según rol
  if (authService.getRolId() === 3) {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/home']);
  }
  return false;
};