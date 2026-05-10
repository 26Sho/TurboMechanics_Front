import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClientsComponent }   from './clients/clients.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent }    from './layout/layout.component';
import { SidebarComponent }   from './layout/sidebar/sidebar.component';
import { TopbarComponent }    from './layout/topbar/topbar.component';
import { OrdersComponent }    from './orders/orders.component';
import { VehiclesComponent }  from './vehicles/vehicles.component';

import { CatalogoServiciosComponent }   from './catalogo-servicios/catalogo-servicios.component';
import { InventarioRepuestosComponent } from './inventario-repuestos/inventario-repuestos.component';
import { ReportesComponent }            from './reportes/reportes.component';

@NgModule({
  declarations: [
    ClientsComponent,
    DashboardComponent,
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    OrdersComponent,
    VehiclesComponent,
    CatalogoServiciosComponent,
    InventarioRepuestosComponent,
    ReportesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [SidebarComponent, TopbarComponent, LayoutComponent]
})
export class AdminModule { }