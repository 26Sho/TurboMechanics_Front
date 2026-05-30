import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  @Output() loginClick = new EventEmitter<void>();

  isScrolled = false;
  isMobileOpen = false;
  activeSection = 'inicio';
  isLoggedIn = false;
  username = '';
  isMecanicoOrAdmin = false;
  isSoloMecanico = false;
  isAdmin = false;
  isCliente = false;

  private authSub!: Subscription;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.actualizarEstado(this.authService.isLoggedIn());

    this.authSub = this.authService.authChanged.subscribe(loggedIn => {
      this.actualizarEstado(loggedIn);
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  private actualizarEstado(loggedIn: boolean): void {
    this.isLoggedIn = loggedIn;
    this.username = loggedIn ? this.authService.getUsername() : '';
    const rolId = loggedIn ? this.authService.getRolId() : 0;
    this.isMecanicoOrAdmin = [2, 3].includes(rolId);
    this.isSoloMecanico = rolId === 2;
    this.isAdmin = rolId === 3;
    this.isCliente = rolId === 1;

    if (loggedIn && rolId === 3) {
      this.router.navigate(['/admin/dashboard']);
    }
    if (loggedIn && rolId === 2) {        // ← agregar
      this.router.navigate(['/mechanic/dashboard']); // ← agregar
    }
  }

  // ─── Navegación ──────────────────────────────────────────────

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
    this.closeMobile();
  }

  goToWorkOrder(): void {
    this.closeMobile();
    this.router.navigate(['/work-order']);
  }

  goToVehicles(): void {
    this.closeMobile();
    this.router.navigate(['/vehicles']);
  }

  goToVehicleHistory(): void {
    this.closeMobile();
    this.router.navigate(['/vehicle-history']);
  }

  goToAdmin(): void {
    this.closeMobile();
    this.router.navigate(['/admin/dashboard']);
  }

  goToDiagnosis(): void {
    this.closeMobile();
    this.router.navigate(['/diagnosis']);
  }

  goToAppointments(): void {
    this.closeMobile();
    this.router.navigate(['/appointments']);
  }

  goToMechanicAppointments(): void {
    this.closeMobile();
    this.router.navigate(['/mechanic/appointments']);
  }

  goToMaintenance(): void {
    this.closeMobile();
    this.router.navigate(['/maintenance']);
  }

  goToMechanicMaintenance(): void {
    this.closeMobile();
    this.router.navigate(['/mechanic/maintenance']);
  }

  // ─── Scroll ──────────────────────────────────────────────────
  goToMovements(): void {
    this.closeMobile();
    this.router.navigate(['/movements']);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 40;
    this.updateActiveSection();
  }

  private updateActiveSection(): void {
    const sections = ['inicio', 'nosotros', 'servicios', 'ubicacion', 'contacto'];
    for (const id of [...sections].reverse()) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) {
        this.activeSection = id;
        break;
      }
    }
  }

  // ─── Mobile ──────────────────────────────────────────────────

  toggleMobile(): void { this.isMobileOpen = !this.isMobileOpen; }
  closeMobile(): void { this.isMobileOpen = false; }

  onLoginClick(event: Event): void {
    event.preventDefault();
    this.closeMobile();
    this.router.navigate(['/login']);
  }

  scrollTo(id: string): void {
    this.closeMobile();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}