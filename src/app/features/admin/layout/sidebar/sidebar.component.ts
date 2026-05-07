import { Component, inject } from '@angular/core';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  sidebarService: SidebarService = inject(SidebarService);

  navItems = [
  { label: 'Dashboard', route: '/admin/dashboard', badge: 0, icon: `...` },
  { label: 'Órdenes',   route: '/admin/orders',    badge: 7, icon: `...` },
  { label: 'Clientes',  route: '/admin/clients',   badge: 0, icon: `...` },
  { label: 'Vehículos', route: '/admin/vehicles',  badge: 0, icon: `...` },
  { label: 'Servicios', route: '/admin/servicios',  badge: 0, icon: `...` },
  { label: 'Reportes',  route: '/admin/reportes',   badge: 0, icon: `...` },
];
}