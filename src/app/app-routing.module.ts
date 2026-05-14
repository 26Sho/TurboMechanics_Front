import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { RecoverPasswordComponent } from './features/auth/pages/recover-password/recover-password.component';
import { HomeComponent } from './components/home/home.component';

import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { mechanicGuard } from './core/guards/mechanic.guard';

import { WorkOrderComponent } from './features/auth/pages/work-order/work-order.component';
import { VehicleComponent } from './features/auth/pages/vehicle/vehicle.component';
import { VehicleHistoryComponent } from './features/auth/pages/vehicle-history/vehicle-history.component';
import { TechnicalDiagnosisComponent } from './features/auth/pages/technical-diagnosis/technical-diagnosis.component';

import { LayoutComponent } from './features/admin/layout/layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { ClientsComponent } from './features/admin/clients/clients.component';
import { VehiclesComponent } from './features/admin/vehicles/vehicles.component';
import { OrdersComponent } from './features/admin/orders/orders.component';
import { CatalogoServiciosComponent } from './features/admin/catalogo-servicios/catalogo-servicios.component';
import { InventarioRepuestosComponent } from './features/admin/inventario-repuestos/inventario-repuestos.component';
import { ReportesComponent } from './features/admin/reportes/reportes.component';
import { PaymentMethodsComponent } from './features/admin/payment-methods/payment-methods.component';
import { MovementsComponent } from './features/admin/movements/movements.component';

const routes: Routes = [
  // 🔹 Redirección inicial
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 🔹 Públicas
  { path: 'home', component: HomeComponent },

  // 🔹 Solo NO autenticados
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [noAuthGuard]
  },
  {
    path: 'recover-password',
    component: RecoverPasswordComponent,
    canActivate: [noAuthGuard]
  },

  // 🔹 Usuarios autenticados
  {
    path: 'work-order',
    component: WorkOrderComponent,
    canActivate: [authGuard]
  },
  {
    path: 'vehicles',
    component: VehicleComponent,
    canActivate: [authGuard]
  },
  {
    path: 'vehicle-history',
    component: VehicleHistoryComponent,
    canActivate: [authGuard]
  },
  {
    path: 'diagnosis',
    component: TechnicalDiagnosisComponent,
    canActivate: [mechanicGuard]
  },
  {
    path: 'movements',
    component: MovementsComponent,
    canActivate: [mechanicGuard]
  },

  // 🔹 Panel ADMIN
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'vehicles', component: VehiclesComponent },

      // Admin reutiliza vistas
      { path: 'work-order', component: WorkOrderComponent },
      { path: 'vehicle-assign', component: VehicleComponent },
      { path: 'vehicle-history', component: VehicleHistoryComponent },
      { path: 'diagnosis', component: TechnicalDiagnosisComponent },

      // Rutas de catálogo, inventario y reportes
      { path: 'servicios', component: CatalogoServiciosComponent },
      { path: 'repuestos', component: InventarioRepuestosComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'payment-methods', component: PaymentMethodsComponent },  // ← nuevo
      { path: 'movements', component: MovementsComponent },// ← nuevo


    ]
  },

  // 🔹 Comodín
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }