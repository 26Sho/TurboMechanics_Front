import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClientsComponent } from './clients/clients.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { OrdersComponent } from './orders/orders.component';
@NgModule({
  declarations: [
    ClientsComponent,
    DashboardComponent,
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    OrdersComponent,
    VehiclesComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [SidebarComponent, TopbarComponent, LayoutComponent]
})
export class AdminModule { }