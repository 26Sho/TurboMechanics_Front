import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  isRegister = false;

  toggle() {
    this.isRegister = !this.isRegister;
  }

  // LOGIN
  loginEmail = '';
  loginPassword = '';

  login() {
    if (!this.loginEmail || !this.loginPassword) {
      alert('Todos los campos son obligatorios');
      return;
    }

    this.authService.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: (response) => {
        if (response?.jwt) {
          this.router.navigate(['/home']);
        } else {
          alert(response?.message || 'Usuario no encontrado');
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Error en login');
      }
    });
  }

  goToRecover() {
    this.router.navigate(['/recover-password']);
  }

  // REGISTER
  registerForm: FormGroup;
  showPolicy = false;

  register() {
    if (!this.registerForm.valid) {
      alert('Completa todos los campos y acepta el tratamiento de datos.');
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        alert('¡Registro exitoso!');
        this.registerForm.reset();
        this.isRegister = false;
      },
      error: (err) => {
        alert(err.error?.message || 'Error en registro');
      }
    });
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      identification: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      consentimiento: [false, Validators.requiredTrue]
    });
  }
}