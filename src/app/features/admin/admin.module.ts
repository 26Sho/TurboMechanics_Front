import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// COMPONENTES
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientsComponent } from './clients/clients.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { OrdersComponent } from './orders/orders.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';

@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    ClientsComponent,
    VehiclesComponent,
    OrdersComponent,
    SidebarComponent,
    TopbarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class AdminModule { }