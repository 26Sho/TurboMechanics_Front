import { Component, inject } from '@angular/core';
import { SidebarService } from '../../service/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  sidebarService: SidebarService = inject(SidebarService);

  navItems = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`
    },
    {
      label: 'Órdenes',
      route: '/admin/orders',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
    },
    {
      label: 'Clientes',
      route: '/admin/clients',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/></svg>`
    },
    {
      label: 'Vehículos',
      route: '/admin/vehicles',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/></svg>`
    },

    // 🔥 LOS QUE AGREGASTE (integrados bien)
    {
      label: 'Orden de Trabajo',
      route: '/admin/work-order',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M3 3h18v18H3z"/></svg>`
    },
    {
      label: 'Asociar Vehículo',
      route: '/admin/vehicle-assign',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="12" cy="12" r="10"/></svg>`
    },
    {
      label: 'Historial',
      route: '/admin/vehicle-history',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M12 8v4l3 3"/></svg>`
    },
    {
      label: 'Diagnóstico',
      route: '/admin/diagnosis',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M12 2l9 21H3z"/></svg>`
    },

    // 🔧 originales avanzados
    {
      label: 'Servicios',
      route: '/admin/servicios',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M14.7 6.3l3 3"/></svg>`
    },
    {
      label: 'Repuestos',
      route: '/admin/repuestos',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M21 16V8"/></svg>`
    },
    {
      label: 'Reportes',
      route: '/admin/reportes',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><line x1="12" y1="4" x2="12" y2="20"/></svg>`
    },
    {
      label: 'Mecánicos',
      route: '/admin/mecanicos',
      badge: 0,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
    }
  ];
}