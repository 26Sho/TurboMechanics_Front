import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.rolId === 3) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}