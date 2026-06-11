import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../service/sidebar.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  sidebarService = inject(SidebarService);
  authService    = inject(AuthService);
  router         = inject(Router);

  dropdownOpen = false;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-chip') && !target.closest('.user-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  goToProfile(): void {
    this.dropdownOpen = false;
    this.router.navigate(['/admin/perfil']);
  }

  logout(): void {
    this.dropdownOpen = false;
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getInitial(): string {
    const name = this.authService.getUsername();
    return name ? name.charAt(0).toUpperCase() : 'U';
  }
}