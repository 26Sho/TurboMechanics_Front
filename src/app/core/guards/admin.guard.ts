import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('adminGuard rolId:', authService.getRolId());
  console.log('isLoggedIn:', authService.isLoggedIn());

  if (authService.isLoggedIn() && authService.getRolId() === 3) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};