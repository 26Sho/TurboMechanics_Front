import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  // ── Toggle flip ─────────────────────────────────────────────────────
  isRegister = false;

  toggle() {
    this.isRegister = !this.isRegister;
  }

  // ── Login ────────────────────────────────────────────────────────────
  loginEmail    = '';
  loginPassword = '';

  login() {
    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (response) => {
        if (response?.jwt) {
          this.router.navigate(['/home']);
        } else {
          alert(response?.message || 'Usuario no encontrado');
        }
      },
      error: (err) => {
        alert('Error: ' + (err.error?.message || 'Contraseña incorrecta'));
      }
    });
  }

  goToRecover() {
    this.router.navigate(['/recover-password']);
  }

  // ── Register ─────────────────────────────────────────────────────────
  registerForm: FormGroup;
  showPolicy = false;

  register() {
    if (!this.registerForm.valid) {
      alert('Por favor completa todos los campos y acepta el tratamiento de datos.');
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        this.registerForm.reset();
        this.isRegister = false;
      },
      error: (err) => {
        alert('Error: ' + (err.error?.message || 'No se pudo registrar'));
      }
    });
  }

  // ── Constructor ──────────────────────────────────────────────────────
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name:           ['', Validators.required],
      Document:       ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      telephone:      ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      password:       ['', Validators.required],
      consentimiento: [false, Validators.requiredTrue]
    });
  }
}