import { Component } from '@angular/core';

import { SidebarService } from '../../service/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  constructor(
    public sidebarService: SidebarService
  ) {}

  navItems = [

    {
      label: 'Dashboard',

      route: '/mechanic/dashboard',

      icon: `
        <i class="fas fa-chart-bar"></i>
      `
    },

    {
      label: 'Órdenes',

      route: '/mechanic/orders',

      badge: 12,

      icon: `
        <i class="fas fa-tools"></i>
      `
    },

    {
      label: 'Vehículos',

      route: '/mechanic/vehicles',

      icon: `
        <i class="fas fa-car"></i>
      `
    },

    {
      label: 'Reparaciones',

      route: '/mechanic/repairs',

      icon: `
        <i class="fas fa-wrench"></i>
      `
    },

  ];

}