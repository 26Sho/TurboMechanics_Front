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
    { label: 'Dashboard',       route: '/admin/dashboard',        badge: 0, icon: `<i class="fas fa-chart-bar"></i>` },
    { label: 'Clientes',        route: '/admin/clients',          badge: 0, icon: `<i class="fas fa-users"></i>` },
    { label: 'Orden de Trabajo',route: '/admin/work-order',       badge: 0, icon: `<i class="fas fa-tools"></i>` },
    { label: 'Asociar Vehículo',route: '/admin/vehicle-assign',   badge: 0, icon: `<i class="fas fa-link"></i>` },
    { label: 'Historial',       route: '/admin/vehicle-history',  badge: 0, icon: `<i class="fas fa-history"></i>` },
    { label: 'Diagnóstico',     route: '/admin/diagnosis',        badge: 0, icon: `<i class="fas fa-stethoscope"></i>` },
    { label: 'Servicios',       route: '/admin/servicios',        badge: 0, icon: `<i class="fas fa-cogs"></i>` },
    { label: 'Repuestos',       route: '/admin/repuestos',        badge: 0, icon: `<i class="fas fa-boxes"></i>` },
    { label: 'Ventas Tienda',   route: '/admin/spare-sales',      badge: 0, icon: `<i class="fas fa-shopping-cart"></i>` },
    { label: 'Reportes',        route: '/admin/reportes',         badge: 0, icon: `<i class="fas fa-chart-pie"></i>` },
    { label: 'Mecánicos',       route: '/admin/mecanicos',        badge: 0, icon: `<i class="fas fa-user-cog"></i>` },
    { label: 'Movimientos',     route: '/admin/movements',        badge: 0, icon: `<i class="fas fa-money-bill-wave"></i>` },
    { label: 'Facturación',     route: '/admin/billing',          badge: 0, icon: `<i class="fas fa-file-invoice-dollar"></i>` },
    { label: 'Caja y Reportes', route: '/admin/cashier',          badge: 0, icon: `<i class="fas fa-cash-register"></i>` },
    { label: 'Presupuestos',    route: '/admin/estimates',        badge: 0, icon: `<i class="fas fa-file-signature"></i>` },
    { label: 'Citas',           route: '/admin/appointments',     badge: 0, icon: `<i class="fas fa-calendar-check"></i>` },
    { label: 'Vehículos',       route: '/admin/vehiculos-cliente',badge: 0, icon: `<i class="fas fa-car"></i>` },
    { label: 'Garantías',       route: '/admin/garantias',        badge: 0, icon: `<i class="fas fa-shield-alt"></i>` },
    { label: 'Reseñas',         route: '/admin/resenas',          badge: 0, icon: `<i class="fas fa-star"></i>` },
    { label: 'WhatsApp',        route: '/admin/whatsapp',         badge: 0, icon: `<i class="fab fa-whatsapp"></i>` },
  ];

  closeMobile(): void {
    this.sidebarService.closeMobile();
  }
}