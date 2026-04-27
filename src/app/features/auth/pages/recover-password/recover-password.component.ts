import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss'
})
export class RecoverPasswordComponent {

  step: 1 | 2 | 3 = 1;
  isLoading = false;

  email = '';
  code = '';        // ← era "token"
  newPassword = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  // Step 1 — envía el email al backend para recibir el código
  sendEmail() {
    if (!this.email.trim()) {
      this.toastService.warning('Please enter your email address.');
      return;
    }
    this.isLoading = true;
    this.authService.forgotPassword({ emailOrPhone: this.email.trim() }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.success(res.message || 'Reset code sent to your email.');
        this.step = 2;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Email not found.');
      }
    });
  }

  // Step 2 — valida el código recibido por correo
  validateToken() {
    if (!this.code.trim()) {
      this.toastService.warning('Please enter the reset code.');
      return;
    }
    this.isLoading = true;
    this.authService.validateResetToken({
      emailOrPhone: this.email.trim(), // ← agregado
      code: this.code.trim()           // ← era token
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.success(res.message || 'Code validated.');
        this.step = 3;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Invalid or expired code.');
      }
    });
  }

  // Step 3 — establece la nueva contraseña
  resetPassword() {
    if (!this.newPassword.trim()) {
      this.toastService.warning('Please enter a new password.');
      return;
    }
    this.isLoading = true;
    this.authService.resetPassword({
      emailOrPhone: this.email.trim(), // ← agregado
      code: this.code.trim(),          // ← era token
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.success(res.message || 'Password updated successfully!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Could not reset password.');
      }
    });
  }
}