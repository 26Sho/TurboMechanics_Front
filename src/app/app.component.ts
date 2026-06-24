import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { InactivityService } from './core/services/inactivity.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  private authSub!: Subscription;

  constructor(
    private authService: AuthService,
    // Se inyecta para que su constructor se ejecute al iniciar la app
    // y empiece a vigilar actividad / refrescar token si ya hay sesión.
    private inactivityService: InactivityService
  ) {}

  ngOnInit(): void {
    // Estado inicial (por si ya hay sesión guardada en sessionStorage)
    this.isLoggedIn = this.authService.isLoggedIn();

    // Escucha cambios de autenticación (login / logout)
    this.authSub = this.authService.authChanged.subscribe(
      (loggedIn: boolean) => (this.isLoggedIn = loggedIn)
    );
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}