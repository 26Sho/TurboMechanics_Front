import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss'
})
export class RecoverPasswordComponent {
    
  email: string = '';

  constructor(private authService: AuthService) { }

  recoverPassword() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const user = users.find((u: any) => u.email === this.email);

    if (user) {
      alert(`Your password is: ${user.password}`);
    } else {
      alert('Email not found');
    }
  }

  recuperar() {
    console.log('Recuperar contraseña para:', this.email);
  }
}
