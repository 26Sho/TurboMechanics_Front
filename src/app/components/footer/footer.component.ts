import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  currentYear = new Date().getFullYear();

  constructor(private router: Router, private authService: AuthService) {}

  /** True si el usuario logueado es CLIENTE (rolId === 1) */
  private get isCliente(): boolean {
    return this.authService.isLoggedIn() && this.authService.getRolId() === 1;
  }

  private isHomePage(): boolean {
    const url = this.router.url;
    return url === '/' || url === '/home' || url.startsWith('/home#') || url === '';
  }

  /** Mismo comportamiento que el navbar: hace scroll si ya estás en home,
   *  o navega a /home con el fragment si estás en otra ruta. */
  scrollTo(id: string): void {
    if (this.isHomePage()) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }
    }
    this.router.navigate(['/home'], { fragment: id });
  }

  /** "Agendar Cita": si es cliente logueado va directo a sus citas,
   *  si no, lo manda a iniciar sesión primero (igual que el navbar). */
  goToAppointments(): void {
    if (this.isCliente) {
      this.router.navigate(['/appointments']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}