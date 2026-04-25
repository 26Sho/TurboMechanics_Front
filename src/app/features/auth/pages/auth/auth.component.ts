import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  isRegister = false;
  toggle() { this.isRegister = !this.isRegister; }

  // LOGIN
  loginEmail = '';
  loginPassword = '';
  loginLoading = false;

  login() {
    if (!this.loginEmail || !this.loginPassword) {
      this.toast.warning('Todos los campos son obligatorios.');
      return;
    }
    this.loginLoading = true;
    this.authService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: (response) => {
        this.loginLoading = false;
        if (response?.jwt) {
          this.toast.success('¡Bienvenido!');
          this.router.navigate(['/home']);
        } else {
          this.toast.error(response?.message || 'Usuario no encontrado.');
        }
      },
      error: (err) => {
        this.loginLoading = false;
        this.toast.error(err.error?.message || 'Error al iniciar sesión.');
      }
    });
  }

  goToRecover() { this.router.navigate(['/recover-password']); }

  // REGISTER
  registerForm: FormGroup;
  showPolicy = false;
  registerLoading = false;

  register() {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      this.toast.warning('Completa todos los campos y acepta el tratamiento de datos.');
      return;
    }
    this.registerLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.registerLoading = false;
        this.toast.success('¡Registro exitoso! Ya puedes iniciar sesión.');
        this.registerForm.reset();
        this.isRegister = false;
      },
      error: (err) => {
        this.registerLoading = false;
        this.toast.error(err.error?.message || 'Error en el registro.');
      }
    });
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.registerForm = this.fb.group({
      username:       ['', Validators.required],
      identification: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
      phone:          ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      password:       ['', Validators.required],
      consentimiento: [false, Validators.requiredTrue]
    });
  }
}