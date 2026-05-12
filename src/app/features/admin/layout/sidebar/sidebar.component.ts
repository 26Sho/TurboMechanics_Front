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
    { label: 'Dashboard', route: '/admin/dashboard', badge: 0, icon: `...` },
    { label: 'Órdenes', route: '/admin/orders', badge: 7, icon: `...` },
    { label: 'Clientes', route: '/admin/clients', badge: 0, icon: `...` },
    { label: 'Vehículos', route: '/admin/vehicles', badge: 0, icon: `...` },
    // ← NUEVO: Orden de Trabajo
    { label: 'Orden de Trabajo', route: '/admin/work-order', badge: 0, icon: `...` },
    // ← NUEVO: Asociar Vehículo
    { label: 'Asociar Vehículo', route: '/admin/vehicle-assign', badge: 0, icon: `...` },
    // ← NUEVO: Historial
    { label: 'Historial', route: '/admin/vehicle-history', badge: 0, icon: `...` },
    { label: 'Diagnóstico', route: '/admin/diagnosis', badge: 0, icon: `...` }, // ← agregar
    { label: 'Servicios', route: '/admin/servicios', badge: 0, icon: `...` },
    { label: 'Reportes', route: '/admin/reportes', badge: 0, icon: `...` },
  ];
}