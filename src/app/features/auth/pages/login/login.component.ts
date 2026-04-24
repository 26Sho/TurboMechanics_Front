import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoginResponse } from 'src/app/core/models/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) {
      alert('Todos los campos son obligatorios');
      return;
    }

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: LoginResponse) => {
        if (response?.jwt) {
          this.router.navigate(['/home']);
        } else {
          alert(response.message);
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Error en login');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  recoverPassword() {
    this.router.navigate(['/recover-password']);
  }
}