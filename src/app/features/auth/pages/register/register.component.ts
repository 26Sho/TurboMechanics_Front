import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      identification: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  register() {
    if (this.form.invalid) {
      alert('Formulario inválido');
      return;
    }

    this.authService.register(this.form.value).subscribe({
      next: (res) => {
        alert(res.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err.error?.message || 'Error en registro');
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}