import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientsComponent } from './clients/clients.component';
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
import { GarantiasComponent } from './garantias/Garantias.component';
import { ResenasAdminComponent } from './resenas/resenas.component';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { PerfilComponent } from '../shared/perfil/perfil.component';
import { AdminVehiculosClienteComponent } from './vehiculos-cliente/vehiculos-cliente.component';
import { SpareSalesComponent } from './spare-sales/spare-sales.component';

@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    ClientsComponent,
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
    AppointmentsComponent,
    GarantiasComponent,
    ResenasAdminComponent,
    WhatsappComponent,
    PerfilComponent,
    AdminVehiculosClienteComponent,
    SpareSalesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    PerfilComponent,
    MovementsComponent,
    AppointmentsComponent
  ]
})
export class AdminModule { }