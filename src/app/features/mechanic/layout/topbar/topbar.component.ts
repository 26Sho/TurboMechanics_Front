import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../service/sidebar.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  sidebarService = inject(SidebarService);
  authService    = inject(AuthService);
  router         = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}