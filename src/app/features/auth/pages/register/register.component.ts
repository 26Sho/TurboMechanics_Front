import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      username:       ['', Validators.required],
      identification: ['', Validators.required],
      phone:          ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      password:       ['', Validators.required]
    });
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Por favor completa todos los campos correctamente.');
      return;
    }
    this.isLoading = true;
    this.authService.register(this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toast.success(res.message || '¡Registro exitoso!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err.error?.message || 'Error en el registro.');
      }
    });
  }

  irALogin() { this.router.navigate(['/login']); }
}