import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-hero',
  standalone: false,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {

  constructor(private router: Router, private authService: AuthService) {}

  goToAppointments(): void {
    if (this.authService.isLoggedIn() && this.authService.getRolId() === 1) {
      this.router.navigate(['/appointments']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}