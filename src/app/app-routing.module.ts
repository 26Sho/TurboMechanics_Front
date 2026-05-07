import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { RecoverPasswordComponent } from './features/auth/pages/recover-password/recover-password.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { WorkOrderComponent } from './features/auth/pages/work-order/work-order.component';
import { VehicleComponent } from './features/auth/pages/vehicle/vehicle.component';
import { LayoutComponent } from './features/admin/layout/layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { ClientsComponent } from './features/admin/clients/clients.component';
import { OrdersComponent } from './features/admin/orders/orders.component';
import { VehiclesComponent } from './features/admin/vehicles/vehicles.component';

const routes: Routes = [
  // Rutas públicas
  { path: '',                  component: HomeComponent },
  { path: 'home',              component: HomeComponent },

  // Rutas solo para NO autenticados
  { path: 'login',             component: AuthComponent,            canActivate: [noAuthGuard] },
  { path: 'recover-password',  component: RecoverPasswordComponent, canActivate: [noAuthGuard] },

  // Rutas protegidas para usuarios autenticados
  { path: 'work-order',        component: WorkOrderComponent,       canActivate: [authGuard] },
  { path: 'vehicles',          component: VehicleComponent,         canActivate: [authGuard] },

  // Rutas del panel admin (solo rol 3)
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients',   component: ClientsComponent },
      { path: 'orders',    component: OrdersComponent },
      { path: 'vehicles',  component: VehiclesComponent },
    ]
  },

  // Comodín
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }