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
  token = '';
  newPassword = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  // Step 1 — send email to backend, which emails the reset token
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

  // Step 2 — validate the token the user received by email
  validateToken() {
    if (!this.token.trim()) {
      this.toastService.warning('Please enter the reset code.');
      return;
    }
    this.isLoading = true;
    this.authService.validateResetToken({ token: this.token.trim() }).subscribe({
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

  // Step 3 — set the new password
  resetPassword() {
    if (!this.newPassword.trim()) {
      this.toastService.warning('Please enter a new password.');
      return;
    }
    this.isLoading = true;
    this.authService.resetPassword({ token: this.token.trim(), newPassword: this.newPassword }).subscribe({
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