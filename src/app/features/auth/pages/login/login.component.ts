import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { LoginResponse } from 'src/app/core/models/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.toast.warning('Todos los campos son obligatorios.');
      return;
    }
    this.isLoading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        if (response?.jwt) {
          this.toast.success('¡Bienvenido!');
          this.router.navigate(['/home']);
        } else {
          this.toast.error(response.message || 'Credenciales incorrectas.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err.error?.message || 'Error al iniciar sesión.');
      }
    });
  }

  goToRegister()    { this.router.navigate(['/register']); }
  recoverPassword() { this.router.navigate(['/recover-password']); }
}