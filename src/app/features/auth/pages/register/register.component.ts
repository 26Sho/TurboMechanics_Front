import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm  = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form: FormGroup;
  isLoading    = false;
  showPassword = false;
  showConfirm  = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group(
      {
        username:        ['', Validators.required],
        identification:  ['', Validators.required],
        phone:           ['', Validators.required],
        email:           ['', [Validators.required, Validators.email]],
        address:         ['', Validators.required],
        password:        ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.hasError('passwordMismatch')) {
        this.toast.warning('Las contraseñas no coinciden.');
      } else {
        this.toast.warning('Por favor completa todos los campos correctamente.');
      }
      return;
    }

    this.isLoading = true;

    // Exclude confirmPassword before sending to API
    const { confirmPassword, ...payload } = this.form.value;

    this.authService.register(payload).subscribe({
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
