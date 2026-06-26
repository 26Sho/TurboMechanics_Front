import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { RecoverPasswordComponent } from './features/auth/pages/recover-password/recover-password.component';
import { HomeComponent } from './components/home/home.component';

import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { mechanicGuard } from './core/guards/mechanic.guard';
import { clientGuard } from './core/guards/client.guard';

import { WorkOrderComponent } from './features/auth/pages/work-order/work-order.component';
import { VehicleComponent } from './features/auth/pages/vehicle/vehicle.component';
import { VehicleHistoryComponent } from './features/auth/pages/vehicle-history/vehicle-history.component';
import { TechnicalDiagnosisComponent } from './features/auth/pages/technical-diagnosis/technical-diagnosis.component';

import { LayoutComponent } from './features/admin/layout/layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { ClientsComponent } from './features/admin/clients/clients.component';
import { CatalogoServiciosComponent } from './features/admin/catalogo-servicios/catalogo-servicios.component';
import { InventarioRepuestosComponent } from './features/admin/inventario-repuestos/inventario-repuestos.component';
import { ReportesComponent } from './features/admin/reportes/reportes.component';
import { MecanicosComponent } from './features/admin/mecanicos/mecanicos.component';
import { PaymentMethodsComponent } from './features/admin/payment-methods/payment-methods.component';
import { MovementsComponent } from './features/admin/movements/movements.component';
import { BillingComponent } from './features/admin/billing/billing.component';
import { CashierComponent } from './features/admin/cashier/cashier.component';
import { EstimatesComponent } from './features/admin/estimates/estimates.component';
import { AppointmentsComponent } from './features/admin/appointments/appointments.component';
import { AppointmentsComponent as ClientAppointmentsComponent } from './features/auth/pages/appointments/appointments.component';
import { GarantiasComponent } from './features/admin/garantias/Garantias.component';
import { ResenasAdminComponent } from './features/admin/resenas/resenas.component';
import { MaintenanceTrackingComponent } from './features/auth/pages/maintenance-tracking/maintenance-tracking.component';
import { EstimateApproveComponent } from './features/auth/pages/estimate-approve/estimate-approve.component';
import { EstimateRejectComponent } from './features/auth/pages/estimate-reject/estimate-reject.component';
import { WhatsappComponent } from './features/admin/whatsapp/whatsapp.component';
import { ClientBillsComponent } from './features/auth/pages/client-bills/client-bills.component';
import { PerfilComponent } from './features/shared/perfil/perfil.component';
import { MisVehiculosComponent } from './features/auth/pages/mis-vehiculos/mis-vehiculos.component';
import { AdminVehiculosClienteComponent } from './features/admin/vehiculos-cliente/vehiculos-cliente.component';
import { SpareSalesComponent } from './features/admin/spare-sales/spare-sales.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  { path: 'estima-confirmation/:token/aprobar', component: EstimateApproveComponent },
  { path: 'estima-confirmation/:token/rechazar', component: EstimateRejectComponent },

  { path: 'login', component: AuthComponent, canActivate: [noAuthGuard] },
  { path: 'recover-password', component: RecoverPasswordComponent, canActivate: [noAuthGuard] },

  { path: 'work-order', component: WorkOrderComponent, canActivate: [authGuard] },
  { path: 'vehicles', component: VehicleComponent, canActivate: [authGuard] },
  { path: 'vehicle-history', component: VehicleHistoryComponent, canActivate: [authGuard] },
  { path: 'diagnosis', component: TechnicalDiagnosisComponent, canActivate: [mechanicGuard] },
  { path: 'movements', component: MovementsComponent, canActivate: [mechanicGuard] },

  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'work-order', component: WorkOrderComponent },
      { path: 'vehicle-assign', component: VehicleComponent },
      { path: 'vehicle-history', component: VehicleHistoryComponent },
      { path: 'diagnosis', component: TechnicalDiagnosisComponent },
      { path: 'servicios', component: CatalogoServiciosComponent },
      { path: 'repuestos', component: InventarioRepuestosComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'mecanicos', component: MecanicosComponent },
      { path: 'payment-methods', component: PaymentMethodsComponent },
      { path: 'movements', component: MovementsComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'cashier', component: CashierComponent },
      { path: 'estimates', component: EstimatesComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'garantias', component: GarantiasComponent },
      { path: 'resenas', component: ResenasAdminComponent },
      { path: 'whatsapp', component: WhatsappComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'vehiculos-cliente', component: AdminVehiculosClienteComponent },
      { path: 'spare-sales', component: SpareSalesComponent },
    ]
  },

  { path: 'appointments', component: ClientAppointmentsComponent, canActivate: [clientGuard] },
  { path: 'maintenance', component: MaintenanceTrackingComponent, canActivate: [clientGuard] },
  { path: 'my-bills', component: ClientBillsComponent, canActivate: [clientGuard] },
  { path: 'mis-vehiculos', component: MisVehiculosComponent, canActivate: [clientGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [clientGuard] },

  {
    path: 'mechanic',
    loadChildren: () =>
      import('./features/mechanic/mechanic.module').then(m => m.MechanicModule),
    canActivate: [mechanicGuard]
  },

  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }