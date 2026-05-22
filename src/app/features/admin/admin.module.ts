import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


// COMPONENTES
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientsComponent } from './clients/clients.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { OrdersComponent } from './orders/orders.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { CatalogoServiciosComponent } from './catalogo-servicios/catalogo-servicios.component';
import { InventarioRepuestosComponent } from './inventario-repuestos/inventario-repuestos.component';
import { ReportesComponent } from './reportes/reportes.component';
import { MecanicosComponent } from './mecanicos/mecanicos.component';



import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { MovementsComponent } from './movements/movements.component';
import { BillingComponent } from './billing/billing.component';
import { CashierComponent } from './cashier/cashier.component';
import { EstimatesComponent } from './estimates/estimates.component';
import { AppointmentsComponent } from './appointments/appointments.component';

@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    ClientsComponent,
    VehiclesComponent,
    OrdersComponent,
    SidebarComponent,
    TopbarComponent,
    CatalogoServiciosComponent,
    InventarioRepuestosComponent,
    ReportesComponent,
    MecanicosComponent,
    PaymentMethodsComponent,
    MovementsComponent,
    BillingComponent,
    CashierComponent,
    EstimatesComponent,
    AppointmentsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class AdminModule { }