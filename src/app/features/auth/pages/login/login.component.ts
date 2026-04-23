import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response?.jwt) {
          this.router.navigate(['/home']);
        } else {
          alert(response?.message || 'Este usuario no se encuentra registrado');
        }
      },
      error: (err) => {
        alert('Error: ' + (err.error?.message || 'Contraseña incorrecta'));
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