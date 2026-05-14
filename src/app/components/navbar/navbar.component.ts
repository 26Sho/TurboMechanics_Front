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

  isScrolled        = false;
  isMobileOpen      = false;
  activeSection     = 'inicio';
  isLoggedIn        = false;
  username          = '';
  isMecanicoOrAdmin = false;
  isSoloMecanico    = false;
  isAdmin           = false;  // ← agregado

  private authSub!: Subscription;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // Lee el estado actual directamente sin esperar evento
    this.actualizarEstado(this.authService.isLoggedIn());
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
    this.isMecanicoOrAdmin = [2, 3].includes(this.authService.getRolId());
    this.isSoloMecanico = this.authService.getRolId() === 2; //Nuevo

    // Escucha cambios futuros (login / logout)
    this.authSub = this.authService.authChanged.subscribe(loggedIn => {
      this.actualizarEstado(loggedIn);
      this.isLoggedIn = loggedIn;
      this.username = loggedIn ? this.authService.getUsername() : '';
      this.isMecanicoOrAdmin = loggedIn ? [2, 3].includes(this.authService.getRolId()) : false;
      this.isSoloMecanico = loggedIn ? this.authService.getRolId() === 2 : false; //Nuevo
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  // Centraliza la lectura del estado para no duplicar lógica
  private actualizarEstado(loggedIn: boolean): void {
    this.isLoggedIn        = loggedIn;
    this.username          = loggedIn ? this.authService.getUsername() : '';
    const rolId            = loggedIn ? this.authService.getRolId() : 0;
    this.isMecanicoOrAdmin = [2, 3].includes(rolId);
    this.isSoloMecanico    = rolId === 2;
    this.isAdmin           = rolId === 3;  // ← se evalúa siempre al cargar
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

  goToAdmin(): void {  // ← agregado
    this.closeMobile();
    this.router.navigate(['/admin/dashboard']);
  }

  goToDiagnosis(): void {
    this.closeMobile();
    this.router.navigate(['/diagnosis']);
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